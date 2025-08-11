// Framework and third-party non-ui
import React, { useEffect } from 'react';

// Hooks, context, and constants
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';
import AppRoutes from '../../constants/AppRoutes';
import MapSymbols from '../../constants/MapSymbols';
import { setLayerVisibilityByItemId } from '../../utilities/arcgisUtils';

// App components
import HazardList from '../../components/HazardList/HazardList';
import IndicatorList from '../../components/IndicatorList';
import IndicatorDetails from '../../components/IndicatorDetails';

// Component specific modules (Component-styled, etc.)
import './ExplorePage.scss';

// Third-party components (buttons, icons, etc.)

const ExplorePage = () => {
    const navigate = useNavigate();

    const {
        dataLayerView,
        countiesLayerView,
        tractsLayerView,
        aiannhaLayerView,
        selectedHazard,
        updateSelectedHazard,
        mapView,
        setLegendInfo,
        areaOfInterest,
        standardGeography,
    } = useAppContext();

    useEffect(() => {
        if (areaOfInterest) {
            if (aiannhaLayerView?.layer) {
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
            aiannhaLayerView.layer.renderer = MapSymbols.emptyRenderer;
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
    }, [dataLayerView, countiesLayerView, tractsLayerView, mapView, setLegendInfo, aiannhaLayerView]);

    useEffect(() => {
        if (!selectedHazard) {
            updateSelectedHazard(ScreeningData.hazards[0].id);
        }
    }, [selectedHazard, updateSelectedHazard]);

    return (
        <div className="explorePage-container grid-row flex-row">
            <HazardList />
            <div className="explorePage-right-container grid-row flex-row">
                <IndicatorList />
                <IndicatorDetails />
            </div>
        </div>
    );
};

export default ExplorePage;
