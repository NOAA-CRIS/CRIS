import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapSymbols from '../constants/MapSymbols';
import ScreeningData from '../constants/ScreeningData';
import { addLayersByItemId, getIndicatorData, unionExtents } from '../utilities/arcgisUtils';

const _updateMapView = async (args, setter) => {
    // do something with args if needed
    const {
        mapView,
        config,
        setDataLayerView,
        setAiannhaLayerView,
        setCountiesLayerView,
        setTractsLayerView,
        standardGeography,
    } = args;
    const tractsLayer = new FeatureLayer({
        // URL to the service
        url: config.datasets.tracts.url,
        renderer: MapSymbols.emptyRenderer,
        visible: false,
        outFields: ['*'],
    });

    const countiesLayer = new FeatureLayer({
        // URL to the service
        url: config.datasets.counties.url,
        renderer: MapSymbols.emptyRenderer,
        visible: false,
        outFields: ['*'],
    });
    const aiannhaLayer = new FeatureLayer({
        // URL to the service
        url: config.datasets.aiannha.url,
        renderer: MapSymbols.emptyRenderer,
        visible: false,
        outFields: ['*'],
    });

    mapView.map.add(aiannhaLayer);
    mapView.map.add(countiesLayer);
    mapView.map.add(tractsLayer);
    let itemIds = [];
    ScreeningData.indicators.forEach((indicator) => {
        if (indicator.layerIds) {
            indicator.layerIds.forEach((id) => itemIds.push(id));
        }
        if (indicator.modelTimeframeLayers) {
            Object.values(indicator.modelTimeframeLayers).forEach((id) => itemIds.push(id));
        }
        if (indicator.overlayLayers) {
            indicator.overlayLayers.forEach((id) => itemIds.push(id));
        }
    });
    await addLayersByItemId(mapView, itemIds, false);
    const aiannhaLayerView = await mapView.whenLayerView(aiannhaLayer);
    const countiesLayerView = await mapView.whenLayerView(countiesLayer);
    const tractsLayerView = await mapView.whenLayerView(tractsLayer);
    setAiannhaLayerView(aiannhaLayerView);
    setCountiesLayerView(countiesLayerView);
    setTractsLayerView(tractsLayerView);

    if (standardGeography === ScreeningData.standardGeographies.county) {
        setDataLayerView(countiesLayerView);
    } else if (standardGeography === ScreeningData.standardGeographies.tract) {
        setDataLayerView(tractsLayerView);
    } else {
        setDataLayerView(aiannhaLayerView);
    }

    await setter(mapView);
};

const _updateAreaOfInterest = async (args) => {
    // do something with args if needed
    const { areaOfInterest, dataLayerView, config, mapView } = args;

    let results = { indicators: null, geometry: null };
    if (areaOfInterest && dataLayerView) {
        const { data, geometry } = await getIndicatorData({
            layerView: dataLayerView,
            geometry: areaOfInterest.geometry,
        });

        if (geometry && mapView) {
            const extent = unionExtents({
                pologons: [geometry],
                expandFactor: config.zoomToGeomExtentFactor ? config.zoomToGeomExtentFactor : 1.5,
            });
            mapView.goTo({
                target: extent,
            });
        }
        results = {
            indicators: data,
            geometry,
        };
    } else {
        if (dataLayerView) {
            dataLayerView.layer.renderer = MapSymbols.emptyRenderer;
        }
    }
    return results;
};

const _updateStandardGeography = async (args, setter) => {
    const {
        value,
        config,
        aiannhaLayerView,
        countiesLayerView,
        tractsLayerView,
        setDataLayerView,
        areaOfInterest,
        mapView,
    } = args;

    let newLayerView, response;
    tractsLayerView.layer.visible = false;
    countiesLayerView.layer.visible = false;
    aiannhaLayerView.layer.visible = false;
    tractsLayerView.layer.renderer = MapSymbols.emptyRenderer;
    countiesLayerView.layer.renderer = MapSymbols.emptyRenderer;
    aiannhaLayerView.layer.renderer = MapSymbols.emptyRenderer;

    if (value === ScreeningData.standardGeographies.county) {
        newLayerView = countiesLayerView;
    }
    if (value === ScreeningData.standardGeographies.tract) {
        newLayerView = tractsLayerView;
    }
    if (value === ScreeningData.standardGeographies.aiannha) {
        newLayerView = aiannhaLayerView;
    }

    if (areaOfInterest) {
        const { data, geometry } = await getIndicatorData({
            layerView: newLayerView,
            geometry: areaOfInterest.geometry,
        });

        if (geometry && mapView) {
            const extent = unionExtents({
                pologons: [geometry],
                expandFactor: config.zoomToGeomExtentFactor ? config.zoomToGeomExtentFactor : 1.5,
            });
            await mapView.goTo({
                target: extent,
            });
        }
        response = {
            indicators: data,
            geometry,
        };
    } else {
        response = {
            indicators: null,
            geometry: null,
        };
    }
    tractsLayerView.layer.visible = true;
    countiesLayerView.layer.visible = true;
    aiannhaLayerView.layer.visible = true;
    await setter(value);
    setDataLayerView(newLayerView);
    return response;
};

const _updateSelectedHazard = async (args, setter) => {
    const { value, setSelectedIndicator } = args;
    setSelectedIndicator();
    await setter(value);
};

export { _updateAreaOfInterest, _updateMapView, _updateStandardGeography, _updateSelectedHazard };
