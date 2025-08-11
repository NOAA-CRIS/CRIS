import Swipe from '@arcgis/core/widgets/Swipe.js';
import Expand from '@arcgis/core/widgets/Expand.js';
import * as rendererJsonUtils from '@arcgis/core/renderers/support/jsonUtils.js';
import * as colorSchemes from '@arcgis/core/smartMapping/symbology/color.js';
import * as colorRendererCreator from '@arcgis/core/smartMapping/renderers/color.js';

import { max, mean, median, min, standardDeviation, sum, variance } from 'simple-statistics';

import AppConfig from '../constants/AppConfig.json';
import DataDictionary from '../constants/DataDictionary.json';
import { colorRamps, rendererTemplate, noDataRender } from '../constants/MapSymbols.json';

import { properCase } from './chart';

// Round the value to one decimal place
export const roundValue = (value) => {
    // If value is not a number, return it as is
    if (typeof value !== 'number') {
        return value;
    } else {
        return value.toFixed(2);
    }
};

/**
 * Generates the content for the popup.
 * @param {Object} attributes - The attributes of the selected feature.
 * @returns {HTMLElement} - The content for the popup.
 */
const generatePopupContent = async ({
    featureLayer,
    attributes,
    geometry,
    t,
    indicatorFieldName,
    mapView,
    setGeoId,
    setGeoName,
    setGeoGeometry,
    updateSearchResult,
}) => {
    const modelSet = attributes[AppConfig.fieldNames.modelSet];
    const model = attributes[AppConfig.fieldNames.model];
    if (modelSet) {
        let statsWhere = `${AppConfig.fieldNames.decade} = ${attributes[AppConfig.fieldNames.decade]} AND ${
            AppConfig.fieldNames.geoId
        } = '${attributes[AppConfig.fieldNames.geoId]}'`;

        if (modelSet !== DataDictionary.modelSets['LOCA2-STAR']) {
            statsWhere += ` AND ${AppConfig.fieldNames.modelSet} = '${modelSet}'`;
        }

        const statsQuery = {
            where: statsWhere,
            groupByFieldsForStatistics: [AppConfig.fieldNames.geoId],
            outStatistics: [
                {
                    statisticType: 'max',
                    onStatisticField: indicatorFieldName,
                    outStatisticFieldName: indicatorFieldName.replace(
                        DataDictionary.statistics.MEAN,
                        DataDictionary.statistics.MAX
                    ),
                },
                {
                    statisticType: 'min',
                    onStatisticField: indicatorFieldName,
                    outStatisticFieldName: indicatorFieldName.replace(
                        DataDictionary.statistics.MEAN,
                        DataDictionary.statistics.MIN
                    ),
                },
            ],
        };

        // Get Min Max from the other models
        const statsResults = await featureLayer.queryFeatures(statsQuery);
        if (statsResults?.features?.length === 1) {
            const statsAttributes = statsResults?.features[0].attributes;
            attributes = { ...attributes, ...statsAttributes };
        }
    }

    const div = document.createElement('div');
    const actions = document.createElement('div');

    // Add classes to the divs
    div.classList.add('popup-content');
    actions.classList.add('popup-actions');

    // Helper function to safely return attribute value or return 'N/A'
    const getAttributeValue = (key) => {
        const value = attributes[key];
        return value !== undefined && value !== null ? roundValue(value) : t('Map.noData');
    };

    const indicator = indicatorFieldName.slice(0, indicatorFieldName.indexOf('_'));
    const fieldNameBase = indicatorFieldName.slice(0, indicatorFieldName.lastIndexOf('_'));

    // Create the content for the popup
    let content = `
        <h1>${properCase(t(`DataDictionary.indicators.${indicator}.Title`))}</h1>
        <h2>${attributes[AppConfig.fieldNames.name]}</h2>
        `;

    if (modelSet) {
        content += `<p>${t(`DataDictionary.models.Ensemble`) + ' ' + t(`DataDictionary.statistics.MAX`)} (${t(
            `DataDictionary.indicators.${indicator}.Postfix`
        )}):<br /><mark>${getAttributeValue(`${fieldNameBase}_${DataDictionary.statistics.MAX}`)}</mark></p>`;
    }
    content += `<p>${model ? t(`DataDictionary.models.${model}`) : '' + ' ' + t(`DataDictionary.statistics.MEAN`)} (${t(
        `DataDictionary.indicators.${indicator}.Postfix`
    )}):<br /><mark>${getAttributeValue(`${fieldNameBase}_${DataDictionary.statistics.MEAN}`)}</mark></p>`;

    if (modelSet) {
        content += `<p>${t(`DataDictionary.models.Ensemble`) + ' ' + t(`DataDictionary.statistics.MIN`)} (${t(
            `DataDictionary.indicators.${indicator}.Postfix`
        )}):<br /><mark>${getAttributeValue(`${fieldNameBase}_${DataDictionary.statistics.MIN}`)}</mark></p>`;
    }

    content += '<br />';

    div.innerHTML = content;

    const popupButtonExplore = document.createElement('button');
    popupButtonExplore.innerText = t('Map.exploreLocation');
    popupButtonExplore.classList.add('usa-button');
    popupButtonExplore.addEventListener('click', () => {
        // Set the geoId to the selected feature's geoId
        updateSearchResult('CLEAR');
        setGeoId(attributes[AppConfig.fieldNames.geoId]);
        setGeoName(attributes[AppConfig.fieldNames.name]);
        setGeoGeometry(geometry);
    });

    const popupButtonClose = document.createElement('button');
    popupButtonClose.innerText = 'Close';
    popupButtonClose.classList.add('usa-button');
    popupButtonClose.addEventListener('click', () => {
        mapView.popup.close();
    });

    // Add buttons to popup-actions div
    actions.append(popupButtonExplore, popupButtonClose);
    // Add popup-actions to popup-content
    div.append(actions);

    return div;
};

