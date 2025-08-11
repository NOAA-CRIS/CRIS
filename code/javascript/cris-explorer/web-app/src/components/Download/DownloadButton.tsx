// Framework and third-party non-ui
import React from 'react';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js';
import html2canvas from 'html2canvas';

// App components

// Utilities
import { properCase } from '../../utilities/chart';
import { Parser } from '@json2csv/plainjs';
import { default as defaultFormatter, number as numberFormatter } from '@json2csv/formatters';

// JSON & Styles

// Hooks, context, and constants
import { useAppContext } from '../../contexts/AppContext';
import DataDictionary from '../../constants/DataDictionary.json';
import AppConfig from '../../constants/AppConfig.json';

// Third-party components (buttons, icons, etc.)
import { Button, Icon } from '@trussworks/react-uswds';

// Internationalization
import { useTranslation } from 'react-i18next';

import './DownloadButton.scss';

const DownloadButton = () => {
    const { t } = useTranslation();
    const {
        chart,
        geoName,
        indicator,
        vizType,
        tabbedValues,
        mapView,
        chartFeatures,
        geoType,
        geoId,
        setAlertInfo,
        selectedTab,
    } = useAppContext();

    const { modelSet, model, scenario, grid, decadeType, decade, statistic } = tabbedValues[selectedTab];

    /**
     * Downloads a CSV file with the given content and filename.
     *
     * @param {string} csvContent - The content of the CSV file.
     * @param {string} filename - The name of the file to be downloaded.
     */
    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden'; // Hide the link

        document.body.appendChild(link); // Append
        link.click(); // Click
        document.body.removeChild(link); // Remove
        URL.revokeObjectURL(link.href); // Free up memory
    };

    const generateCSV = (chartFeatures, indicator) => {
        console.log(chartFeatures);
        const allItems = [
            ...chartFeatures[DataDictionary.decadeTypes.FUTURE].map((f) => {
                return { ...f.attributes, type: t('DataDictionary.decadeTypes.FUTURE') };
            }),
            ...chartFeatures[DataDictionary.decadeTypes.PAST_MODELED].map((f) => {
                return { ...f.attributes, type: t('DataDictionary.decadeTypes.PAST_MODELED') };
            }),
            ...chartFeatures[DataDictionary.decadeTypes.PAST_OBSERVED].map((f) => {
                return { ...f.attributes, type: t('DataDictionary.decadeTypes.PAST_OBSERVED') };
            }),
        ];

        allItems.sort(function (a, b) {
            return b[AppConfig.fieldNames.year] - a[AppConfig.fieldNames.year] || a.type.localeCompare(b.type);
        });

        const fields = [
            {
                label: t('DataDictionary.labels.decadeTypes'),
                value: 'type',
                default: '',
            },
            {
                label: 'Year',
                value: AppConfig.fieldNames.year,
                default: '',
            },
            {
                label: 'GEO ID',
                value: AppConfig.fieldNames.geoId,
                default: '',
            },
            {
                label: t('DataDictionary.labels.modelSets'),
                value: AppConfig.fieldNames.modelSet,
                default: '',
            },
            {
                label: t('DataDictionary.labels.models'),
                value: AppConfig.fieldNames.model,
                default: '',
            },
        ];
        const baseLabel = properCase(t(`DataDictionary.indicators.${indicator}.Title`));

        // FUTURE MODELED VALUES
        Object.values(DataDictionary.scenarios).forEach((ssp) => {
            Object.values(DataDictionary.statistics).forEach((stat) => {
                fields.push({
                    label: ` ${baseLabel} - ${t(`DataDictionary.scenarios.${ssp}`)} - ${t(
                        `DataDictionary.statistics.${stat}`
                    )}`,
                    value: `${indicator}_${ssp}_${stat}`,
                    default: '',
                });
            });
        });

        // HISTORIC MODELED VALUES
        Object.values(DataDictionary.statistics).forEach((stat) => {
            fields.push({
                label: ` ${baseLabel} - ${t(`DataDictionary.statistics.${stat}`)}`,
                value: `${indicator}_${stat}`,
                default: '',
            });
        });

        // HISTORIC OBSERVED
        Object.values(DataDictionary.grids).forEach((grid) => {
            fields.push({
                label: ` ${baseLabel} - ${t(`DataDictionary.grids.${grid}`)} - ${t(`DataDictionary.statistics.MEAN`)}`,
                value: `${indicator}_${grid}_${DataDictionary.statistics.MEAN}`,
                default: '',
            });
        });

        try {
            const parser = new Parser({
                fields: fields,
                formatters: {
                    number: numberFormatter({ decimals: 2 }),
                },
            });
            const csv = parser.parse(allItems);
            return csv;
        } catch (err) {
            console.error(err);
        }
    };
    /**
     * Generates a CSV string from the given chart features.
     *
     * @param {Object} chartFeatures - An object containing arrays of graphics, keyed by feature type.
     * @returns {string} - The generated CSV content as a string.
     *
     * This function processes the chart features to extract unique headers and rows of data.
     * It iterates through each feature type in the chartFeatures object, and for each graphic,
     * it collects the attributes into rows and ensures all rows have the same headers.
     * Finally, it constructs a CSV string with a header row and data rows.
     */
    const generateCSV_OLD = (chartFeatures) => {
        const headers = new Set(); // To store unique headers
        const rows: { [key: string]: any }[] = [];

        console.log(chartFeatures);

        // Define the fields to include
        const includedFields = Object.values(AppConfig.fieldNames);

        // Loop through each key in the chartFeatures object
        for (const key in chartFeatures) {
            if (chartFeatures.hasOwnProperty(key)) {
                const graphics = chartFeatures[key]; // Access the array of graphics
                // Loop through each graphic in the current array
                graphics.forEach((graphic) => {
                    const row = {};
                    for (const [property, value] of Object.entries(graphic.attributes)) {
                        // Include the property if it's in the includedFields or starts with the indicator
                        let formattedProperty;
                        if (property.startsWith(indicator)) {
                            const parts = property.split('_');
                            const part1 = parts[1];
                            const part2 = parts[2];
                            // Format the property based on the parts
                            // Use the DataDictionary to get the proper case of the indicator, scenario, grid, or statistic
                            formattedProperty = `${
                                indicator ? `${properCase(t(`DataDictionary.indicators.${indicator}.Title`))}` : ''
                            }${
                                DataDictionary.scenarios.hasOwnProperty(part1)
                                    ? `_${t(`DataDictionary.scenarios.${part1}`)}`
                                    : DataDictionary.grids.hasOwnProperty(part1)
                                    ? `_${t(`DataDictionary.grids.${part1}`)}`
                                    : DataDictionary.statistics.hasOwnProperty(part1)
                                    ? `_${t(`DataDictionary.statistics.${part1}`)}`
                                    : ''
                            }${
                                part2 && DataDictionary.statistics.hasOwnProperty(part2)
                                    ? `_${t(`DataDictionary.statistics.${part2}`)}`
                                    : ''
                            }`;
                        } else if (includedFields.includes(property)) {
                            formattedProperty = property;
                        }
                        if (formattedProperty) {
                            row[formattedProperty] = value; // Store each property in the row
                            headers.add(formattedProperty); // Add property to headers set
                        }
                    }
                    // Ensure all rows have the same headers
                    const completeRow = [key];
                    headers.forEach((header) => {
                        completeRow.push((row as { [key: string]: any })[header as string] || ''); // Fill in values or empty string
                    });
                    rows.push(completeRow);
                });
            }
        }

        // Convert headers set to an array
        const headerArray = Array.from(headers);

        // Create CSV string
        const csvContent = [
            ['CLIMATOLOGY_DATASET', ...headerArray].join(','), // Header row with "Array Name"
            ...rows.map((row) => row.join(',')), // Data rows
        ].join('\n');

        return csvContent;
    };

    /**
     * Combines a map view screenshot with a map legend into a single image.
     *
     * This function takes a screenshot of the map view and an HTML element
     * (representing the map legend), and combines them into a single image.
     * The resulting image includes the screenshot of the map view stacked above
     * the map legend. This avoids any issues overlaying the legend on the map
     * view directly, which may hide map features.
     *
     * @param {Object} screenshot - The map view screenshot object containing image data.
     * @param {HTMLElement} htmlElement - The HTML element representing the map legend.
     * @returns {Promise<string>} - A promise that resolves to a data URL of the combined image.
     */
    const getImageWithMapLegend = async (screenshot, htmlElement) => {
        const imageData = screenshot.data;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Capture the text element using html2canvas
        const textCanvas = await html2canvas(htmlElement);

        // Set the canvas width to the width of the screenshot image
        canvas.width = imageData.width;

        // Set the canvas height to the combined height of the screenshot image and the text element
        canvas.height = imageData.height + textCanvas.height;

        // Draw the screenshot onto the canvas
        context?.putImageData(imageData, 0, 0);

        // Draw the text element below the screenshot
        context?.drawImage(textCanvas, 0, imageData.height);

        return canvas.toDataURL();
    };

    /**
     * Sets the font size recursively for an HTML element and its children.
     *
     * This function takes an HTML element and a font size, and sets the font size
     * for the element and all its children recursively.
     *
     * @param {HTMLElement} element - The HTML element to set the font size for.
     * @param {string} fontSize - The font size to set.
     * @returns {void}
     */
    const setFontSizeRecursively = (element, fontSize) => {
        element.style.fontSize = fontSize;
        Array.from(element.children).forEach((child) => setFontSizeRecursively(child, fontSize));
    };

    /**
     * Downloads the chart as a PNG image.
     *
     * This function downloads the current chart as a PNG image. The image is saved
     * with a filename that includes various parameters such as the indicator, geography,
     * model, scenario, grid, decade, and statistic.
     *
     * @param {HTMLImageElement} img - The image element containing the chart data.
     * @param {HTMLElement} chartLegend - The HTML element representing the chart legend.
     * @returns {void}
     */
    const downloadChart = async (img, chartLegend) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
            ctx.drawImage(img, 0, 0);
            if (chartLegend) {
                // Filter checked inputs
                const checkedInputs = (
                    Array.from(chartLegend?.querySelectorAll('input') || []) as HTMLInputElement[]
                ).filter((input) => input.checked);

                // Create a detached temporary container for the checked inputs
                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.style.display = 'flex'; // Use flexbox
                tempContainer.style.gap = '20px'; // Add spacing between elements
                tempContainer.style.flexDirection = 'row'; // Orient contents horizontally
                document.body.appendChild(tempContainer);

                checkedInputs.forEach((input) => {
                    const parentDiv = input.closest('div');
                    if (parentDiv) {
                        const clonedDiv = parentDiv.cloneNode(true) as HTMLElement;
                        setFontSizeRecursively(clonedDiv, '40px'); // Set font size to 36px for clonedDiv and all its children
                        tempContainer.appendChild(clonedDiv);
                    }
                });

                // Ensure the styles are applied before capturing the canvas
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Capture the temporary container with html2canvas
                const legendCanvas = await html2canvas(tempContainer);

                // Remove the temporary container from the DOM
                document.body.removeChild(tempContainer);

                // Calculate the position to center the legend on the canvas
                const insetX = canvas.width - legendCanvas.width - 10; // Center horizontally
                const insetY = 50; // Inset from the top
                ctx.drawImage(legendCanvas, insetX, insetY);
            }
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            const fileNameParts = [
                'Chart',
                geoName ? `_${geoName}` : '',
                indicator ? `_${properCase(t(`DataDictionary.indicators.${indicator}.Title`))}` : '',
                decade?.toString(),
            ];
            if (decadeType === DataDictionary.decadeTypes.PAST_OBSERVED) {
                fileNameParts.push(grid);
            } else if (decadeType === DataDictionary.decadeTypes.PAST_MODELED) {
                fileNameParts.push(modelSet);
                fileNameParts.push(model);
            } else if (decadeType === DataDictionary.decadeTypes.FUTURE) {
                fileNameParts.push(modelSet);
                fileNameParts.push(model);
                fileNameParts.push(scenario);
            }

            a.download = fileNameParts.filter(Boolean).join('') + '.png';
            // a.click();
            const csv = generateCSV(chartFeatures, indicator);
            downloadCSV(
                csv,
                `${indicator ? `${indicator}` : ''}${geoType ? `_${geoType}` : ''}${geoId ? `_${geoId}` : ''}.csv`
            );
        }
    };

    /**
     * Downloads the chart or map as a PNG image.
     *
     * This function downloads the current chart or map as a PNG image. The image is saved
     * with a filename that includes various parameters such as the indicator, geography,
     * model, scenario, grid, decade, and statistic.
     *
     * @returns {void}
     */
    const download = () => {
        const a = document.createElement('a');
        const img = new Image();

        switch (vizType) {
            case DataDictionary.vizTypes.chart:
                const chartLegend = document.querySelector('.chartControls--container');
                img.src = chart.getDataURL({
                    pixelRatio: 2,
                    backgroundColor: '#fff',
                    excludeComponents: ['toolbox'],
                });
                img.onload = () => downloadChart(img, chartLegend);
                break;
            case DataDictionary.vizTypes.map:
                reactiveUtils
                    .whenOnce(() => !mapView.updating)
                    .then(() => {
                        mapView
                            .takeScreenshot()
                            .then((screenshot) => {
                                const mapLegendElement = document.querySelector(
                                    '.esri-component.esri-legend.esri-widget.esri-widget--panel'
                                );
                                getImageWithMapLegend(screenshot, mapLegendElement)
                                    .then((dataUrl) => {
                                        a.href = dataUrl;
                                        const fileNameParts = [
                                            'Map',
                                            indicator
                                                ? `${properCase(t(`DataDictionary.indicators.${indicator}.Title`))}`
                                                : '',
                                            decade?.toString(),
                                        ];
                                        if (decadeType === DataDictionary.decadeTypes.PAST_OBSERVED) {
                                            fileNameParts.push(grid);
                                        } else if (decadeType === DataDictionary.decadeTypes.PAST_MODELED) {
                                            fileNameParts.push(modelSet);
                                            fileNameParts.push(model);
                                        } else if (decadeType === DataDictionary.decadeTypes.FUTURE) {
                                            fileNameParts.push(modelSet);
                                            fileNameParts.push(model);
                                            fileNameParts.push(scenario);
                                        }
                                        a.download = fileNameParts.filter(Boolean).join('_') + '.png';
                                        a.click();
                                        // Clean up and remove the link
                                        if (document.body.contains(a)) {
                                            document.body.removeChild(a);
                                        }
                                        URL.revokeObjectURL(a.href); // Free up memory
                                    })
                                    .catch((error) => {
                                        console.error('Error downloading map image:', error);
                                        setAlertInfo({
                                            type: 'error',
                                            message: t('App.errors.download.mapImage'),
                                        });
                                    });
                            })
                            .catch((error) => {
                                console.error('Error taking map screenshot:', error);
                                setAlertInfo({
                                    type: 'error',
                                    message: t('App.errors.download.mapScreenshot'),
                                });
                            });
                    })
                    .catch((error) => {
                        console.error('Error handling view reactiveness:', error);
                        setAlertInfo({
                            type: 'error',
                            message: t('App.errors.download.mapReactiveness'),
                        });
                    });
                break;
            default:
                console.log('Download type not recognized.');
                break;
        }
    };

    return (
        <div className="download-button">
            <Button
                type="button"
                title={
                    vizType === DataDictionary.vizTypes.chart ? t('Download.DownloadGraph') : t('Download.DownloadMap')
                }
                aria-label={t('DataDictionary.labels.download')}
                onClick={download}
            >
                <Icon.FileDownload aria-hidden="true" focusable={false} />
            </Button>
        </div>
    );
};

export default DownloadButton;
