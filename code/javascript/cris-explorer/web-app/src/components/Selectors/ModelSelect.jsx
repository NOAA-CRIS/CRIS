// Framework and third-party non-ui
import { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { models } from '../../constants/AppConfig.json';

// App components

// Component specific modules (Component-styled, etc.)
import { Label, Select } from '@trussworks/react-uswds';

import './SimpleSelect.scss';

// Third-party components (buttons, icons, etc.)

export const ModelSelect = ({ model, setModel, modelSet, invalid }) => {
    const [t] = useTranslation();
    // Get values from context
    const { setAlertInfo } = useAppContext();
    const [values, setValues] = useState([]);

    useEffect(() => {
        try {
            const modelValues = models[modelSet];

            if (!modelValues) {
                return;
            }
            if (!modelValues.includes(model)) {
                setModel(modelValues[0]);
            }
            setValues(modelValues);
        } catch (error) {
            console.error(t('App.errors.climatologyData.model'), error);
            setAlertInfo({
                type: 'error',
                message: t('App.errors.climatologyData.model'),
            });
        }
    }, [model, modelSet, setModel, t, setAlertInfo]);

    return (
        <div className="simple-select">
            <Label htmlFor="input-select">{t(`DataDictionary.labels.models`)}</Label>

            {invalid ? (
                <Select id="input-select" name="input-select" className="simple-select__field" disabled={true}></Select>
            ) : (
                <Select
                    id="input-select"
                    name="input-select"
                    className="simple-select__field"
                    disabled={!values}
                    value={model}
                    onChange={(event) => {
                        setModel(event.target.value);
                    }}
                >
                    {values.map((value, idx) => {
                        const text = t(`DataDictionary.models.${value}`, { defaultValue: 'EMPTY' });

                        return (
                            <option key={idx} value={value}>
                                {text}
                            </option>
                        );
                    })}
                </Select>
            )}
        </div>
    );
};

export default ModelSelect;
