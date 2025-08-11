// Framework and third-party non-ui

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { decades } from '../../constants/AppConfig.json';

// App components

// Component specific modules (Component-styled, etc.)
import { Label, Select } from '@trussworks/react-uswds';

import './SimpleSelect.scss';
import { useCallback, useEffect } from 'react';

// Third-party components (buttons, icons, etc.)

export const DecadeSelect = ({ decade, setDecade, decadeType, disabled, invalid }) => {
    const [t] = useTranslation();
    useEffect(() => {
        if (decadeType) {
            const min = decades[decadeType].min;
            const max = decades[decadeType].max;
            if (decade < min || decade > max) {
                setDecade(min);
            }
        }
    }, [decade, decadeType, setDecade]);

    const getOptions = useCallback(() => {
        if (decadeType) {
            const min = decades[decadeType].min;
            const max = decades[decadeType].max;

            const options = [];
            for (let i = min; i <= max; i += 10) {
                options.push(
                    <option key={i} value={i}>
                        {i === decades.FUTURE.max ? `${i}` : `${i}s`}
                    </option>
                );
            }
            return options;
        }
    }, [decadeType]);

    return (
        <div className="simple-select">
            <Label htmlFor="input-select">{t(`DataDictionary.labels.decade`)}</Label>
            {invalid ? (
                <Select id="input-select" name="input-select" className="simple-select__field" disabled={true}></Select>
            ) : (
                <Select
                    id="input-select"
                    name="input-select"
                    className="simple-select__field"
                    disabled={disabled}
                    value={decade}
                    onChange={(event) => {
                        setDecade(event.target.value);
                    }}
                >
                    {getOptions()}
                </Select>
            )}
        </div>
    );
};

export default DecadeSelect;
