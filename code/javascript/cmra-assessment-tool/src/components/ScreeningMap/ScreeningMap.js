// Framework and third-party non-ui
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import AppRoutes from '../../constants/AppRoutes';
import ScreeningData from '../../constants/ScreeningData';
import MapSymbols from '../../constants/MapSymbols';

// App components
import Map from '../Map';
import MapFlag from '../MapFlag';
import MapSearch from '../MapSearch';
import StandardGeographySelect from '../StandardGeographySelect';

// Component specific modules (Component-styled, etc.)
import './ScreeningMap.scss';

// Third-party components (buttons, icons, etc.)
import { Alert, IconConstruction, IconPeople, Tooltip } from '@trussworks/react-uswds';
import ClipLoader from 'react-spinners/ClipLoader';
import MapLegend from '../MapLegend/MapLegend';
import { indicatorToString } from '../../utilities/indicatorUtils';

const ScreeningMap = ({ webmapId }) => {
    // ----- Language -----
    const { t } = useTranslation();
    const [highlight, setHighlight] = useState();

    const {
        appRoute,
        areaOfInterest,
        indicatorGeometry,
        selectedIndicator,
        mapView,
        config: { searchZoom, urls },
        alertInfo,
        dataLayerView,
        showMapLoading,
        standardGeography,
    } = useAppContext();

    // On Area of Interest Change
    useEffect(() => {
        if (mapView) {
            mapView.graphics.removeAll();
            if (areaOfInterest) {
                const aoiGraphic = { geometry: areaOfInterest.geometry, symbol: MapSymbols.location };
                mapView.graphics.add(aoiGraphic);
            }
        }
    }, [areaOfInterest, indicatorGeometry, mapView, searchZoom]);

    // On selectedIndicator change
    useEffect(() => {
        if (selectedIndicator && dataLayerView) {
            if (highlight) {
                if (highlight.OID !== selectedIndicator.OID) {
                    highlight.handle.remove();
                    setHighlight({
                        OID: selectedIndicator.OID,
                        handle: dataLayerView.highlight(selectedIndicator.OID),
                    });
                }
            } else {
                setHighlight({ OID: selectedIndicator.OID, handle: dataLayerView.highlight(selectedIndicator.OID) });
            }
        } else {
            if (highlight && highlight.handle) {
                highlight.handle.remove();
                setHighlight(null);
            }
        }
    }, [selectedIndicator, dataLayerView, highlight]);

    // On Alert Message change
    // KG: I don't think we need this anymore since the alert message is displayed only in the error state
    // useEffect(() => {
    //     if (alertInfo) {
    //         setTimeout(() => {
    //             setAlertInfo(null);
    //         }, 5000);
    //     }
    // }, [alertInfo, setAlertInfo]);

    const containerClassName = classNames({
        'screeningMap-full': !appRoute || appRoute.id === AppRoutes.search.id,
        'screeningMap-container-exploreDetails': appRoute && appRoute.id === AppRoutes.exploreDetails.id,
        'screeningMap-container-exploreMap': appRoute && appRoute.id === AppRoutes.exploreMap.id,
    });

    const flagContainerClassNames = classNames(['screeningMap-flag-container'], {
        'screeningMap-hidden':
            !appRoute || ![AppRoutes.exploreDetails.id, AppRoutes.exploreMap.id].includes(appRoute.id),
    });

    const searchClassNames = classNames(['screeningMap-search'], {
        'screeningMap-hidden':
            !appRoute || ![AppRoutes.exploreDetails.id, AppRoutes.exploreMap.id].includes(appRoute.id),
    });

    // TODO: Wire up the UI flag for the loading indicator
    const loadingIndicatorClassNames = classNames(['screeningMap-loading'], {
        'screeningMap-loading--hidden': !showMapLoading,
    });

    function getFlags() {
        if (!selectedIndicator) {
            return '';
        }

        let buildingCode = '';
        try {
            buildingCode = selectedIndicator && selectedIndicator[ScreeningData.flags.buildingCode.fieldName];
        } catch (err) {
            console.error('error populating flags');
        }
        let disadvantagedLabel = '';
        if (standardGeography === ScreeningData.standardGeographies.tract) {
            const { fieldName, trueValue } = ScreeningData.flags.disadvantaged;
            disadvantagedLabel =
                selectedIndicator[fieldName] === trueValue ? t('Flags.Disadvantaged') : t('Flags.NonDisadvantaged');
        } else if (standardGeography === ScreeningData.standardGeographies.county) {
            disadvantagedLabel = t('Flags.DisadvantagedPopulation', {
                popPercent: indicatorToString(
                    { format: '0.0' },
                    selectedIndicator[ScreeningData.flags.disadvantagedPopulation.fieldName]
                ),
            });
        } else if (standardGeography === ScreeningData.standardGeographies.aiannha) {
            disadvantagedLabel = t('Flags.Disadvantaged');
        }
        return (
            <div className={flagContainerClassNames}>
                {/* 
                White House 2025 does not want to show this info. Removing from UI.
                
                <Tooltip
                    label={t('Flags.DisadvantagedTooltip')}
                    position="bottom"
                    onClick={() => {
                        window.open(urls.toolMethodology, '_blank');
                    }}
                >
                    <MapFlag text={disadvantagedLabel} icon={<IconPeople />} backgroundHSL={['0', '0%', '85%']} />
                </Tooltip> */}
                {buildingCode && (
                    <Tooltip
                        label={t('Flags.BuildingCodeTooltip')}
                        position="bottom"
                        onClick={() => {
                            window.open(urls.bcatInfo, '_blank');
                        }}
                    >
                        <MapFlag
                            text={t('Flags.BuildingCode', { buildingCode })}
                            icon={<IconConstruction />}
                            backgroundHSL={['0', '0%', '85%']}
                        />
                    </Tooltip>
                )}
            </div>
        );
    }

    return (
        <div className={containerClassName}>
            {alertInfo && (
                <Alert className="screeningMap-alert" type="warning" heading={alertInfo.heading}>
                    {alertInfo.message}
                </Alert>
            )}
            {getFlags()}
            <div className={searchClassNames}>
                <MapSearch />
                <StandardGeographySelect />
            </div>
            <div className={loadingIndicatorClassNames}>
                <div className="screeningMap-loading-background"></div>
                <ClipLoader loading={true} size={30} />
            </div>
            <MapLegend />

            <Map webmapId={webmapId} />
        </div>
    );
};

export default ScreeningMap;
