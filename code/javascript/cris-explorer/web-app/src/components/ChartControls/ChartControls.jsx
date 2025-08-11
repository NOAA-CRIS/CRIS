// Framework and third-party non-ui

// Hooks, context, and constants
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import ChartConfig from '../../constants/ChartConfig.json';

// Utilities

// App components

// Component specific modules (Component-styled, etc.)
import './ChartControls.scss';

// Third-party components (buttons, icons, etc.)
import { Checkbox } from '@trussworks/react-uswds';

export const ChartControls = () => {
    const [t] = useTranslation();
    const { chart, vizType, setAlertInfo } = useAppContext();

    useEffect(() => {
        // when chart loads toggle off layers based on config.
        if (chart) {
            chart.on('finished', function () {
                console.log('clearing series');
                chart.off('finished');
                ChartConfig.series.forEach((config) => {
                    if (!config.visible) {
                        config.names.forEach((name) => {
                            chart.dispatchAction({
                                type: 'legendToggleSelect',
                                name: name,
                            });
                        });
                    }
                });
            });
        }
    }, [chart]);

    useEffect(() => {
        // When a series is toggled, check if all the data is null, if so, display a warning message
        if (chart && vizType === 'chart') {
            chart.on('legendselectchanged', (params) => {
                const selectedSeries = params.name;
                // Loop through the params.selected array property names, if it matches params.name, console.log the value
                Object.keys(params.selected).forEach((name) => {
                    if (name === selectedSeries && params.selected[name]) {
                        // Get the data from the chart's series
                        const series = chart.getOption().series;
                        series.forEach((s) => {
                            if (selectedSeries === s.name) {
                                // If all the values of the data array are null, then console log the series name
                                if (s.data.every((d) => d === null)) {
                                    setAlertInfo({ type: 'warning', message: t('Messages.chartNoData') });
                                }
                            }
                        });
                    }
                });
            });
            return;
        }
    }, [chart, setAlertInfo, t, vizType]);

    return (
        <div className="chartControls--container">
            <div className="chartControls--container__inner">
                {ChartConfig.series.slice(0, 3).map((config, idx) => (
                    <Checkbox
                        id={`checkbox--${config.id}`}
                        key={`checkbox-${idx}`}
                        tile
                        type="checkbox"
                        name={config.id}
                        label={t(`Chart.series.${config.id}`)}
                        defaultChecked={config.visible}
                        onClick={() => {
                            config.names.forEach((name) => {
                                chart.dispatchAction({
                                    type: 'legendToggleSelect',
                                    name: name,
                                });
                            });
                        }}
                        className={`${config.id}_checkbox chartControls--checkbox`}
                    />
                ))}
            </div>

            <div className="chartControls--container__inner">
                {ChartConfig.series.slice(3).map((config, idx) => (
                    <Checkbox
                        id={`checkbox--${config.id}`}
                        key={`checkbox-${idx + 3}`}
                        tile
                        type="checkbox"
                        name={config.id}
                        label={t(`Chart.series.${config.id}`)}
                        defaultChecked={config.visible}
                        onClick={() => {
                            config.names.forEach((name) => {
                                chart.dispatchAction({
                                    type: 'legendToggleSelect',
                                    name: name,
                                });
                            });
                        }}
                        className={`${config.id}_checkbox chartControls--checkbox`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChartControls;
