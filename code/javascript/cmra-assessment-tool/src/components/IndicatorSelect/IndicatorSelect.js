// Framework and third-party non-ui
import React, { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

// App components

// Component specific modules (Component-styled, etc.)
import './IndicatorSelect.scss';

// Third-party components (buttons, icons, etc.)
import { Dropdown } from '@trussworks/react-uswds';

const IndicatorSelect = ({ allowSpecialCase }) => {
    // ----- Language -----
    const { t } = useTranslation();

    const { indicators, selectedIndicator, setSelectedIndicator, standardGeography } = useAppContext();
    const [localIndicators, setLocalIndicators] = useState([]);

    useEffect(() => {
        // filter indicators to based on "specialCase" prop
        if (indicators) {
            let items = indicators.filter((indicator) => (allowSpecialCase ? true : !indicator.specialCase));
            if (selectedIndicator) {
                const hasSelected = items.some((item) => item.id === selectedIndicator.id);
                if (!hasSelected) {
                    setSelectedIndicator(items[0]);
                }
            }
            setLocalIndicators(items);
        }
    }, [allowSpecialCase, indicators, selectedIndicator, setSelectedIndicator]);

    return (
        <div className="indicatorSelect-container grid-row flex-column">
            <h2 className="font-serif-2md" htmlFor="indicator-dropdown">
                {t('Inputs.Indicators.ShortLabel')}
            </h2>
            {localIndicators && (
                <Dropdown
                    id="indicator-dropdown"
                    name="indicator-dropdown"
                    value={selectedIndicator?.id}
                    onChange={(event) => {
                        if (event?.target?.value) {
                            const indicator = localIndicators.find((item) => item.id === event.target.value);
                            if (indicator) {
                                setSelectedIndicator(indicator);
                            }
                        }
                    }}
                >
                    {localIndicators.map((indicator, idx) => {
                        return (
                            <option value={indicator.id} key={idx}>
                                {t(`Indicators.${indicator.id}.Title`, {
                                    standardGeography: t(`Data.StandardGeographies.${standardGeography}`).toLowerCase(),
                                })}
                            </option>
                        );
                    })}
                </Dropdown>
            )}
        </div>
    );
};

export default IndicatorSelect;