export const updateMapLayers = async ({
    mapView,
    geoType,
    t,
    tabbedValues,
    selectedTab,
    setGeoId,
    setGeoName,
    setGeoGeometry,
    updateSearchResult,
}) => {
    const { decadeType, indicatorFieldName, where } = tabbedValues[selectedTab];
    let renderer = undefined;
    console.log('starting map update');
    const layerViews = mapView.allLayerViews;
    setAllDataLayersInvisible(layerViews);
    const activeLayerView = getLayerView({ layerViews, decadeType, geoType });

    if (activeLayerView) {
        renderer = await updateLayerRenderer(activeLayerView, indicatorFieldName, where, t);
        updateLayerPopupContent({
            featureLayer: activeLayerView.layer,
            t,
            indicatorFieldName,
            mapView,
            setGeoId,
            setGeoName,
            setGeoGeometry,
            updateSearchResult,
        });
        activeLayerView.visible = true;
    }
    console.log('finished map update');
    return renderer;
};

export const getLayerView = ({ decadeType, geoType, layerViews }) => {
    let activeLayer = undefined;
    //loop over GeoTypes
    Object.values(DataDictionary.decadeTypes).forEach((dt) => {
        Object.values(DataDictionary.geoTypes).forEach((gt) => {
            try {
                const match = dt === decadeType && gt === geoType;
                const layerTitle = AppConfig.services[gt][dt].title;
                const layerView = layerViews.find((lv) => {
                    return lv.layer.title === layerTitle;
                });
                if (layerView) {
                    if (match) {
                        activeLayer = layerView;
                    }
                }
            } catch (err) {
                // TODO: ADD log error after tribal services are added
            }
        });
    });
    return activeLayer;
};

const setAllDataLayersInvisible = (layerViews) => {
    //loop over GeoTypes
    Object.values(DataDictionary.decadeTypes).forEach((dt) => {
        Object.values(DataDictionary.geoTypes).forEach((gt) => {
            try {
                const layerTitle = AppConfig.services[gt][dt].title;
                const layerView = layerViews.find((lv) => {
                    return lv.layer.title === layerTitle;
                });
                if (layerView) {
                    layerView.visible = false;
                }
            } catch (err) {
                // TODO: ADD log error after tribal services are added
            }
        });
    });
};

const updateLayerRenderer = async (layerView, indicatorFieldName, where, t) => {
    layerView.layer.definitionExpression = where;
    const rendererJSON = await generateRendererJSON({ featureLayer: layerView.layer, indicatorFieldName, where, t });
    layerView.layer.renderer = rendererJsonUtils.fromJSON(rendererJSON);
    return rendererJSON;
};

