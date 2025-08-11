// Framework and third-party non-ui
import get from 'lodash.get';
// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import DataDictionary from '../../constants/DataDictionary.json';

// App components

// Component specific modules (Component-styled, etc.)
import { Label, Select } from '@trussworks/react-uswds';

import './SimpleSelect.scss';

// Third-party components (buttons, icons, etc.)

export const SimpleSelect = ({ dataDictionaryPath, selectedValue, setter, disabled, invalid }) => {
    const [t] = useTranslation();

    const data = get(DataDictionary, dataDictionaryPath, undefined);

    if (data === undefined) {
        return 'ERROR';
    }

    /**
     * Create an array of climate variables from the data dictionary
     * @param {Object} data - The data dictionary object
     * @returns {Array} An array of objects with the following properties: value, text, title, order (optional)
     */
    const climateVariables = Object.values(data)
        .map((value) => {
            const text = t(`DataDictionary.${dataDictionaryPath}.${value}`, { defaultValue: 'Empty' });
            const title = t(`DataDictionary.${dataDictionaryPath}.${value}.Title`, {
                defaultValue: 'Empty',
            });
            const order = t(`DataDictionary.${dataDictionaryPath}.${value}.Order`, {
                defaultValue: 0,
            });
            return {
                value,
                text,
                title,
                order,
            };
        })
        // TODO: Remove this filter once the data dictionary is cleaned up?
        .filter(option => option.text !== 'Empty' && option.title !== 'Empty' && option.order !== 0) // Filter out default values
        .sort((a, b) => a.order - b.order); // Sort by order

    return (
        <div className="simple-select">
            <Label htmlFor="input-select">{t(`DataDictionary.labels.${dataDictionaryPath}`)}</Label>
            {invalid ? (
                <Select id="input-select" name="input-select" className="simple-select__field" disabled={true}></Select>
            ) : (
                <Select
                    id="input-select"
                    name="input-select"
                    className="simple-select__field"
                    disabled={disabled}
                    value={selectedValue}
                    onChange={(event) => {
                        setter(event.target.value);
                    }}
                >
                    {climateVariables.length > 0 ? (
                        climateVariables.map((option, idx) => (
                            <option key={idx} value={option.value}>
                                {option.title !== 'Empty' ? option.title : option.text}
                            </option>
                        ))
                    ) : (
                        Object.values(data).map((value, idx) => {
                            const text = t(`DataDictionary.${dataDictionaryPath}.${value}`, { defaultValue: 'EMPTY' });
                            const title = t(`DataDictionary.${dataDictionaryPath}.${value}.Title`, {
                                defaultValue: 'EMPTY',
                            });
                            return (
                                <option key={idx} value={value}>
                                    {title !== 'EMPTY' ? title : text}
                                </option>
                            );
                        })
                    )}
                </Select>
            )}
        </div>
    );
};

export default SimpleSelect;