import Layer from '@arcgis/core/layers/Layer';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as watchUtils from '@arcgis/core/core/watchUtils';
import * as colorRendererCreator from '@arcgis/core/smartMapping/renderers/color';
import * as colorSchemes from '@arcgis/core/smartMapping/symbology/color';
import { max, mean, median, min, standardDeviation, sum, variance } from 'simple-statistics';

import { getItem } from '@esri/arcgis-rest-portal';
import ScreeningData from '../constants/ScreeningData';

/**
 * Query Features from Feature Service
 * @param {Object} url Service to Query
 * @param {Object} geometry Query object containing query request options
 * @returns {Promise<IQueryFeaturesResponse>} Promise will resolve with Object containing query results
 */
export async function getIndicatorData({ layerView, url, geometry }) {
    try {
        const query = {
            where: '1=1',
            geometry,
            returnGeometry: true,
            outFields: ['*'],
        };
        let queryResults = await layerView.queryFeatures(query);
        if (!queryResults?.features?.length) {
            console.log('going to server for data');
            queryResults = await layerView.layer.queryFeatures(query);
        }
        if (!queryResults?.features?.length) {
            return { data: [], geometry: null };
        }

        const result = queryResults.features[0];
        const resultGeometry = {
            type: queryResults.geometryType,
            ...result.geometry.toJSON(),
        };
        const indicators = ScreeningData.indicators.map((indicator) => {
            let data = { ...indicator };
            if (indicator.dataFields) {
                indicator.dataFields.forEach((field) => {
                    data[field.fieldName] = result.attributes[field.fieldName];
                });
            } else {
                queryResults.fields.forEach((field) => {
                    if (field.name.endsWith('_' + indicator.id)) {
                        const propName = field.name.replace('_' + indicator.id, '');
                        data[propName] = result.attributes[field.name];
                    }
                });
            }
            data.OID = result.attributes[layerView.layer.objectIdField];

            // add total hazard index score
            ScreeningData.hazards.forEach((hazard) => {
                data[hazard.field] = result.attributes[hazard.field];
            });

            // add flags
            Object.values(ScreeningData.flags).forEach((flag) => {
                data[flag.fieldName] = result.attributes[flag.fieldName];
            });

            // add GeoIDs (tract and county field is the same)
            data[ScreeningData.standardGeographies.geoIdField] =
                result.attributes[ScreeningData.standardGeographies.geoIdField];
            data[ScreeningData.standardGeographies.countyNameField] =
                result.attributes[ScreeningData.standardGeographies.countyNameField];
            data[ScreeningData.standardGeographies.stateAbbrField] =
                result.attributes[ScreeningData.standardGeographies.stateAbbrField];
            data[ScreeningData.standardGeographies.aiannhaNameField] =
                result.attributes[ScreeningData.standardGeographies.aiannhaNameField];

            return data;
        });
        return { data: indicators, geometry: resultGeometry };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/**
 * Get Renderers defined in webmap.
 * @param {Array<Polygon>} pologons Array of Pologons JSON objects
 * @param {Array<String>} expandFactor Array of groupLayer "Title" properties representing the dataets
 * @returns {Extent}  Extent Object containing all geometries expanded by the expandFactor
 */
export function unionExtents({ pologons, expandFactor }) {
    if (!pologons.length) {
        return null;
    }
    const firstGeom = Polygon.fromJSON(pologons[0]);
    let extent = firstGeom.extent;

    pologons.forEach((geom) => {
        extent = extent.union(Polygon.fromJSON(geom).extent);
    });
    return expandFactor ? extent.expand(expandFactor) : extent;
}

/**
 * Get Renderers defined in webmap.
 * @param {String} itemId Item ID
 * @param {import('@esri/arcgis-rest-request').IRequestOptions} requestOptions Array of groupLayer "Title" properties representing the dataets
 */
export async function getPortalItem(itemId, requestOptions) {
    try {
        const item = await getItem(itemId, requestOptions);
        return item;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getLocalIndicatorVisualVariable(mapView, layerView, indicator, expandFactor) {
    try {
        let outFields = [];
        Object.values(ScreeningData.models).forEach((model) => {
            Object.values(ScreeningData.timeframe).forEach((timeframe) => {
                const modelPrefix = timeframe === ScreeningData.timeframe.historic ? '' : model;

                outFields.push(`${modelPrefix}${timeframe}_${ScreeningData.statistics.mean}_${indicator.id}`);
            });
        });
        // wait for map to stop moving or downloading data
        //
        if (!mapView.stationary) {
            await watchUtils.whenOnce(mapView, 'stationary');
        }
        if (layerView.updating) {
            await watchUtils.whenFalseOnce(layerView, 'updating');
        }
        const queryResults = await layerView.queryFeatures({
            where: '1=1',
            geometry: mapView.extent.expand(expandFactor),
            outFields,
        });
        let values = [];
        let countNullValues = 0;
        queryResults.features.forEach((feature) => {
            outFields.forEach((field) => {
                const value = feature.attributes[field];
                if (value == null) {
                    countNullValues++;
                } else {
                    values.push(value);
                }
            });
        });

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

        const schemeName = indicator.colorRampName ? indicator.colorRampName : 'Blue 14';
        const colorScheme = colorSchemes.getSchemeByName({
            name: schemeName,
            basemapTheme: 'light',
            geometryType: 'polygon',
            theme: 'high-to-low',
        });

        const vvResults = await colorRendererCreator.createVisualVariable({
            layer: layerView.layer,
            field: `${ScreeningData.timeframe.historic}_${ScreeningData.statistics.mean}_${indicator.id}`,
            theme: 'high-to-low',
            colorScheme: indicator.reverseColorRamp ? colorSchemes.flipColors(colorScheme) : colorScheme,
            statistics,
        });
        const visualVariable = vvResults.visualVariable.toJSON();
        return visualVariable;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function getIndicatorMinMaxValues(layerView, extent, indicator) {
    try {
        const { mean } = ScreeningData.statistics;
        let statistics = [];
        Object.values(ScreeningData.models).forEach((model) => {
            Object.values(ScreeningData.timeframe).forEach((timeframe) => {
                const modelPrefix = timeframe === ScreeningData.timeframe.historic ? '' : model;

                const count = statistics.length / 2;
                statistics.push({
                    onStatisticField: `${modelPrefix}${timeframe}_${mean}_${indicator}`,
                    outStatisticFieldName: `MAX${count}`,
                    statisticType: 'max',
                });
                statistics.push({
                    onStatisticField: `${modelPrefix}${timeframe}_${mean}_${indicator}`,
                    outStatisticFieldName: `MIN${count}`,
                    statisticType: 'min',
                });
            });
        });

        const results = await layerView.queryFeatures({ where: '1=1', geometry: extent, outStatistics: statistics });
        const data = results?.features?.length ? results.features[0].attributes : null;
        let maxValue, minValue;
        Object.values(data).forEach((value, index) => {
            if (index === 0) {
                maxValue = value;
                minValue = value;
            }

            if (value < minValue) {
                minValue = value;
            }

            if (value > maxValue) {
                maxValue = value;
            }
        });
        return { min: minValue, max: maxValue };
    } catch (err) {
        console.error(err);
        return { max: null, min: null };
    }
}

export async function addLayersByItemId(mapView, itemIds, visible) {
    let layers = [];
    for (let i = itemIds.length; i > 0; i--) {
        try {
            const itemId = itemIds[i - 1];
            const layer = await Layer.fromPortalItem({
                portalItem: {
                    id: itemId,
                },
            });
            layer.visible = Boolean(visible);
            if (itemId === '06bbbe10618e4c22a7efaa20aad13e96') {
                layer.popupTemplate = {
                    title: 'Current Flood Hazard',
                    content: (args) => {
                        console.log(args);
                        if (args.graphic) {
                            const attributes = args.graphic.attributes;
                            if (attributes['Raster.ClassName'] === '1% Annual Chance Flood Hazard') {
                                return '100-year flood zone';
                            } else if (attributes['Raster.ClassName'] === '0.2% Annual Chance Flood Hazard') {
                                return '500-year flood zone';
                            } else if (attributes['Raster.ServicePixelValue'] === '0') {
                                return 'Flood hazard unknown';
                            } else {
                                return attributes['Raster.ClassName'] ? attributes['Raster.ClassName'] : 'No Data';
                            }
                        } else {
                            return 'No Data';
                        }
                    },
                };
            }
            layers.push(layer);
            mapView.map.add(layer, 0);
        } catch (error) {
            console.error('could not add item id: ' + itemIds[i]);
        }
    }
    return layers;
}

export function setLayerVisibilityByItemId(mapView, itemIds, visible) {
    if (!mapView) {
        return;
    }
    mapView.map.layers.forEach((layer) => {
        try {
            if (itemIds.includes(layer.portalItem.id)) {
                layer.visible = visible;
            }
        } catch (error) {}
    });
}

export async function layerHasData(layerView, geometry) {
    try {
        const query = {
            where: '1=1',
            geometry,
        };
        let count = await layerView.queryFeatureCount(query);
        if (!count) {
            console.log('going to server for data');
            count = await layerView.layer.queryFeatureCount(query);
        }

        return Boolean(count);
    } catch (error) {
        return false;
    }
}