const updateLayerPopupContent = ({
    featureLayer,
    t,
    indicatorFieldName,
    mapView,
    setGeoId,
    setGeoName,
    setGeoGeometry,
    updateSearchResult,
}) => {
    if (!featureLayer) {
        return;
    }
    featureLayer.popupTemplate = {
        outFields: ['*'],
        content: (feature) =>
            generatePopupContent({
                featureLayer,
                attributes: feature.graphic.attributes,
                geometry: { ...feature?.graphic?.geometry?.toJSON(), type: 'polygon' },
                t,
                indicatorFieldName,
                mapView,
                setGeoId,
                setGeoName,
                setGeoGeometry,
                updateSearchResult,
            }),
        returnGeometry: true,
    };
};

export const generateRendererJSON = async ({ featureLayer, indicatorFieldName, where, t }) => {
    const features = await getAllFeatures(featureLayer, {
        where,
        outFields: [indicatorFieldName],
        returnGeometry: false,
    });

    let values = [];
    let countNullValues = 0;
    features.forEach((feature) => {
        const value = feature.attributes[indicatorFieldName];
        if (value == null) {
            countNullValues++;
        } else {
            values.push(value);
        }
    });

    if (!values.length) {
        featureLayer.renderer = noDataRender;
        // update the layer's legend to show no data
        featureLayer.renderer.label = t ? t('Messages.noData') : 'No Data';
        const vv = {
            type: 'color',
            field: featureLayer.objectIdField,
            legendOptions: {
                title: t ? t('Messages.noData') : 'No Data',
            },
        };
        featureLayer.renderer.visualVariables = [vv];
        return JSON.parse(JSON.stringify(featureLayer.renderer));
    }

    const statistics = {
        avg: mean(values),
        count: values.length - countNullValues,
        max: max(values),
        median: median(values),
        min: min(values),
        stddev: standardDeviation(values),
        sum: sum(values),
        variance: variance(values),
        nullcount: countNullValues,
    };

    // CDD_SP245_MAX to CDD
    const baseIndicatorName = indicatorFieldName.slice(0, indicatorFieldName.indexOf('_'));

    const schemeName =
        Object.entries(colorRamps)
            .map(([key, value]) => {
                return value.includes(baseIndicatorName) ? key : false;
            })
            .find((item) => item) || 'Orange 4';
    const colorScheme = colorSchemes.getSchemeByName({
        name: schemeName,
        basemapTheme: 'light',
        geometryType: 'polygon',
        theme: 'high-to-low',
    });

    const vvResults = await colorRendererCreator.createVisualVariable({
        layer: featureLayer,
        field: indicatorFieldName,
        theme: 'high-to-low',
        colorScheme:
            baseIndicatorName === DataDictionary.indicators.HDD ? colorSchemes.flipColors(colorScheme) : colorScheme,
        statistics,
    });

    vvResults.visualVariable.stops.forEach((stop, idx) => {
        // Round the numerical data in the legend
        // by adding stop labels with rounded values at the top, bottom, and "middle" stops
        if (
            idx === 0 ||
            idx === vvResults.visualVariable.stops.length - 1 ||
            idx === Math.round(vvResults.visualVariable.stops.length / 2) - 1
        ) {
            stop.label = roundValue(stop.value);
        }
    });

    // I had some odd behvior with the spread not cloning. using JSON strings.
    const template = JSON.parse(JSON.stringify(rendererTemplate));

    // get the template renderer from comfig and update field
    const rendererJSON = { ...template, field: indicatorFieldName };

    // add color visual variable for selected indicator
    let vv = { ...vvResults.visualVariable.clone().toJSON(), field: indicatorFieldName };
    vv.legendOptions = { title: t(`DataDictionary.indicators.${baseIndicatorName}.Title`) };
    rendererJSON.visualVariables.push(vv);
    return rendererJSON;
};

