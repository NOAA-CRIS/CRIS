// Framework and third-party non-ui
import React, { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';

// App components

// Component specific modules (Component-styled, etc.)
import './TimeframeSelect.scss';

// Third-party components (buttons, icons, etc.)
import { Dropdown } from '@trussworks/react-uswds';

const TimeframeSelect = ({ timeframes }) => {
    const { t } = useTranslation();
    const [timeframeOptions, setTimeframeOptions] = useState(Object.values(ScreeningData.timeframe));
    const { timeframe, setTimeframe } = useAppContext();

    useEffect(() => {
        if (timeframes?.length && timeframe) {
            if (!timeframes.includes(timeframe)) {
                setTimeframe(timeframes[0]);
            }
        }
    }, [setTimeframe, timeframe, timeframes]);

    useEffect(() => {
        if (timeframes?.length) {
            setTimeframeOptions(timeframes);
        }
    }, [timeframes]);

    return (
        <div className="timeframeSelect-container grid-row flex-column">
            <h2 className="font-serif-2md" htmlFor="timeframe-dropdown">
                {t('Inputs.Timeframe.All')}
            </h2>
            <Dropdown
                id="timeframe-dropdown"
                name="timeframe-dropdown"
                defaultValue={timeframe}
                onChange={(event) => {
                    if (event?.target?.value) {
                        setTimeframe(event.target.value);
                    }
                }}
            >
                {timeframeOptions.map((timeframe, idx) => {
                    return (
                        <option value={timeframe} key={idx}>
                            {t(`Data.Time.${timeframe}.Label`) + ' (' + t(`Data.Time.${timeframe}.Years`) + ')'}
                        </option>
                    );
                })}
            </Dropdown>
        </div>
    );
};

export default TimeframeSelect;
