import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import MapSymbols from '../../constants/MapSymbols';

export function loadView(map, options) {
    return loadWebMap(map, options);
}

export function loadWebMap(map, options) {
    // Create web map from map id
    const webmap = new WebMap({
        portalItem: {
            id: map,
        },
    });
    // Return a view with that web map
    const { view } = options;
    return {
        view: new MapView({
            ...view,
            map: webmap,
            popup: {
                dockOptions: {
                    // Disable the dock button so users cannot undock the popup
                    buttonEnabled: false,
                },
            },
            highlightOptions: {
                color: MapSymbols.aoi.outline.color,
                fillOpacity: 0,
            },
            constraints: {
                maxZoom: 17,
            },
        }),
        webmap,
    };
}

export function destroyView(view) {
    if (!view) return;
    // undocumented way to destroy a view
    view = view.container = null;
}