// Creates the divs to be used in the swipe widget for map comparison
const createDivs = (tabbedValues, t) => {
    const createDiv = (id, tabbedValuesIndex) => {
        const values = tabbedValues[tabbedValuesIndex];
        const div = document.createElement('div');
        div.classList.add('popup-content');
        div.id = id;
        div.style.width = 'max-content';
        div.innerHTML = `<h1>View ${tabbedValuesIndex + 1}</h1>
            <p><strong>${t(`DataDictionary.labels.decadeTypes`)}:<br></strong>${t(
            `DataDictionary.decadeTypes.${values.decadeType}`
        )}</p>
            <p><strong>${t(`DataDictionary.labels.modelSets`)}:<br></strong>${t(
            `DataDictionary.modelSets.${values.modelSet}`
        )}</p>
            <p><strong>${t(`DataDictionary.labels.models`)}:<br></strong>${t(
            `DataDictionary.models.${values.model}`
        )}</p>
            <p><strong>${t(`DataDictionary.labels.scenarios`)}:<br></strong>${t(
            `DataDictionary.scenarios.${values.scenario}`
        )}</p>
            <p><strong>${t(`DataDictionary.labels.decade`)}:<br></strong>${values.decade}</p>`;

        return div;
    };

    const leadingDiv = createDiv('leadingDiv', 0);
    const trailingDiv = createDiv('trailingDiv', 1);

    return { leadingDiv, trailingDiv };
};

export const enableMapCompare = async ({
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
}) => {
    //Function assumes tabbedValues is a two item array
    const layerViews = mapView.allLayerViews;

    const legendText = document.getElementById('legendTextNode');
    if (legendText) {
        legendText.style.display = 'none';
    }

    // disable popups
    mapView.popupEnabled = false;

    // set the stops the same both renderers
    let sharedColorStops = [];

    let minValue, maxValue;
    tabbedRenderers.forEach((item, idx) => {
        item.visualVariables.forEach((vv) => {
            if (vv.type.toLowerCase().includes('color')) {
                if (idx === 0) {
                    sharedColorStops = [...vv.stops];
                }
                vv.stops.forEach((stop) => {
                    if (!minValue || stop.value < minValue) {
                        minValue = stop.value;
                    }

                    if (!maxValue || stop.value > maxValue) {
                        maxValue = stop.value;
                    }
                });
            }
        });
    });

    const step = (maxValue - minValue) / sharedColorStops.length - 1;

    // create equal interval stops with min and max of both layers
    sharedColorStops = sharedColorStops.map((stop, idx) => {
        if (idx === sharedColorStops.length - 1) {
            stop.value = maxValue;
            stop.label = roundValue(maxValue);
        } else {
            stop.value = minValue + idx * step;
            stop.label = roundValue(stop.value);
        }

        return stop;
    });

    // apply the equal interval color ramps to both renderers
    const updatedRenderers = tabbedRenderers.map((item) => {
        const clone = { ...item };
        clone.visualVariables = clone.visualVariables.map((vv) => {
            if (vv.type.toLowerCase().includes('color')) {
                vv.stops = sharedColorStops;
                vv.legendOptions = { title: t(`DataDictionary.indicators.${indicator}.Title`) };
            }
            return vv;
        });
        return clone;
    });

    const featureLayers = tabbedValues.map((values, idx) => {
        const { decadeType } = values;

        let tabbedLayerView = undefined;

        //loop over GeoTypes
        Object.values(DataDictionary.decadeTypes).forEach((dt) => {
            Object.values(DataDictionary.geoTypes).forEach((gt) => {
                try {
                    const visible = dt === decadeType && gt === geoType;
                    const layerTitle = AppConfig.services[gt][dt].title;
                    const layerView = layerViews.find((lv) => {
                        return lv.layer.title === layerTitle;
                    });
                    if (layerView && visible) {
                        tabbedLayerView = layerView;
                    }
                } catch (err) {
                    // TODO: ADD log error after tribal serivces are added
                }
            });
        });

        if (tabbedLayerView) {
            const featureLayer = tabbedLayerView.layer.clone();
            featureLayer.title += ' COMPARE ' + idx;
            featureLayer.visible = true;
            featureLayer.legendEnabled = idx === 0;
            featureLayer.renderer = rendererJsonUtils.fromJSON(updatedRenderers[idx]);
            featureLayer.definitionExpression = tabbedValues[idx].where;
            featureLayer.popupTemplate = {
                outFields: ['*'],
                content: (feature) =>
                    generatePopupContent({
                        featureLayer,
                        attributes: feature.graphic.attributes,
                        t,
                        indicator,
                        tabbedValues,
                        selectedTab,
                        mapView,
                        setGeoId,
                        setGeoName,
                        setGeoGeometry,
                        updateSearchResult,
                    }),
                returnGeometry: true,
            };
            mapView.map.add(featureLayer);
            tabbedLayerView.visible = false;

            return featureLayer;
        } else {
            console.log('no match');
        }
        return null;
    });

    const swipe = new Swipe({
        leadingLayers: [featureLayers[0]],
        trailingLayers: [featureLayers[1]],
        position: 50, // set position of widget to 35%
        view: mapView,
    });

    // Extract the divs from the tabbed values
    const { leadingDiv, trailingDiv } = createDivs(tabbedValues, t);

    // Create the expand widgets for the divs
    const view1Expand = new Expand({
        expandIcon: 'information', // see https://developers.arcgis.com/calcite-design-system/icons/
        expandTooltip: 'View 1 Information',
        view: mapView,
        content: leadingDiv,
        expanded: true,
    });

    const view2Expand = new Expand({
        expandIcon: 'information',
        expandTooltip: 'View 2 Information',
        view: mapView,
        content: trailingDiv,
        expanded: true,
    });

    mapView.popup.close();

    mapView.ui.add(swipe);
    mapView.ui.add(view1Expand, 'top-left');
    mapView.ui.add(view2Expand, 'top-right');
    return swipe;
};

