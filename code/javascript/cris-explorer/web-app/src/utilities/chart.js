import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

// Hooks, context, and constants
import DataDictionary from '../constants/DataDictionary.json';
import ChartConfig from '../constants/ChartConfig.json';
import { services, fieldNames } from '../constants/AppConfig.json';

/**
 * Maps attributes of features to min, mean, and max values.
 *
 * @param {Number[]} allYears - The array of years for all data series.
 * @param {Array} features - The array of features to map attributes from.
 * @param {string} grid - The grid for historical observation data.
 * @param {string} ssp - The ssp values.
 * @param {string} indicator - Indicator String.
 * @returns {Object|Array} - The mapped attributes, either as an object with min, mean, and max values or as an array of ssp values with their respective min, mean, and max values.
 */
export const featuresToChartData = (allYears, features, grid, ssp, indicator) => {
    const minValues = [];
    const meanValues = [];
    const maxValues = [];
    const firstYear = features[0].attributes[fieldNames.year];
    const lastYear = features[features.length - 1].attributes[fieldNames.year];

    for (let i = 0; i < allYears.length; i++) {
        const year = allYears[i];
        if (year < firstYear) {
            minValues.push(null);
            meanValues.push(null);
            maxValues.push(null);
        }
    }
    let baseFieldName = indicator;
    if (ssp) {
        baseFieldName += '_' + ssp;
    } else if (grid) {
        baseFieldName += '_' + grid;
    }

    features.forEach((item) => {
        const min = item.attributes[`${baseFieldName}_${DataDictionary.statistics['MIN']}`];
        const mean = item.attributes[`${baseFieldName}_${DataDictionary.statistics['MEAN']}`];
        let max = item.attributes[`${baseFieldName}_${DataDictionary.statistics['MAX']}`];
        max -= min;
        minValues.push(min);
        meanValues.push(mean);
        maxValues.push(max);
    });

    for (let i = 0; i < allYears.length; i++) {
        const year = allYears[i];
        if (year > lastYear) {
            minValues.push(null);
            meanValues.push(null);
            maxValues.push(null);
        }
    }

    return { minValues, meanValues, maxValues };
};

/**
 * Function to extract years from features.
 *
 * @param {Array} features - The array of feature objects from which years will be extracted.
 * @returns {Array} - An array of years extracted from the features.
 */
export const extractYears = (features) => {
    return features.map((feature) => feature.attributes[`${fieldNames.year}`]);
};

/**
 * Function to find years in one set but not in another.
 *
 * @param {Array} setA - The first array of years.
 * @param {Array} setB - The second array of years to compare against.
 * @returns {Array} - An array of years that are in setA but not in setB.
 */
export const findYearsNotInSet = (setA, setB) => {
    if (!setA || !setB) {
        return [];
    }
    return [...setA].filter((x) => !setB.has(x));
};

/**
 * Helper function to set the y-axis max to the next multiple of 50 beyond the max value of the data.
 *
 * @param {Array<number>} data - The array of data values.
 * @returns {number} - The next multiple of 50 beyond the max value of the data.
 */
export const calculateMaxYValue = (value) => {
    return Math.ceil(value.max / 50) * 50;
};

/**
 * Utility function to create series for a given data set.
 *
 * @param {Array<Object>} dataSet - The array of data objects to create the series from.
 * @param {Array<Object>} colors - The array 2 hex colors.
 * @param {Array<Object>} stackName - Name of the series.
 * @param {string} chartType - See ChartConfig.chartTypes BAR | MIN_MAX
 * @returns {Array<Object>} - An array of series objects created from the data set.
 */
export const createSeries = (dataSet, colors, stackName, chartType, setAlertInfo, t, series) => {
    try {
        if (chartType === ChartConfig.chartTypes.BAR) {
            return createBarSeries(dataSet, colors, stackName);
        }
        if (chartType === ChartConfig.chartTypes.LINE) {
            return createLineSeries(dataSet, colors, stackName);
        }
        if (chartType === ChartConfig.chartTypes.MIN_MAX) {
            return createMinMaxSeries(dataSet, colors, stackName);
        }
    } catch (err) {
        console.error(t(series), err);
        setAlertInfo({
            type: 'error',
            message: t(series),
        });
        return [];
    }
};

