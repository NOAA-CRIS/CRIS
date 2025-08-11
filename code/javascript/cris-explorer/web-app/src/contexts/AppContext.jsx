// Framework and third-party non-ui
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js';
import * as geometryJsonUtils from '@arcgis/core/geometry/support/jsonUtils.js';
// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import AppConfig from '../constants/AppConfig.json';
import DataDictionary from '../constants/DataDictionary.json';
import MapSymbols from '../constants/MapSymbols.json';

import {
    updateMapLayers,
    enableMapCompare,
    disableMapCompare,
    selectStandardGeography,
    getLayerView,
    generateRendererJSON,
} from '../utilities/mapUtils';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [t] = useTranslation();
    // Top level data selectors
    const [geoId, setGeoId] = useState();
    const [geoName, setGeoName] = useState();
    const [geoGeometry, setGeoGeometry] = useState();
    const [geoType, setGeoType] = useState(DataDictionary.geoTypes.county);
    const [indicator, setIndicator] = useState(DataDictionary.indicators.TMAX);
    const [vizType, setVizType] = useState(DataDictionary.vizTypes.map);
    const [showSecondaryControls, setShowSecondaryControls] = useState(true);

    // Tabbed selectors
    const [tabbedValues, setTabbedValues] = useState([
        {
            decade: 2050,
            decadeType: DataDictionary.decadeTypes.FUTURE,
            indicatorFieldName: 'CDD_SSP245_MEAN',
            scenario: DataDictionary.scenarios.SSP245,
            statistic: DataDictionary.statistics.MEAN,
            modelSet: DataDictionary.modelSets['LOCA2-STAR'],
            model: DataDictionary.models.Ensemble,
            grid: DataDictionary.grids.LIVNEH,
            where: `${AppConfig.fieldNames.decade} = ${2050} AND ${AppConfig.fieldNames.modelSet} = '${
                DataDictionary.modelSets['LOCA2-STAR']
            }' AND ${AppConfig.fieldNames.model} = '${DataDictionary.models.Ensemble}'`,
        },
    ]);
    const [selectedTab, setSelectedTab] = useState(0);

    const [tabbedRenderers, setTabbedRenderers] = useState([null, null]);
    // JSON String used for change detection of the selected "tabbedValues"
    const [previousValuesString, setPreviousValuesString] = useState(JSON.stringify(tabbedValues[0]));

    const [mapCompareEnabled, setMapCompareEnabled] = useState(false);
    const [dataUpdating, setDataUpdating] = useState(false);

    const [chart, setChart] = useState();
    const [mapView, setMapView] = useState();
    const [searchResult, setSearchResult] = useState(null);

    const [chartFeatures, setChartFeatures] = useState({
        [DataDictionary.decadeTypes.FUTURE]: [],
        [DataDictionary.decadeTypes.PAST_MODELED]: [],
        [DataDictionary.decadeTypes.PAST_OBSERVED]: [],
    });

    const [alertInfo, setAlertInfo] = useState();

    const updateMapView = async (view) => {
        setMapView(view);
    };

    const updateGeoDetails = useCallback(
        ({ feature }) => {
            if (feature?.geometry) {
                selectStandardGeography({
                    decadeType: tabbedValues[selectedTab].decadeType,
                    geoType,
                    layerViews: mapView.allLayerViews,
                    feature: feature,
                }).then(
                    (feature) => {
                        const name = feature.attributes[AppConfig.fieldNames.name];
                        setGeoName(name);
                        setGeoId(feature.attributes[AppConfig.fieldNames.geoId]);
                        setGeoGeometry({ ...feature.geometry.toJSON(), type: 'polygon' });
                    },
                    (error) => {
                        console.warn(error);
                        setGeoGeometry(null);
                        setGeoId(null);
                        setGeoName(null);
                        setAlertInfo({
                            message: t('Messages.locationCleared', {
                                geoType: t(`DataDictionary.geoTypes.${geoType}`),
                            }),
                            type: 'info',
                        });
                    }
                );
            } else {
                setGeoGeometry(null);
                setGeoId(null);
                setGeoName(null);
                console.error('invalid feature geometry');
            }
        },
        [geoType, mapView?.allLayerViews, selectedTab, tabbedValues, t]
    );
    const updateSearchResult = useCallback(
        (value) => {
            if (!mapView) {
                return;
            }
            setSearchResult(value);
            if (!value || value === 'CLEAR') {
                mapView.graphics.removeAll();
                setGeoId(null);
                setGeoGeometry(null);
                setGeoName(null);
            } else if (value?.result?.feature) {
                updateGeoDetails({ feature: value.result.feature });
            }
        },
        [mapView, updateGeoDetails]
    );

    useEffect(
        /**
         * This code is responsible for adding the selected graphic on the map
         * When geoGeometry is set, the graphic is added to the mapView.
         *
         * Logic includes removing the graphic as needed.ß
         */
        () => {
            if (mapView) {
                mapView.graphics.removeAll();
                if (geoGeometry) {
                    const graphic = {
                        geometry: geoGeometry,
                        symbol: MapSymbols.aoi,
                    };
                    mapView.graphics.add(graphic);
                    // Zoom to the selected feature

                    reactiveUtils
                        .whenOnce(() => mapView.stationary)
                        .then(() => {
                            setTimeout(() => {
                                mapView.goTo({
                                    target: geometryJsonUtils.fromJSON(geoGeometry).extent.expand(2),
                                });
                            }, 300);
                        });
                }
                if (searchResult?.result?.feature) {
                    mapView.graphics.add({
                        geometry: searchResult.result.feature.geometry,
                        symbol: MapSymbols.searchPoint,
                    });
                }
            }
        },
        [geoGeometry, mapView, searchResult]
    );

    useEffect(
        /**
         * When the app loads the first time with a valid MapView
         * Execute the updateMapLayers Logic to ensure the webmap doesn't introduce rendering errors
         * This also primes the tabbedRenderers array with the correct value.
         */
        () => {
            if (mapView) {
                mapView.when(() => {
                    const updatingWatchHandle = reactiveUtils.watch(
                        () => mapView.updating,
                        () => {
                            if (!mapView.updating) {
                                updatingWatchHandle.remove();
                                // set the initial renderer
                                setDataUpdating(true);
                                updateMapLayers({
                                    mapView,
                                    geoType,
                                    t,
                                    tabbedValues,
                                    selectedTab,
                                    setGeoId,
                                    setGeoName,
                                    setGeoGeometry,
                                    updateSearchResult,
                                })
                                    .then((rendererJSON) => {
                                        setRenderer(rendererJSON, selectedTab);
                                        // Use reactiveUtils to await layer updates, then set dataUpdating to false
                                        reactiveUtils.watch(
                                            // getValue function
                                            () => !mapView.updating,
                                            // callback
                                            (notUpdating) => {
                                                if (notUpdating) {
                                                    setDataUpdating(false);
                                                }
                                            }
                                        );
                                    })
                                    .catch((error) => {
                                        console.error('Error setting renderer:', error);
                                        setAlertInfo({
                                            type: 'error',
                                            message: t('App.errors.map.renderer'),
                                        });
                                    });
                            }
                        }
                    );
                });
            }
        },
        // I only want this code called once we have the mapView
        // I'm trying to set the Renderer to the default values

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mapView]
    );

    useEffect(
        /**
         * This useEffect will add/update the indicatorFieldName and where properties of tabbedValues items
         * Both indicatorFieldName & where are different for the decadeType.
         */
        () => {
            const { indicatorFieldName, decade, decadeType, grid, model, modelSet, scenario, statistic, where } =
                tabbedValues[selectedTab];

            let name;
            if (decadeType === DataDictionary.decadeTypes.PAST_OBSERVED) {
                name = `${indicator}_${grid}_${statistic}`;
            } else if (decadeType === DataDictionary.decadeTypes.PAST_MODELED) {
                name = `${indicator}_${statistic}`;
            }
            if (decadeType === DataDictionary.decadeTypes.FUTURE) {
                name = `${indicator}_${scenario}_${statistic}`;
            }
            if (name !== indicatorFieldName) {
                setTabbedValues(
                    tabbedValues.map((item, idx) => {
                        if (selectedTab === idx) {
                            item.indicatorFieldName = name;
                        }
                        return item;
                    })
                );
            }

            let whereClause = `${AppConfig.fieldNames.decade} = ${decade}`;
            if (
                decadeType === DataDictionary.decadeTypes.FUTURE ||
                decadeType === DataDictionary.decadeTypes.PAST_MODELED
            ) {
                whereClause = `${AppConfig.fieldNames.decade} = ${decade} AND ${AppConfig.fieldNames.modelSet} = '${modelSet}' AND ${AppConfig.fieldNames.model} = '${model}'`;
            }
            if (whereClause !== where) {
                setTabbedValues(
                    tabbedValues.map((item, idx) => {
                        if (selectedTab === idx) {
                            item.where = whereClause;
                        }
                        return item;
                    })
                );
            }
        },
        [indicator, selectedTab, tabbedValues]
    );

    useEffect(() => {
        if (mapView) {
            mapView.popup.close();
        }
    }, [mapView, selectedTab]);

    const setRenderer = useCallback(
        (renderer, index) => {
            setTabbedRenderers(
                tabbedRenderers.map((item, idx) => {
                    if (index === idx) {
                        return renderer;
                    }
                    return item;
                })
            );
        },
        [tabbedRenderers, setTabbedRenderers]
    );

    useDebouncedEffect(
        /**
         * useEffect is debounced, as the app triggers a lot of changes all at once.
         *
         * updateMapLayers is a function that turns on the correct webmap layer and sets the renderer.
         *
         * @returns
         */
        () => {
            if (mapCompareEnabled) {
                // this use effect is not for compare / swipe mode.
                return;
            }
            // update the map layer and save the renderer for later use by Compare / Swipe
            const values = tabbedValues[selectedTab];
            values.geoType = geoType;
            const valuesString = JSON.stringify(values);
            if (valuesString === previousValuesString) {
                return;
            }
            if (mapView) {
                setPreviousValuesString(valuesString);
                setDataUpdating(true);
                updateMapLayers({
                    mapView,
                    geoType,
                    t,
                    tabbedValues,
                    selectedTab,
                    setGeoId,
                    setGeoName,
                    setGeoGeometry,
                    updateSearchResult,
                })
                    .then((rendererJSON) => {
                        if (searchResult?.result?.feature) {
                            updateGeoDetails({ feature: searchResult.result.feature });
                        }
                        setRenderer(rendererJSON, selectedTab);
                        // Use reactiveUtils to await layer updates completion, then set dataUpdating to false
                        reactiveUtils.watch(
                            // getValue function
                            () => !mapView.updating,
                            // callback
                            (notUpdating) => {
                                if (notUpdating) {
                                    setDataUpdating(false);
                                }
                            }
                        );
                    })
                    .catch((error) => {
                        console.error('Error setting renderer:', error);
                        setAlertInfo({
                            type: 'error',
                            message: t('App.errors.map.renderer'),
                        });
                    });
            }
        },
        [
            geoType,
            mapCompareEnabled,
            mapView,
            previousValuesString,
            selectedTab,
            setRenderer,
            t,
            tabbedValues,
            searchResult,
        ],
        300
    );

    useEffect(() => {
        if (!mapCompareEnabled) {
            //this use effect is only for mapCompareEnabled = true
            return;
        }

        enableMapCompare({
            tabbedValues,
            tabbedRenderers,
            mapView,
            geoType,
            t,
            indicator,
            selectedTab,
            setGeoId,
            setGeoName,
            setGeoGeometry,
            updateSearchResult,
        });
    }, [
        geoType,
        indicator,
        mapCompareEnabled,
        mapView,
        selectedTab,
        t,
        tabbedRenderers,
        tabbedValues,
        updateSearchResult,
    ]);

    useEffect(
        /**
         * This use effect is for the following use case:
         * 1. Multiple Map tabs are enabled.
         * 2. The user changes the Geography Type (County, Tribal Area, or HUC)
         * 3. We need to update the hidden tab's renderer class breaks for the new Geography Type
         * 4. We do this so when the compare mode is enabled we can pull from the renderer's array
         *
         * @returns
         */
        () => {
            if (mapView && tabbedValues?.length > 1) {
                const otherTab = selectedTab === 0 ? 1 : 0;
                const { decadeType, indicatorFieldName, where } = tabbedValues[otherTab];
                const otherGeoType = tabbedValues[otherTab].geoType;

                if (otherGeoType !== geoType) {
                    const layerView = getLayerView({ decadeType, geoType, layerViews: mapView.allLayerViews });
                    if (!layerView?.layer) {
                        console.warn('empty layer');
                        return;
                    }
                    console.log('getting renderer data for index ', otherTab);
                    generateRendererJSON({ featureLayer: layerView.layer, indicatorFieldName, where }).then(
                        (rendererJSON) => {
                            setRenderer(rendererJSON, otherTab);
                            setTabbedValues(
                                tabbedValues.map((item, idx) => {
                                    if (otherTab === idx) {
                                        item.geoType = geoType;
                                    }
                                    return item;
                                })
                            );
                        }
                    );
                }
            }
        },
        [geoType, mapView, selectedTab, setRenderer, tabbedValues]
    );

    useEffect(() => {
        // Remove Swipe and enable single layer
        if (mapView && !mapCompareEnabled) {
            const values = tabbedValues[selectedTab];
            const { decadeType } = values;
            disableMapCompare({
                mapView,
                decadeType,
                geoType,
            });
        }
    }, [geoType, mapCompareEnabled, mapView, selectedTab, tabbedValues]);

    useEffect(
        /**
         * If the geoType changes.
         * If no location was added via the search widget, clear the geoDetails.
         */
        () => {
            const values = JSON.parse(previousValuesString);
            const previousGeoType = values.geoType;
            // Remove Swipe and enable single layer
            if (previousGeoType !== geoType && !searchResult?.result?.feature) {
                setGeoGeometry(null);
                setGeoId(null);
                setGeoName(null);
            }
        },
        [geoType, previousValuesString, searchResult?.result?.feature]
    );

    useEffect(
        /**
         * If the Alert info is about selecting a location.
         * Auto close if location is selected.
         */
        () => {
            if (geoId) {
                if (
                    alertInfo?.message ===
                    t('Messages.invalidLocation', { geoType: t(`DataDictionary.geoTypes.${geoType}`) })
                ) {
                    setAlertInfo(null);
                }
            }
        },
        [alertInfo?.message, geoId, geoType, t]
    );

    return (
        <AppContext.Provider
            value={{
                geoId,
                setGeoId,

                geoName,
                setGeoName,

                geoType,
                setGeoType,

                indicator,
                setIndicator,

                vizType,
                setVizType,

                showSecondaryControls,
                setShowSecondaryControls,

                tabbedValues,
                setTabbedValues,
                selectedTab,
                setSelectedTab,

                tabbedRenderers,

                mapCompareEnabled,
                setMapCompareEnabled,

                mapView,
                updateMapView,

                chart,
                setChart,

                chartFeatures,
                setChartFeatures,

                alertInfo,
                setAlertInfo,

                dataUpdating,
                setDataUpdating,

                searchResult,
                updateSearchResult,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const appContext = useContext(AppContext);
    if (!appContext) throw new Error(`Cannot use 'useAppContext' outside of a AppContextProvider`);
    return appContext;
};
