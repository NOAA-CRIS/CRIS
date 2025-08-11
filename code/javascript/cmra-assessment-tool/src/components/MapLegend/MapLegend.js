// Framework and third-party non-ui
import React from 'react';
// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import AppRoutes from '../../constants/AppRoutes';

// App components

// Component specific modules (Component-styled, etc.)
import './MapLegend.scss';

// Third-party components (buttons, icons, etc.)

const MapLegend = () => {
    const [t] = useTranslation();
    const { appRoute, legendInfo } = useAppContext();

    return (
        <div className="mapLegend-container">
            {appRoute?.id === AppRoutes.exploreMap.id ? (
                <div className="mapLegend-prompt font-sans-2xs">{t('Legend.Message')}</div>
            ) : (
                <div className="mapLegend-row">
                    <div className="mapLegend-header font-sans-2xs">{t('Legend.Tribal')}</div>
                    <div className="mapLegend-tribal-area" />
                </div>
            )}

            {legendInfo?.pairs && (
                <div className="mapLegend-row">
                    <div className="mapLegend-header font-sans-2xs">{t('Legend.Header')}</div>
                    <div className="grid-row flex-row flex-align-center">
                        {legendInfo.pairs.map((pair, idx) => (
                            <React.Fragment key={idx}>
                                <div className="mapLegend-label font-sans-2xs">{pair.label}</div>
                                <div className="mapLegend-colors-container">
                                    <div className="mapLegend-color-item" style={{ background: pair.hex }} />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

MapLegend.propTypes = {};
export default MapLegend;