export const disableMapCompare = async ({ mapView, decadeType, geoType }) => {
    const legendText = document.getElementById('legendTextNode');
    if (legendText) {
        legendText.style.display = 'unset';
    }
    // enable popups
    mapView.popupEnabled = true;
    //Function assumes tabbedValues is a two item array
    const layerViews = mapView.allLayerViews.filter((lv) => lv.layer.title.includes('COMPARE'));

    if (layerViews.length !== 2) {
        return;
    }

    const swipe = mapView.ui.getComponents().find((item) => item.label === 'Swipe');
    // Get all MapView UI components that have a label of 'Expand' and place them in an array
    const expands = mapView.ui.getComponents().filter((item) => item.label === 'Expand');

    if (!swipe || expands.length !== 2) {
        return;
    }
    mapView.ui.remove(swipe);
    expands.forEach((expand) => {
        mapView.ui.remove(expand);
    });
    swipe.destroy();

    layerViews.forEach((lv) => {
        mapView.map.remove(lv.layer);
    });

    const activeLayerView = getLayerView({ layerViews: mapView.allLayerViews, decadeType, geoType });
    activeLayerView.visible = true;
};

const getAllFeatures = async (featureLayer, query) => {
    const allIds = await featureLayer.queryObjectIds(query);
    const arrayOfIds = chunkArray(allIds, featureLayer.capabilities?.query?.maxRecordCount || 1000);
    let promises = [];
    arrayOfIds.forEach((ids) => {
        promises.push(
            featureLayer.queryFeatures({
                objectIds: ids,
                outFields: query.outFields,
                returnGeometry: query.returnGeometry,
            })
        );
    });

    const results = await Promise.all(promises);
    let allFeatures = [];
    results.forEach((result) => {
        allFeatures = [...allFeatures, ...result.features];
    });
    return allFeatures;
};

export const selectStandardGeography = async ({ decadeType, geoType, layerViews, feature }) => {
    const layerView = getLayerView({ decadeType, geoType, layerViews });

    const layerQuery = layerView.layer.createQuery();
    console.log(layerQuery);
    const queryResults = await layerView.layer.queryFeatures({
        where: layerQuery.where,
        geometry: feature.geometry,
        outFields: [AppConfig.fieldNames.geoId, AppConfig.fieldNames.name, layerView.layer.objectIdField],
        returnGeometry: true,
    });
    if (queryResults?.features?.length !== 1) {
        throw new Error(`Error Finding climate data for location. queryResults.features.length does not equal 1.`);
    }
    return queryResults.features[0];
};

const chunkArray = (array = [], chunk = 1000) => {
    let i;
    let j;
    let temporary;
    let chunkedArray = [];
    for (i = 0, j = array.length; i < j; i += chunk) {
        temporary = array.slice(i, i + chunk);
        chunkedArray.push(temporary);
    }
    return chunkedArray;
};
