// Framework and third-party non-ui
import React from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import ScreeningData from '../../constants/ScreeningData';

// App components

// Component specific modules (Component-styled, etc.)
import './IndicatorValueCard.scss';
import { indicatorKeyToString, indicatorToString } from '../../utilities/indicatorUtils';

// Third-party components (buttons, icons, etc.)

const IndicatorValueCard = ({ indicator, timeframe, model, statistic, specialFieldIndex, color }) => {
    // ----- Language -----
    const { t } = useTranslation();
    let formattedValue = '';
    let postfix = '';
    let details = '';

    if (!indicator) {
        return <div className="indicatorValueCard-container grid-row flex-column flex-justify"></div>;
    }

    if (indicator.dataFields) {
        try {
            const data = indicator.dataFields[specialFieldIndex];
            postfix = t(`Indicators.${indicator.id}.${data.fieldName}.Postfix`);
            details = t(`Indicators.${indicator.id}.${data.fieldName}.Details`);
            formattedValue = indicatorToString(data, indicator[data.fieldName]);
        } catch (error) {
            return <div className="indicatorValueCard-container grid-row flex-column flex-justify"></div>;
        }
    } else {
        postfix = t(`Indicators.${indicator.id}.Postfix`);
        details = t(`Indicators.${indicator.id}.Details`);
        const prefix = timeframe === ScreeningData.timeframe.historic ? timeframe : model + timeframe;
        formattedValue = indicatorKeyToString(indicator, `${prefix}_${statistic}`);
    }

    return (
        <div
            className={
                'indicatorValueCard-container grid-row flex-row ' +
                (indicator.dataFields ? 'indicatorValueCard-container--double' : null)
            }
        >
            <div className="indicatorValueCard-value-container grid-row flex-row">
                <div className="indicatorValueCard-value-block" style={{ backgroundColor: color }}></div>
                <h3 className="font-sans-2xl">{formattedValue}</h3>
                <div className="indicatorValueCard-value-postfix font-sans-4xs">{postfix}</div>
            </div>
            <div className="indicatorValueCard-value-details font-sans-2xs">{details}</div>
        </div>
    );
};

export default IndicatorValueCard;
