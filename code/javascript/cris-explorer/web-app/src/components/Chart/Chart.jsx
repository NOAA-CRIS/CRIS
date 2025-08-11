import { useCallback, useEffect } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import DataDictionary from '../../constants/DataDictionary.json';
import ChartConfig from '../../constants/ChartConfig.json';
import AppConfig from '../../constants/AppConfig.json';

// App components

// Utilities
import { createSeries, extractYears, featuresToChartData, getChartFeatures, properCase } from '../../utilities/chart';

import { roundValue } from '../../utilities/mapUtils';

// JSON & Styles
import './Chart.scss';

// Third-party components (buttons, icons, etc.)
import * as echarts from 'echarts';

/**
 ********** CHART COMPONENT **********
 **/
const Chart = () => {
    const [t] = useTranslation();
    // Get values from context
    const {
        chart,
        setChart,
        geoId,
        geoType,
        indicator,
        tabbedValues,
        selectedTab,
        chartFeatures,
        setChartFeatures,
        setAlertInfo,
        vizType,
    } = useAppContext();
    // const [chartFeatures, setChartFeatures] = useState({
    //     [DataDictionary.decadeTypes.FUTURE]: [],
    //     [DataDictionary.decadeTypes.PAST_MODELED]: [],
    //     [DataDictionary.decadeTypes.PAST_OBSERVED]: [],
    // });

    /**
     * Constructs the chart instance.
     *
     * @param {HTMLElement} el - The DOM element where the chart will be initialized.
     * @param {Object} options - The configuration options for the chart.
     * @returns {Object} - The initialized chart instance.
     */
    const constructChart = useCallback(async () => {
        // Get the unique years
        const uniqueYears = [
            ...new Set([
                ...extractYears(chartFeatures[DataDictionary.decadeTypes.FUTURE]),
                ...extractYears(chartFeatures[DataDictionary.decadeTypes.PAST_MODELED]),
                ...extractYears(chartFeatures[DataDictionary.decadeTypes.PAST_OBSERVED]),
            ]),
        ].sort((a, b) => a - b);
        const allSeries = [];
        ChartConfig.series.forEach((config) => {
            const chartData = featuresToChartData(
                uniqueYears,
                chartFeatures[config.decadeType],
                config.grid,
                config.ssp,
                indicator
            );

            const chartSeries = createSeries(
                chartData,
                config.colors,
                config.id,
                config.chartType,
                setAlertInfo,
                t,
                'App.errors.chart.series'
            );
            chartSeries.forEach((series) => allSeries.push(series));
        });

        // Combine all series
        const option = {
            legend: {
                show: false,
            },
            title: {
                // text: properCase(t(`DataDictionary.indicators.${indicator}.Title`)),
                // subtext: ChartConfig.subtext,
                left: 'center',
            },
            dataZoom: [
                {
                    type: 'slider',
                    showDataShadow: false,
                },
                {
                    type: 'inside',
                },
            ],
            // toolbox: {
            //     show: true,
            //     // feature: {
            //     // dataZoom: {
            //     //     yAxisIndex: false,
            //     // },
            //     // dataView: { readOnly: false },
            //     // magicType: { type: ['line', 'bar'] },
            //     // restore: {},
            //     // saveAsImage: {
            //     //     type: 'png',
            //     // },
            //     // },
            //     left: 'right',
            //     top: 20,
            // },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: ChartConfig.tooltipLabel,
                },
                formatter: (params) => {
                    const { model } = tabbedValues[selectedTab];

                    // Set the tooltip to the axis value (year)
                    let tooltip = `${params[0].axisValue}<br />`;
                    // Loop through the params and construct the tooltip
                    tooltip += params
                        .slice(0)
                        .map((param) => {
                            // Skip if the value is empty
                            if (!param.value) return;
                            // Check if the series name includes the maximum value
                            if (param.seriesName.toUpperCase().includes(DataDictionary.statistics.MAX.toUpperCase())) {
                                // Find the corresponding series with the minimum value
                                const valueToAdd = params.find((p) =>
                                    p.seriesName.includes(
                                        param.seriesName.replace(
                                            DataDictionary.statistics.MAX.toLowerCase(),
                                            DataDictionary.statistics.MIN.toLowerCase()
                                        )
                                    )
                                );
                                // If the corresponding series exists and has a value, add it to the current value
                                if (valueToAdd && valueToAdd.value) {
                                    param.value += valueToAdd.value;
                                }
                            }
                            // Format the value
                            const value = param.value ? roundValue(param.value) : '';
                            // If the value is not an empty string or null, return the series name and value
                            if (value !== '') {
                                const [ind, stat] = param.seriesName.split(' ');
                                const indicator = t(`Chart.series.${ind}`);
                                const statistic = t(`DataDictionary.statistics.${stat.toUpperCase()}`);
                                const isMean = stat.toUpperCase() === DataDictionary.statistics.MEAN;
                                const modelText = isMean
                                    ? t(`DataDictionary.models.${model}`)
                                    : t('DataDictionary.models.Ensemble');
                                return `${indicator} ${modelText} ${statistic}: ${value}<br />`;
                            } else {
                                // Otherwise, return nothing
                                return;
                            }
                        })
                        .reverse() // desired order is Max, Mean, Min
                        .join('');
                    return tooltip;
                },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: uniqueYears,
                boundaryGap: false,
            },
            yAxis: {
                scale: true,
                // type: 'value',
                // position: 'left',
                // alignTicks: true,
                // axisLabel: {
                //     margin: 30,
                //     fontSize: 16,
                //     formatter: '{value}',
                // },
                // name:
                //     indicator === DataDictionary.indicators[indicator]
                //         ? properCase(t(`DataDictionary.indicators.${indicator}.Postfix`))
                //         : t(`Some other climate variable.`),
                // nameLocation: 'center',
                // nameGap: 75,
                // nameTextStyle: {
                //     fontSize: 16,
                //     padding: [0, 0, 0, 0],
                // },
                // Set max value to the next multiple of 50
                // max: function (value) {
                //     return calculateMaxYValue(value);
                // },
            },
            series: allSeries,
            emphasis: {
                disabled: true,
            },
        };
        console.log(option.series);

        chart.setOption(option);
    }, [chart, chartFeatures, indicator, setAlertInfo, t]);

    /**
     ********** EFFECTS **********
     **/
    useEffect(() => {
        /**
         * Effect to initialize and manage the chart instance.
         *
         * This effect initializes a new ECharts instance on the specified DOM element,
         * handles window resize events to resize the chart, and cleans up the chart instance
         * on component unmount.
         *
         * Dependencies:
         * - This effect runs whenever the `id` or `setChart` dependencies change.
         */

        // Get the DOM element by ID
        const el = document.getElementById(ChartConfig.chartId);
        if (!el) {
            return; // Exit if the element is not found
        }

        // Dispose of any existing chart instance on the element
        if (echarts.getInstanceByDom(el)) {
            echarts.dispose(el);
        }

        // Initialize a new chart instance
        const chart = echarts.init(el, null, {
            renderer: 'canvas',
            useDirtyRect: false,
        });

        // Handle window resize to resize the chart
        const handleResize = () => {
            chart.resize();
        };
        window.addEventListener('resize', handleResize);

        // Set the chart instance to state
        setChart(chart);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart) {
                chart.dispose();
            }
        };
    }, [setChart]);

    useEffect(() => {
        if (chart) {
            chart.resize();
        }
    }, [chart, vizType]);

    useEffect(() => {
        /**
         * Effect to construct the chart when all necessary data is available.
         *
         * This effect defines an asynchronous function `constructTheChart` that calls `constructChart`.
         * It checks if the chart instance (`chart`) and all required feature arrays
         * (`modeledProjectionsAnnualFeatures`, `modeledHistoryAnnualFeatures`, `observedClimatologyAnnualFeatures`)
         * have data. If all conditions are met, it calls `constructTheChart` to construct the chart.
         *
         * Dependencies:
         * - This effect runs whenever `chart`, `modeledProjectionsAnnualFeatures`,
         *   `modeledHistoryAnnualFeatures`, or `observedClimatologyAnnualFeatures` change.
         */

        // Define an asynchronous function to construct the chart
        async function constructTheChart() {
            return await constructChart();
        }
        // Check if the chart instance and all required feature arrays have data
        if (chart && indicator && chartFeatures[DataDictionary.decadeTypes.FUTURE]?.length) {
            // Construct the chart
            constructTheChart();
        }
    }, [chart, chartFeatures, constructChart, indicator]);

    useEffect(() => {
        if (!geoId) {
            setChartFeatures({
                [DataDictionary.decadeTypes.FUTURE]: [],
                [DataDictionary.decadeTypes.PAST_MODELED]: [],
                [DataDictionary.decadeTypes.PAST_OBSERVED]: [],
            });
            return;
        }
        const { model, modelSet } = tabbedValues[selectedTab];

        getChartFeatures(geoType, geoId, modelSet, model, t, setAlertInfo, 'App.errors.chart.data')
            .then((results) => {
                setChartFeatures(results);
            })
            .catch((error) => {
                console.error('Error fetching chart features:', error);
                setAlertInfo({
                    type: 'error',
                    message: t('App.errors.chart.fetching'),
                });
            });
    }, [geoId, geoType, tabbedValues, selectedTab, setChartFeatures, setAlertInfo, t]);

    return (
        <div className="chart--container">
            <h1 className="chart--title">{properCase(t(`DataDictionary.indicators.${indicator}.Title`))}</h1>
            <h3 className="chart--y-title">
                {DataDictionary.indicators[indicator]
                    ? properCase(t(`DataDictionary.indicators.${indicator}.Postfix`))
                    : t(`Some other climate variable.`)}
            </h3>
            <div id={ChartConfig.chartId} />
        </div>
    );
};

export default Chart;
