// Framework and third-party non-ui
import { useCallback, useEffect, useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import { webmap } from '../../constants/AppConfig.json';
import DataDictionary from '../../constants/DataDictionary.json';

// App components
import Map from '../Map';
import SecondaryControls from '../Containers/SecondaryControls';

// Component specific modules (Component-styled, etc.)
import './MapPanel.scss';

// Third-party components (buttons, icons, etc.)
import { Button, Icon } from '@trussworks/react-uswds';

export const MapPanel = ({ hidden }) => {
    const [t] = useTranslation();
    const {
        geoId,
        geoType,
        setAlertInfo,
        mapCompareEnabled,
        vizType,
        setVizType,
        showSecondaryControls,
        setShowSecondaryControls,
    } = useAppContext();

    useEffect(() => {
        setShowSecondaryControls(!mapCompareEnabled);
    }, [mapCompareEnabled, setShowSecondaryControls]);

    function handlePanelClick() {
        if (showSecondaryControls === false) {
            setShowSecondaryControls(true);
        } else {
            setShowSecondaryControls(false);
        }
    }

    const handleVizToggleClick = useCallback(() => {
        if (vizType === DataDictionary.vizTypes.chart) {
            setVizType(DataDictionary.vizTypes.map);
        } else {
            if (geoId) {
                setVizType(DataDictionary.vizTypes.chart);
            } else {
                setAlertInfo({
                    type: 'warning',
                    message: t('Messages.invalidLocation', { geoType: t(`DataDictionary.geoTypes.${geoType}`) }),
                });
            }
        }
    }, [geoId, geoType, setAlertInfo, setVizType, t, vizType]);
    return (
        <div className={`mapPanel--container ${hidden ? 'display-hidden' : ''}`}>
            <Button onClick={handlePanelClick} className="mapPanel--container-toggle-btn" disabled={mapCompareEnabled}>
                <span className="sr-only">{t('Buttons.close')}</span>
                {showSecondaryControls ? <Icon.Close size={2} /> : <Icon.NavigateNext size={3} />}
            </Button>
            <Button
                className="mapPanel--container-toggle-view"
                disabled={mapCompareEnabled}
                onClick={handleVizToggleClick}
            >
                <span className="sr-only">{t('Buttons.viewChart')}</span>
                <Icon.Assessment size={3} />
            </Button>

            <SecondaryControls showSecondaryControls={showSecondaryControls} />
            <Map webmapId={webmap} />
        </div>
    );
};

export default MapPanel;
