// Framework and third-party non-ui
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';

// App components

// Component specific modules (Component-styled, etc.)
import './ModelSelect.scss';

// Third-party components (buttons, icons, etc.)
import { Radio } from '@trussworks/react-uswds';

const ModelSelect = ({ column }) => {
    // ----- Language -----
    const { t } = useTranslation();

    const { selectedModel, setSelectedModel, timeframe, selectedIndicator, selectedHazard } = useAppContext();

    const isInundation = selectedHazard === ScreeningData.hazardIds.coastalInundation;

    // Data is not available in alaska
    const isModelDisabled = useCallback(
        (model) => selectedIndicator?.StateAbbr === 'AK' && model === ScreeningData.models.rcp45,
        [selectedIndicator]
    );

    useEffect(() => {
        if (isModelDisabled(selectedModel)) {
            setSelectedModel(ScreeningData.models.rcp85);
        }
    }, [isModelDisabled, selectedIndicator, selectedModel, setSelectedModel]);

    const radioContainerClassName = classNames({
        'modelSelect-container-radio-column font-sans-2xs': column,
        'modelSelect-container-radio-row font-sans-2xs': !column,
    });

    return (
        <div className="modelSelect-container grid-row flex-column">
            <h2 className="font-serif-2md" htmlFor="model-radios">
                {t('Inputs.Models.ShortLabel')}
            </h2>
            <div className={radioContainerClassName}>
                {Object.values(ScreeningData.models).map((model) => (
                    <Radio
                        id={`${model}-radio`}
                        key={`${model}-radio`}
                        name="model-radios"
                        value={model}
                        label={t(`Data.Models.${model}.ShortLabel`)}
                        onChange={(event) => {
                            setSelectedModel(event.target.value);
                        }}
                        checked={(timeframe !== ScreeningData.timeframe.historic && model) === selectedModel}
                        disabled={timeframe === ScreeningData.timeframe.historic || isModelDisabled(model)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ModelSelect;
