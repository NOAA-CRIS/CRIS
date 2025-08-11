// Framework and third-party non-ui
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../constants/AppRoutes';
import ScreeningData from '../constants/ScreeningData';
import { layerHasData } from '../utilities/arcgisUtils';

// Setter Functions
import {
    _updateAreaOfInterest,
    _updateMapView,
    _updateStandardGeography,
    _updateSelectedHazard,
} from './MapController';

export const AppContext = createContext();

export const AppContextProvider = ({ children, config }) => {
    const [t] = useTranslation();

    const navigate = useNavigate();
    const [appRoute, setAppRoute] = useState(null);
    const [areaOfInterest, setAreaOfInterest] = useState(null);
    const [selectedHazard, setSelectedHazard] = useState(ScreeningData.hazards[0].id);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [lastSelectedIndicatorId, setLastSelectedIndicatorId] = useState(null);
    const [selectedModel, setSelectedModel] = useState(ScreeningData.models.rcp45);
    const [searchResult, setSearchResult] = useState(null);
    const [allIndicators, setAllIndicators] = useState(null);
    const [indicators, setIndicators] = useState(null);
    const [indicatorGeometry, setIndicatorGeometry] = useState(null);
    const [timeframe, setTimeframe] = useState(ScreeningData.timeframe.early);
    const [standardGeography, setStandardGeography] = useState(ScreeningData.standardGeographies.county);
    const [alertInfo, setAlertInfo] = useState();
    const [legendInfo, setLegendInfo] = useState();

    // ----- JSAPI State -----
    const [searchWebmap, setSearchWebmap] = useState(null);
    const [mapView, setMapView] = useState(null);
    const [dataLayerView, setDataLayerView] = useState(null);
    const [aiannhaLayerView, setAiannhaLayerView] = useState(null);
    const [countiesLayerView, setCountiesLayerView] = useState(null);
    const [tractsLayerView, setTractsLayerView] = useState(null);
    const [showMapLoading, setShowMapLoading] = useState(false);

    const handleError = (geography) => {
        console.log('handle error');
        //setAreaOfInterest(null); // keep to show pin on serach page
        setAllIndicators(null);
        setIndicatorGeometry(null);
        setSelectedIndicator(null);
        setSearchResult({ searchTerm: null });

        const { aiannha } = ScreeningData.standardGeographies;

        let messageString = 'default';

        if (geography === aiannha) {
            navigate(AppRoutes.search.path);
            messageString = 'aiannha';
        }
        setAlertInfo({
            heading: t('Alert.NoData.Title'),
            message: t(`Alert.NoData.Message.${messageString}`, {
                standardGeography: t(`Data.StandardGeographies.${geography}`),
            }),
        });
    };

    // JSAPI Setters

    const updateAreaOfInterest = async (aoi) => {
        setIndicatorGeometry(null);

        if (aoi && dataLayerView) {
            const validLocation = await layerHasData(dataLayerView, aoi.geometry);
            if (!validLocation) {
                handleError(standardGeography);
                return;
            }
        }

        // Add mapView to context
        const { indicators, geometry } = await _updateAreaOfInterest({
            areaOfInterest: aoi,
            config,
            dataLayerView,
            mapView,
        });

        setAreaOfInterest(aoi);

        if (lastSelectedIndicatorId && indicators) {
            const matchingIndicator = indicators.find((item) => item.id === lastSelectedIndicatorId);
            setSelectedIndicator(matchingIndicator);
        }

        setAllIndicators(indicators);
        setIndicatorGeometry(geometry);
    };

    const updateMapView = async (mapView, webmap) => {
        setSearchWebmap(webmap);
        // Add mapView to context
        await _updateMapView(
            {
                mapView,
                config,
                setDataLayerView,
                setAiannhaLayerView,
                setCountiesLayerView,
                setTractsLayerView,
                standardGeography,
            },
            setMapView
        );
    };

    const updateStandardGeography = async (value) => {
        const { indicators, geometry } = await _updateStandardGeography(
            {
                value,
                config,
                aiannhaLayerView,
                countiesLayerView,
                tractsLayerView,
                setDataLayerView,
                setAllIndicators,
                setIndicatorGeometry,
                areaOfInterest,
                mapView,
            },
            setStandardGeography
        );
        if (!areaOfInterest) {
            // Change of Standard Geography on Search Page without displaying error
            return;
        }
        if (!geometry) {
            handleError(value);

            return;
        }
        if (lastSelectedIndicatorId) {
            const matchingIndicator = indicators.find((item) => item.id === lastSelectedIndicatorId);
            setSelectedIndicator(matchingIndicator);
        }
        setAllIndicators(indicators);

        setIndicatorGeometry(geometry);
    };

    const updateSelectedHazard = async (value) => {
        await _updateSelectedHazard({ value, setSelectedIndicator }, setSelectedHazard);
    };

    // On Hazard Selection Change
    useEffect(() => {
        if (allIndicators && selectedHazard) {
            const sortIndicators = (a, b) => {
                if (a[selectedHazard] < b[selectedHazard]) {
                    return -1;
                }
                if (a[selectedHazard] > b[selectedHazard]) {
                    return 1;
                }
                return 0;
            };

            const indicators = allIndicators
                .filter((indicator) => indicator[selectedHazard] && indicator[selectedHazard] > 0)
                .sort(sortIndicators);
            setIndicators(indicators);
            if (indicators?.length) {
                let indicator = selectedIndicator
                    ? indicators.find((item) => item.id === selectedIndicator.id)
                    : indicators[0];
                setSelectedIndicator(indicator);
            }
        } else {
            setIndicators(null);
        }
    }, [allIndicators, selectedHazard, selectedIndicator]);

    // On Hazard Selection Change
    useEffect(() => {
        if (selectedIndicator) {
            setLastSelectedIndicatorId(selectedIndicator.id);
            let searchTerm = '';
            if (standardGeography === ScreeningData.standardGeographies.aiannha) {
                searchTerm = selectedIndicator[ScreeningData.standardGeographies.aiannhaNameField];
            } else {
                searchTerm = `${selectedIndicator[ScreeningData.standardGeographies.countyNameField]}, ${
                    selectedIndicator[ScreeningData.standardGeographies.stateAbbrField]
                }`;

                if (standardGeography === ScreeningData.standardGeographies.tract) {
                    searchTerm = 'Tract within ' + searchTerm;
                }
            }

            setSearchResult({
                searchTerm: searchTerm ? searchTerm : '',
            });
        }
    }, [selectedIndicator, standardGeography]);

    // On Hazard Selection Change
    useEffect(() => {
        if (indicatorGeometry) {
            setAlertInfo(null);
        }
    }, [indicatorGeometry]);

    return (
        <AppContext.Provider
            value={{
                config,
                appRoute,
                setAppRoute,
                areaOfInterest,
                updateAreaOfInterest,
                indicatorGeometry,
                searchResult,
                setSearchResult,
                selectedHazard,
                updateSelectedHazard,
                setSelectedHazard,
                indicators,
                selectedIndicator,
                setSelectedIndicator,
                lastSelectedIndicatorId,
                selectedModel,
                setSelectedModel,
                timeframe,
                setTimeframe,
                standardGeography,
                updateStandardGeography,
                alertInfo,
                setAlertInfo,
                legendInfo,
                setLegendInfo,

                showMapLoading,
                setShowMapLoading,

                // JSAPI State
                mapView,
                updateMapView,
                searchWebmap,
                dataLayerView,
                aiannhaLayerView,
                countiesLayerView,
                tractsLayerView,
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
