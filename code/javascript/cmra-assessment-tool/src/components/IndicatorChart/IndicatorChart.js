// Framework and third-party non-ui
import React, { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';
import MapSymbols from '../../constants/MapSymbols';

// App components

// Component specific modules (Component-styled, etc.)
import './IndicatorChart.scss';

// Third-party components (buttons, icons, etc.)
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { indicatorKeyToString } from '../../utilities/indicatorUtils';

ChartJS.register(
    BarController,
    BarElement,
    CategoryScale,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip
);

const IndicatorChart = () => {
    // ----- Language -----
    const { t } = useTranslation();

    const { selectedIndicator, selectedHazard } = useAppContext();

    const [chartData, setChartData] = useState(null);

    // confirm Area of Interest is defined. Else go back
    useEffect(() => {
        if (!selectedIndicator) {
            setChartData(null);
            return;
        }
        const getIndicatorTimeframe = (key) => indicatorKeyToString(selectedIndicator, key).replaceAll(',', '');

        const getMin = (timeframe) => getIndicatorTimeframe(`${timeframe}_MIN`);
        const getMax = (timeframe) => getIndicatorTimeframe(`${timeframe}_MAX`);
        const getMean = (timeframe) => getIndicatorTimeframe(`${timeframe}_MEAN`);

        const timeframes = Object.values(ScreeningData.timeframe);
        const models = Object.values(ScreeningData.models);

        const labels = timeframes.map((timeframe) => t(`Data.Time.${timeframe}.Label`));
        // break out history data
        let barChartDatasets = [];
        if (selectedIndicator.id !== 'SLR') {
            barChartDatasets.push({
                type: 'bar',
                label: t(`Data.Time.HISTORIC.LongLabel`),
                data: timeframes.map((timeframe) => {
                    if (timeframe === ScreeningData.timeframe.historic) {
                        return [getMin(timeframe), getMax(timeframe)];
                    }
                    return null;
                }),
                borderColor: MapSymbols.colors.historic.border,
                backgroundColor: MapSymbols.colors.historic.background,
            });
        }

        models.forEach((model) => {
            barChartDatasets.push({
                type: 'bar',
                label: t(`Data.Models.${model}.ShortLabel`),
                data: timeframes.map((timeframe) => {
                    if (timeframe === ScreeningData.timeframe.historic) {
                        return null;
                    }
                    const modelTimeframe = model + timeframe;

                    return [getMin(modelTimeframe), getMax(modelTimeframe)];
                }),
                borderColor: MapSymbols.colors.models[model].border,
                backgroundColor: MapSymbols.colors.models[model].background,
            });
        });

        let lineChartDatasets = [];
        if (selectedIndicator.id === 'SLR') {
            lineChartDatasets.push({
                type: 'line',
                showLine: false,
                pointRadius: 8,
                hiddenLegend: true,
                data: timeframes.map((timeframe) => {
                    if (timeframe !== ScreeningData.timeframe.historic) {
                        return null;
                    }
                    const min = getMin(timeframe);
                    const max = getMax(timeframe);
                    const mean = getMean(timeframe);

                    return min === max ? mean : null;
                }),
                borderColor: MapSymbols.colors.historic.border,
                backgroundColor: MapSymbols.colors.historic.background,
            });
        }

        models.forEach((model) => {
            lineChartDatasets.push({
                type: 'line',
                showLine: false,
                pointRadius: 8,
                hiddenLegend: true,
                data: timeframes.map((timeframe) => {
                    if (timeframe === ScreeningData.timeframe.historic) {
                        return null;
                    }

                    const modelTimeframe = model + timeframe;

                    const min = getMin(modelTimeframe);
                    const max = getMax(modelTimeframe);

                    const mean = getMean(modelTimeframe);

                    return min === max ? mean : null;
                }),
                borderColor: MapSymbols.colors.models[model].border,
                backgroundColor: MapSymbols.colors.models[model].background,
            });
        });

        // add historic point
        let data = {
            labels,
            datasets: [...barChartDatasets, ...lineChartDatasets],
        };
        setChartData(data);
    }, [selectedHazard, selectedIndicator, t]);

    return (
        selectedIndicator &&
        chartData && (
            <div className="indicatorChart-canvas">
                <Chart
                    type="bar"
                    data={chartData}
                    options={{
                        scales: {
                            y: {
                                beginAtZero: false,
                            },
                        },
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    filter: function (legendItem, chartData) {
                                        return chartData.datasets[legendItem.datasetIndex].label;
                                    },
                                },
                                title: {
                                    display: false,
                                },
                            },
                        },
                        maintainAspectRatio: false,
                    }}
                />
            </div>
        )
    );
};

export default IndicatorChart;