export const createMinMaxSeries = (dataSet, colors, stackName) => {
    // Create the shaded series for the SSPs and modeled history

    const shadedSeries = [
        {
            name: `${stackName} ${DataDictionary.statistics['MIN'].toLowerCase()}`,
            type: 'line',
            data: dataSet.minValues,
            lineStyle: {
                opacity: 0,
            },
            stack: stackName,
            stackStrategy: 'all',
            symbol: 'none',
            triggerLineEvent: true,
            showSymbol: true,
        },
        {
            name: `${stackName} ${DataDictionary.statistics['MEAN'].toLowerCase()}`,
            type: 'line',
            symbol: 'circle',
            symbolSize: 6,
            data: dataSet.meanValues,
            lineStyle: {
                color: colors[0],
                opacity: 1,
            },
            itemStyle: {
                opacity: 1,
                color: colors[0],
            },
            triggerLineEvent: true,
            showSymbol: true,
        },
        {
            name: `${stackName} ${DataDictionary.statistics['MAX'].toLowerCase()}`,
            type: 'line',
            data: dataSet.maxValues,
            lineStyle: {
                opacity: 0,
            },
            areaStyle: {
                color: colors[1],
                opacity: 0.6,
            },
            stack: stackName,
            stackStrategy: 'all',
            symbol: 'none',
            triggerLineEvent: true,
            showSymbol: true,
        },
    ];

    return shadedSeries;
};

export const createLineSeries = (dataSet, colors, stackName) => {
    // Create the shaded series for the SSPs and modeled history

    const lineSeries = [
        {
            name: `${stackName} ${DataDictionary.statistics['MEAN'].toLowerCase()}`,
            type: 'line',
            symbol: 'circle',
            symbolSize: 6,
            data: dataSet.meanValues,
            lineStyle: {
                color: colors[0],
                opacity: 1,
            },
            itemStyle: {
                opacity: 1,
                color: colors[0],
            },
            triggerLineEvent: true,
            showSymbol: true,
        },
    ];

    return lineSeries;
};

export const createBarSeries = (dataSet, colors, stackName) => {
    // Create the bar series for the observed climatology
    const barSeries = [
        {
            name: `${stackName} ${DataDictionary.statistics['MEAN'].toLowerCase()}`,
            type: 'bar',
            data: dataSet.meanValues,
            itemStyle: {
                color: colors[0],
                opacity: 1,
            },
        },
    ];

    return barSeries;
};

/**
 * Get the features from each table and construct the chart.
 *
 * This function retrieves the features from each data table and uses them to construct the chart.
 * @param {string} geoType - value from DataDictionary.geoTypes.
 * @param {string} modeledWhere - string value of the where clause for the modeled data (past and future).
 * @param {string} observedWhere - string value of the where clause for the past observed data.
 * @returns {void} - This function does not return a value.
 */
export const getChartFeatures = async (geoType, geoId, modelSet, model, t, setAlertInfo, dataError) => {
    const modeledWhere = `${fieldNames.geoId} = '${geoId}' AND ${fieldNames.modelSet} = '${modelSet}' AND ${fieldNames.model} = '${model}'`;

    const observedWhere = `${fieldNames.geoId} = '${geoId}'`;
    const statsWhere =
        modelSet === DataDictionary.modelSets['LOCA2-STAR']
            ? observedWhere
            : `${fieldNames.geoId} = '${geoId}' AND ${fieldNames.modelSet} = '${modelSet}'`;

    console.log('modeledWhere', modeledWhere);
    console.log('statsWhere', statsWhere);
    // Modeled Query
    const modeledQuery = {
        where: modeledWhere,
        outFields: ['*'],
        orderByFields: [`'${fieldNames.year}' ASC`],
    };
    // Observed Query
    const observedQuery = {
        where: observedWhere,
        outFields: ['*'],
        orderByFields: [`'${fieldNames.year}' ASC`],
    };

    const statsTemplate = {
        where: statsWhere,
        groupByFieldsForStatistics: [fieldNames.geoId, fieldNames.year],
        orderByFields: [`'${fieldNames.year}' ASC`],
    };
    try {
        const modeledProjectionsAnnual = new FeatureLayer({ url: services[geoType].FUTURE.url });
        const modeledHistoryAnnual = new FeatureLayer({ url: services[geoType].PAST_MODELED.url });
        const observedClimatologyAnnual = new FeatureLayer({ url: services[geoType].PAST_OBSERVED.url });
        const [
            modeledProjectionsAnnualResults,
            modeledHistoryAnnualResults,
            observedClimatologyAnnualResults,
            modeledProjectionsStatisticsResults,
            modeledHistoryStatisticsResults,
        ] = await Promise.all([
            modeledProjectionsAnnual.queryFeatures(modeledQuery),
            modeledHistoryAnnual.queryFeatures(modeledQuery),
            observedClimatologyAnnual.queryFeatures(observedQuery),
            modeledProjectionsAnnual.queryFeatures({ ...statsTemplate, outStatistics: getOutStatistics(true) }),
            modeledHistoryAnnual.queryFeatures({ ...statsTemplate, outStatistics: getOutStatistics(false) }),
        ]);

        return {
            [DataDictionary.decadeTypes.FUTURE]: mergeMinMaxValues(
                modeledProjectionsAnnualResults.features,
                modeledProjectionsStatisticsResults.features
            ),
            [DataDictionary.decadeTypes.PAST_MODELED]: mergeMinMaxValues(
                modeledHistoryAnnualResults.features,
                modeledHistoryStatisticsResults.features
            ),
            [DataDictionary.decadeTypes.PAST_OBSERVED]: observedClimatologyAnnualResults.features,
        };
    } catch (error) {
        setAlertInfo({
            type: 'error',
            message: t(dataError),
        });
        console.error('Error: ', error);
        throw new Error('Error getting chart data');
    }
};

