// Framework and third-party non-ui
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import * as rendererJsonUtils from '@arcgis/core/renderers/support/jsonUtils';
import Color from '@arcgis/core/Color';

// Hooks, context, and constants
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';
import MapSymbols from '../../constants/MapSymbols';

// utilites
import { getLocalIndicatorVisualVariable, setLayerVisibilityByItemId } from '../../utilities/arcgisUtils';

// App components
import HazardSelect from '../../components/HazardSelect';
import IndicatorSelect from '../../components/IndicatorSelect';
import TimeframeSelect from '../../components/TimeframeSelect';
import ModelSelect from '../../components/ModelSelect/ModelSelect';
import IndicatorValueCard from '../../components/IndicatorValueCard';

// Component specific modules (Component-styled, etc.)
import './ExploreMapPage.scss';

// Third-party components (buttons, icons, etc.)

// Images
import ExtremeTemperatureIcon from '../../images/hazard_icons/extreme_temperature.png';
import DroughtIcon from '../../images/hazard_icons/drought.png';
import FireIcon from '../../images/hazard_icons/fire.png';
import FloodingCostalIcon from '../../images/hazard_icons/flooding_costal.png';
import FloodingInlandIcon from '../../images/hazard_icons/flooding_inland.png';
import AppRoutes from '../../constants/AppRoutes';

const ExploreMapPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const {
        config,
        standardGeography,
        dataLayerView,
        countiesLayerView,
        tractsLayerView,
        aiannhaLayerView,
        selectedHazard,
        updateSelectedHazard,
        selectedIndicator,
        setSelectedIndicator,
        indicators,
        selectedModel,
        timeframe,
        setTimeframe,
        mapView,
        setLegendInfo,
        setShowMapLoading,
        setAlertInfo,
        indicatorGeometry,
        areaOfInterest,
    } = useAppContext();

    const [indicatorFieldName, setIndicatorFieldName] = useState();
    const [rendererJSON, setRendererJSON] = useState();
    const [layerItemIdsCSV, setLayerItemIdsCSV] = useState('');
    const [indicatorColor, setIndicatorColor] = useState();

    useEffect(() => {
        if (areaOfInterest) {
            if (aiannhaLayerView) {
                aiannhaLayerView.layer.renderer = MapSymbols.emptyRenderer;
            }
        } else {
            if (standardGeography === ScreeningData.standardGeographies.aiannha) {
                if (aiannhaLayerView) {
                    aiannhaLayerView.layer.renderer = MapSymbols.emptyRenderer;
                }
            } else {
                navigate(AppRoutes.search.path);
            }
        }
    }, [aiannhaLayerView, areaOfInterest, navigate, standardGeography]);

    useEffect(() => {
        if (!dataLayerView) {
            return;
        }
        if (!rendererJSON) {
            dataLayerView.layer.renderer = MapSymbols.emptyRenderer;
            countiesLayerView.layer.renderer = MapSymbols.emptyRenderer;
            tractsLayerView.layer.renderer = MapSymbols.emptyRenderer;
            return;
        }
        countiesLayerView.layer.set('visible', false);
        aiannhaLayerView.layer.set('visible', false);
        tractsLayerView.layer.set('visible', false);
        dataLayerView.layer.visible = true;
        dataLayerView.layer.renderer = rendererJsonUtils.fromJSON(rendererJSON);
    }, [aiannhaLayerView, countiesLayerView, dataLayerView, rendererJSON, setLegendInfo, t, tractsLayerView]);

    const popupTitle = useMemo(() => {
        const { county, tract, aiannha, countyNameField, stateAbbrField, aiannhaNameField } =
            ScreeningData.standardGeographies;

        if (standardGeography === county) {
            return `{${countyNameField}}, {${stateAbbrField}}`;
        }
        if (standardGeography === tract) {
            return `Tract within {${countyNameField}}, {${stateAbbrField}}`;
        }
        if (standardGeography === aiannha) {
            return `{${aiannhaNameField}}`;
        }

        return '';
    }, [standardGeography]);

    useEffect(() => {
        if (!dataLayerView) return;

        if (!rendererJSON || !selectedIndicator?.id) {
            dataLayerView.layer.popupTemplate = null;
            mapView?.popup.close();
            setLegendInfo(null);
            return;
        }
        const field = rendererJSON.field;
        const indicatorId = selectedIndicator?.id;
        // update popup
        const fieldInfos = [
            {
                fieldName: field,
                format: {
                    digitSeparator: true,
                    places: 1,
                },
            },
        ];
        const indicator = (attr) => t(`Indicators.${indicatorId}.${attr}`);

        const popupContent = `
            <h1>${indicator('Prefix')} {${field}} ${indicator('Postfix')}<h1>
            <p>${indicator('Title')}</p>
        `;

        if (mapView?.popup) {
            mapView.popup.content = popupContent;
            mapView.popup.title = popupTitle;
            mapView.popup.fieldInfos = fieldInfos;
        }
        dataLayerView.layer.popupTemplate = {
            title: popupTitle,
            outFields: ['*'],
            content: popupContent,
            fieldInfos,
        };
    }, [selectedIndicator?.id, dataLayerView, mapView, popupTitle, rendererJSON, setLegendInfo, t]);

    // on standard geography change
    useEffect(() => {
        // clear renderer to prevent flicker
        // I haven't verified this isn't a race condition
        if (standardGeography) {
            setRendererJSON(null);
            mapView?.popup.close();
            setIndicatorColor(null);
        }
    }, [mapView?.popup, standardGeography]);

    // Selection Change: hazard, indicator, timeframe, model
    useEffect(() => {
        if (!selectedHazard) {
            updateSelectedHazard(ScreeningData.hazards[0].id);
        } else if (!selectedIndicator && indicators && indicators?.length) {
            setSelectedIndicator(indicators[0]);
        }

        if (!timeframe) {
            setTimeframe(ScreeningData.timeframe.early);
        }

        if (selectedHazard && selectedIndicator && selectedModel && timeframe) {
            if (selectedIndicator.specialCase && !selectedIndicator.timeframes) {
                setIndicatorFieldName(null);
            } else {
                const notHistoric = timeframe !== ScreeningData.timeframe.historic;
                let modelTimeframe = timeframe;
                if (notHistoric) {
                    modelTimeframe = selectedModel + modelTimeframe;
                }
                let renderField = modelTimeframe + '_MEAN_' + selectedIndicator.id;
                setIndicatorFieldName(renderField);
            }
        }
    }, [
        indicators,
        selectedHazard,
        selectedIndicator,
        selectedModel,
        updateSelectedHazard,
        setSelectedIndicator,
        setTimeframe,
        timeframe,
    ]);

    // Init Indicator
    useEffect(() => {
        if (!selectedIndicator && indicators && indicators?.length) {
            setSelectedIndicator(indicators[0]);
        }
    }, [indicators, selectedIndicator, setSelectedIndicator]);

    const updateRenderer = useCallback(async () => {
        try {
            const timeoutId = setTimeout(() => {
                setShowMapLoading(true);
            }, 500);
            // hide special layers
            if (layerItemIdsCSV) {
                const layerItemIds = layerItemIdsCSV.split(',');
                setLayerVisibilityByItemId(mapView, layerItemIds, false);
                setLayerItemIdsCSV(null);
            }
            const visualVariable = await getLocalIndicatorVisualVariable(
                mapView,
                dataLayerView,
                selectedIndicator,
                config.rendererDataExtentFactor
            );
            setLegendInfo({
                colors: visualVariable.stops.map((stop) => stop.color),
            });
            // get the template renderer from comfig and update field
            let renderer = { ...config.renderer, field: indicatorFieldName };
            // add color visual variable for selcted indicator
            let vv = { ...visualVariable, field: indicatorFieldName };
            renderer.visualVariables.push(vv);

            try {
                const indicatorKey = indicatorFieldName.replace('_' + selectedIndicator.id, '');
                const value = selectedIndicator[indicatorKey];

                const { stops } = visualVariable;
                let match = stops[0];
                for (var i = stops.length - 1; i > -1; i--) {
                    const stop = stops[i];
                    if (value >= stop.value) {
                        match = stop;
                        break;
                    }
                }

                setIndicatorColor(Color.fromArray(match.color).toHex());
            } catch (error) {
                console.error(error);
                setIndicatorColor(null);
            }

            setRendererJSON(renderer);
            clearTimeout(timeoutId);
            setShowMapLoading(false);
        } catch (error) {
            setAlertInfo({
                heading: t('Alert.RenderError.Title'),
                message: t('Alert.RenderError.Message'),
            });
        }
    }, [
        config.renderer,
        config.rendererDataExtentFactor,
        dataLayerView,
        indicatorFieldName,
        layerItemIdsCSV,
        mapView,
        selectedIndicator,
        setAlertInfo,
        setLegendInfo,
        setShowMapLoading,
        t,
    ]);

    const showSpecialCaseLayers = useCallback(async () => {
        try {
            setLegendInfo(null);
            const timeoutId = setTimeout(() => {
                setShowMapLoading(true);
            }, 500);
            setRendererJSON(null);
            setIndicatorColor(null);

            // hide out previous layerItemIds
            if (layerItemIdsCSV) {
                const layerItemIds = layerItemIdsCSV.split(',');

                setLayerVisibilityByItemId(mapView, layerItemIds, false);
            }
            if (mapView?.popup?.visibleElements?.featureNavigation) {
                mapView.popup.visibleElements.featureNavigation = true;
            }
            // show new layerItems
            if (selectedIndicator.layerIds) {
                setLayerVisibilityByItemId(mapView, selectedIndicator.layerIds, true);
                setLayerItemIdsCSV(selectedIndicator.layerIds.join(','));
                if (selectedIndicator.dataFields) {
                    var pairs = selectedIndicator.dataFields.map((dataField) => ({
                        hex: dataField.color,
                        label: t(`Indicators.${selectedIndicator.id}.${dataField.fieldName}.Name`),
                    }));
                    setLegendInfo({ pairs });
                }
            } else if (indicatorFieldName && selectedIndicator.modelTimeframeLayers) {
                const modelTimeframe = indicatorFieldName?.substring(0, indicatorFieldName.indexOf('_'));
                const itemId = selectedIndicator.modelTimeframeLayers[modelTimeframe];
                if (itemId) {
                    let itemIds = [itemId];
                    if (selectedIndicator.overlayLayers) {
                        selectedIndicator.overlayLayers.forEach((id) => itemIds.push(id));
                    }
                    setLayerVisibilityByItemId(mapView, itemIds, true);
                    setLayerItemIdsCSV(itemIds.join(','));
                    setIndicatorColor(selectedIndicator.colors[selectedModel]);
                }
                // no real logic to support something other than SLR
                setLegendInfo({
                    pairs: [
                        {
                            hex: selectedIndicator.colors[selectedModel],
                            label: t('Indicators.SLR.Name'),
                        },
                        {
                            hex: selectedIndicator.leveeColor,
                            label: t('Indicators.SLR.LeveeedLegend'),
                        },
                    ],
                });
            } else {
                setLayerItemIdsCSV(null);
            }
            clearTimeout(timeoutId);
            setShowMapLoading(false);
        } catch (error) {
            console.error(error);
            setAlertInfo({
                heading: t('Alert.RenderError.Title'),
                message: t('Alert.RenderError.Message'),
            });
        }
    }, [
        selectedIndicator,
        selectedModel,
        setAlertInfo,
        setLegendInfo,
        setShowMapLoading,
        t,
        indicatorFieldName,
        layerItemIdsCSV,
        mapView,
    ]);
    useEffect(() => {
        if (selectedIndicator && mapView?.popup?.visibleElements?.featureNavigation) {
            mapView.popup.visibleElements.featureNavigation = false;
        }
    }, [mapView, selectedIndicator]);

    // Indicator changed - show/hide special layers or create new renderer
    useEffect(() => {
        if (selectedIndicator) {
            if (selectedIndicator.specialCase) {
                showSpecialCaseLayers();
            } else if (
                indicatorFieldName?.endsWith('_' + selectedIndicator.id) &&
                (indicatorFieldName.includes(selectedModel) ||
                    indicatorFieldName.includes(ScreeningData.timeframe.historic)) &&
                indicatorGeometry
            ) {
                updateRenderer();
            }
        }
    }, [
        indicatorFieldName,
        indicatorGeometry,
        selectedIndicator,
        selectedModel,
        showSpecialCaseLayers,
        updateRenderer,
    ]);

    const getMetrics = () =>
        selectedIndicator?.dataFields ? (
            <div className="exploreMapPage-value--double grid-row flex-row flex-no-wrap">
                {selectedIndicator?.dataFields.map((field, index) => (
                    <div className="exploreMapPage-value-container exploreMapPage-value-container--double" key={index}>
                        <IndicatorValueCard
                            indicator={selectedIndicator}
                            specialFieldIndex={index}
                            color={field.color}
                        />
                    </div>
                ))}
            </div>
        ) : (
            <div className="exploreMapPage-value-container">
                <IndicatorValueCard
                    indicator={selectedIndicator}
                    timeframe={timeframe}
                    model={selectedModel}
                    statistic={ScreeningData.statistics.mean}
                    color={indicatorColor}
                />
            </div>
        );

    const getHazardIcons = () => {
        switch (selectedHazard) {
            case 'extreme_temperature':
                return <img src={ExtremeTemperatureIcon} alt="Extreme Temperature Icon" />;
            case 'drought':
                return <img src={DroughtIcon} alt="Drought Icon" />;
            case 'fire':
                return <img src={FireIcon} alt="Fire Icon" />;
            case 'flooding_inland':
                return <img src={FloodingInlandIcon} alt="Inland Flooding Icon" />;
            case 'flooding_costal':
                return <img src={FloodingCostalIcon} alt="Costal Flooding Icon" />;
            // no default
        }
    };

    return (
        <div className="exploreMapPage-container">
            <div className="exploreMapPage-container-column exploreMapPage-container--hazard grid-row flex-row flex-no-wrap">
                <HazardSelect />
            </div>
            <div className="exploreMapPage-container-column exploreMapPage-container-column-medium grid-row flex-row flex-no-wrap exploreMapPage-container--indicator">
                <div className="exploreMapPage-hazard-icon-container">{getHazardIcons()}</div>
                <div style={{ position: 'relative', width: '100%' }}>
                    <IndicatorSelect allowSpecialCase={true} />
                    {getMetrics()}
                </div>
            </div>

            {(!selectedIndicator?.specialCase || selectedIndicator.timeframes) && (
                <div className="exploreMapPage-container-column grid-row flex-column flex-no-wrap exploreMapPage-container-model">
                    <TimeframeSelect timeframes={selectedIndicator?.timeframes} />
                    <ModelSelect column={false} />
                </div>
            )}
        </div>
    );
};

export default ExploreMapPage;
