// Framework and third-party non-ui
import { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import { useVizTypeToggle } from '../../hooks/useVizTypeToggle';

// App components

// Component specific modules (Component-styled, etc.)
import './ChartPanel.scss';
import Chart from '../Chart/Chart';
import ChartControls from '../ChartControls/ChartControls';
import SecondaryControls from '../Containers/SecondaryControls';

// Third-party components (buttons, icons, etc.)
import { Button, Icon } from '@trussworks/react-uswds';

export const ChartPanel = ({ hidden }) => {
    const [t] = useTranslation();
    const { chart, vizType, setVizType, showSecondaryControls, setShowSecondaryControls } = useAppContext();

    useEffect(() => {
        if (chart) chart.resize();
    }, [chart, showSecondaryControls]);

    function handlePanelClick() {
        // toggle secondary controls
        if (showSecondaryControls === false) {
            // show
            setShowSecondaryControls(true);
        } else {
            // hide
            setShowSecondaryControls(false);
        }
    }

    /**
     * Toggle between map and chart views using the useVizTypeToggle hook.
     * @type {function}
     * @returns {void}
     * @see useVizTypeToggle
     */
    const vizTypeToggle = useVizTypeToggle(vizType, setVizType);

    return (
        <div className={`chartPanel--container ${hidden ? 'display-hidden' : ''}`}>
            <Button onClick={handlePanelClick} className="chartPanel--container-toggle-btn">
                <span className="sr-only">{t('Buttons.close')}</span>
                {showSecondaryControls ? <Icon.Close size={2} /> : <Icon.NavigateNext size={3} />}
            </Button>
            <Button className="chartPanel--container-toggle-view" onClick={vizTypeToggle}>
                <span className="sr-only">{t('Buttons.viewMap')}</span>
                <Icon.Map size={3} />
            </Button>

            <SecondaryControls showSecondaryControls={showSecondaryControls} />
            <div className="chartPanel--chart-container">
                <ChartControls />
                <Chart />
            </div>
        </div>
    );
};

export default ChartPanel;
