// Framework and third-party non-ui
import React, { useEffect } from 'react';
import * as watchUtils from '@arcgis/core/core/watchUtils';

// Hooks, context, and constants
import AppRoutes from '../../constants/AppRoutes';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { setLayerVisibilityByItemId, unionExtents } from '../../utilities/arcgisUtils';

// App components
import MapSearch from '../../components/MapSearch';

// Component specific modules (Component-styled, etc.)
import './SearchPage.scss';

// Third-party components (buttons, icons, etc.)

import MapSymbols from '../../constants/MapSymbols';
import ScreeningData from '../../constants/ScreeningData';
import StandardGeographySelect from '../../components/StandardGeographySelect';

const SearchPage = () => {
    const navigate = useNavigate();
    const {
        countiesLayerView,
        dataLayerView,
        tractsLayerView,
        aiannhaLayerView,
        config: { zoomToGeomExtentFactor },
        mapView,
        indicatorGeometry,
        setAlertInfo,
        setLegendInfo,
        standardGeography,
        lastSelectedIndicatorId,
    } = useAppContext();

    // add the data to the map but hide it
    // this is to improve performance for rendering of Explore Map Page
    useEffect(() => {
        if (dataLayerView?.layer) {
            dataLayerView.layer.popupTemplate = null;
            dataLayerView.layer.renderer = MapSymbols.emptyRenderer;
            dataLayerView.layer.visible = true;
        }
        if (countiesLayerView?.layer) {
            countiesLayerView.layer.popupTemplate = null;
            countiesLayerView.layer.renderer = MapSymbols.emptyRenderer;
            countiesLayerView.layer.visible = true;
        }
        if (tractsLayerView?.layer) {
            tractsLayerView.layer.popupTemplate = null;
            tractsLayerView.layer.renderer = MapSymbols.emptyRenderer;
            tractsLayerView.layer.visible = true;
        }
        if (aiannhaLayerView?.layer) {
            aiannhaLayerView.layer.popupTemplate = null;
            aiannhaLayerView.layer.renderer =
                standardGeography === ScreeningData.standardGeographies.aiannha
                    ? MapSymbols.emptyRenderer
                    : MapSymbols.emptyRenderer;
            aiannhaLayerView.layer.visible = true;
        }
        let itemIds = [];
        ScreeningData.indicators.forEach((indicator) => {
            if (indicator.layerIds) {
                indicator.layerIds.forEach((id) => itemIds.push(id));
            } else if (indicator.modelTimeframeLayers) {
                Object.values(indicator.modelTimeframeLayers).forEach((id) => itemIds.push(id));
            }
        });
        setLayerVisibilityByItemId(mapView, itemIds, false);
        setLegendInfo(null);
    }, [
        dataLayerView,
        countiesLayerView,
        tractsLayerView,
        mapView,
        setLegendInfo,
        aiannhaLayerView,
        standardGeography,
    ]);
    useEffect(() => {
        if (indicatorGeometry) {
            watchUtils.once(mapView, 'resizing', () => {
                watchUtils.whenFalseOnce(mapView, 'resizing', () => {
                    if (indicatorGeometry) {
                        const extent = unionExtents({
                            pologons: [indicatorGeometry],
                            expandFactor: zoomToGeomExtentFactor ? zoomToGeomExtentFactor : 1.5,
                        });
                        mapView.goTo({
                            target: extent,
                        });
                    }
                });
            });

            if (lastSelectedIndicatorId) {
                navigate(-1); // back to last route
            } else {
                navigate(AppRoutes.exploreDetails.path);
            }
        }
    }, [indicatorGeometry, mapView, navigate, zoomToGeomExtentFactor, lastSelectedIndicatorId]);

    return (
        <div className="searchPage-container">
            <div className="searchPage-input-container grid-row flex-row flex-align-center flex-justify-center">
                <div className="grid-row flex-column flex-align-left">
                    <MapSearch />
                    {<StandardGeographySelect />}
                </div>
                <div className="searchPage-spacer"></div>
            </div>
        </div>
    );
};

SearchPage.propTypes = {};
export default SearchPage;