const getOutStatistics = (hasScenario) => {
    const outStats = [];
    Object.values(DataDictionary.indicators)
        .map((value) => value)
        .forEach((indicator) => {
            if (hasScenario) {
                Object.values(DataDictionary.scenarios)
                    .map((s) => s)
                    .forEach((scenario) => {
                        outStats.push({
                            statisticType: 'max',
                            onStatisticField: `${indicator}_${scenario}_${DataDictionary.statistics.MEAN}`,
                            outStatisticFieldName: `${indicator}_${scenario}_${DataDictionary.statistics.MAX}`,
                        });
                        outStats.push({
                            statisticType: 'min',
                            onStatisticField: `${indicator}_${scenario}_${DataDictionary.statistics.MEAN}`,
                            outStatisticFieldName: `${indicator}_${scenario}_${DataDictionary.statistics.MIN}`,
                        });
                    });
            } else {
                outStats.push({
                    statisticType: 'max',
                    onStatisticField: `${indicator}_${DataDictionary.statistics.MEAN}`,
                    outStatisticFieldName: `${indicator}_${DataDictionary.statistics.MAX}`,
                });
                outStats.push({
                    statisticType: 'min',
                    onStatisticField: `${indicator}_${DataDictionary.statistics.MEAN}`,
                    outStatisticFieldName: `${indicator}_${DataDictionary.statistics.MIN}`,
                });
            }
        });

    return outStats;
};

const mergeMinMaxValues = (meanFeatures, minMaxFeatures) => {
    if (meanFeatures.length !== minMaxFeatures.length) {
        console.warn('data error, returning empty array');
        return [];
    }

    const results = meanFeatures.map((feature, idx) => {
        const attributes = { ...feature.attributes, ...minMaxFeatures[idx].attributes };
        const nullMeanFields = [];
        Object.keys(attributes).forEach((fieldName) => {
            if (fieldName.includes(DataDictionary.statistics.MEAN)) {
                if (feature.attributes[fieldName] === null) {
                    nullMeanFields.push(fieldName);
                }
            }
        });
        // We zero the min and max data if the mean is empty.
        // this is to account for missing data for LOCA2-STAR SSP 3-7.0
        nullMeanFields.forEach((f) => {
            attributes[f.replace(DataDictionary.statistics.MEAN, DataDictionary.statistics.MAX)] = null;
            attributes[f.replace(DataDictionary.statistics.MEAN, DataDictionary.statistics.MIN)] = null;
        });
        return { attributes };
    });
    return results;
};

/**
 * Sets the opacity of the series based on the type of series.
 * @param {Object} series - The series object.
 * @param {number} opacity - The opacity value to set.
 * @returns {void}
 */
export const setOpacity = (series, opacity) => {
    if (series.type === 'bar') {
        if (series.itemStyle) {
            series.itemStyle.opacity = opacity;
        }
        if (series.areaStyle) {
            series.areaStyle.opacity = opacity;
        }
        if (series.lineStyle) {
            series.lineStyle.opacity = opacity;
        }
    } else if (series.type === 'line') {
        opacity = 0;
        if (series.name.toUpperCase().includes(DataDictionary.statistics['MEAN'].toUpperCase())) {
            series.lineStyle.opacity = 0;
        } else {
            series.lineStyle.opacity = 1;
        }
        if (series.areaStyle) {
            series.areaStyle.opacity = 1;
        }
        if (series.lineStyle) {
            if (
                series.name.toUpperCase().includes(DataDictionary.statistics['MAX'].toUpperCase()) ||
                series.name.toUpperCase().includes(DataDictionary.statistics['MIN'].toUpperCase())
            ) {
                series.lineStyle.opacity = 0;
            } else {
                series.lineStyle.opacity = 1;
            }
        }
    }
};

/**
 * Handles the series for line charts.
 * @param {Object} series - The series object.
 * @param {string} buttonText - The text of the button that was clicked.
 * @param {Array<string>} clickedButtons - The array of clicked buttons.
 * @param {boolean} checked - The checked state of the button.
 * @returns {void}
 */
export const handleLineSeries = (series, buttonText, clickedButtons, checked) => {
    // If the button is unchecked, set the opacity to 0
    if (!checked) {
        setOpacity(series, 0);
        if (series.lineStyle) {
            series.lineStyle.opacity = 0;
        }
        if (series.areaStyle) {
            series.areaStyle.opacity = 0;
        }
        return;
    }

    // Count the number of times the button text appears in the clicked buttons array
    const buttonCount = clickedButtons.filter((button) => button.includes(buttonText)).length;

    // If the button has not been clicked, set the opacity to 0 for the series that are not selected
    // and set the opacity to 1 for the series that are selected
    if (buttonCount === 0) {
        setOpacity(series, 0);
        if (series.name.toUpperCase().includes(DataDictionary.statistics['MEAN'].toUpperCase())) {
            series.lineStyle.opacity = 0;
        } else {
            series.lineStyle.opacity = 1;
        }
        if (series.areaStyle) {
            series.areaStyle.opacity = 1;
        }
        if (series.lineStyle) {
            if (
                series.name.toUpperCase().includes(DataDictionary.statistics['MAX'].toUpperCase()) ||
                series.name.toUpperCase().includes(DataDictionary.statistics['MIN'].toUpperCase())
            ) {
                series.lineStyle.opacity = 0;
            } else {
                series.lineStyle.opacity = 1;
            }
        }
        // If the button has been clicked once, set the opacity to 0
    } else if (buttonCount === 1) {
        setOpacity(series, 0);
    }
};

/**
 * Handles the series for bar charts.
 * @param {Object} series - The series object.
 * @param {string} buttonText - The text of the button that was clicked.
 * @param {Array<string>} clickedButtons - The array of clicked buttons.
 * @returns {void}
 */
export const handleBarSeries = (series, buttonText, clickedButtons, checked) => {
    // If the button is unchecked, set the opacity to 0
    if (!checked) {
        setOpacity(series, 0);
        if (series.itemStyle) {
            series.itemStyle.opacity = 0;
        }
        if (series.barStyle) {
            series.barStyle.opacity = 0;
        }
        return;
    }
    // Count the number of times the button text appears in the clicked buttons array
    const buttonCount = clickedButtons.filter((button) => button.includes(buttonText)).length;
    // If the button has not been clicked, set the opacity to 0 for the series that are not selected
    // and set the opacity to 1 for the series that are selected
    if (buttonCount === 0) {
        setOpacity(series, 0);
        if (series.name.toUpperCase().includes(DataDictionary.statistics['MEAN'].toUpperCase())) {
            series.itemStyle.opacity = 0;
        } else {
            series.itemStyle.opacity = 1;
        }
        if (series.barStyle) {
            series.barStyle.opacity = 1;
        }
        if (series.itemStyle) {
            if (
                series.name.toUpperCase().includes(DataDictionary.statistics['MAX'].toUpperCase()) ||
                series.name.toUpperCase().includes(DataDictionary.statistics['MIN'].toUpperCase())
            ) {
                series.itemStyle.opacity = 0;
            } else {
                series.itemStyle.opacity = 1;
            }
        }
    } else if (buttonCount === 1) {
        setOpacity(series, 0);
    }
};

/**
 * Converts a string to proper case.
 * @param {string} str - The string to convert to proper case.
 * @returns {string} - The string in proper case.
 **/
export const properCase = (str) => {
    return str
        .split(' ')
        .map((word) => {
            // Capitalize the first letter of each word
            let properCasedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

            // Check if the word contains the ° symbol
            if (word.includes('°')) {
                // Split the word by the ° symbol and capitalize the part after it
                const parts = word.split('°');
                if (parts[1]) {
                    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
                }
                properCasedWord = parts.join('°');
            }

            return properCasedWord;
        })
        .join(' ');
};
