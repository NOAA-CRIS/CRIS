// Framework and third-party non-ui
import { Button, ButtonGroup } from '@trussworks/react-uswds';
import React from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import ScreeningData from '../../constants/ScreeningData';
import { useAppContext } from '../../context/AppContext';

// App components

// Component specific modules (Component-styled, etc.)
import './StandardGeographySelect.scss';

// Third-party components (buttons, icons, etc.)

const StandardGeographySelect = () => {
    const [t] = useTranslation();
    const { standardGeography, updateStandardGeography } = useAppContext();

    return (
        <div className="standardGeographySelect-container">
            <div className="standardGeographySelect-info-container font-sans-2xs">
                {t('StandardGeographySelect.Info')}
            </div>
            <ButtonGroup className="standardGeographySelect-button-group" type="segmented">
                <Button
                    outline={standardGeography !== ScreeningData.standardGeographies.tract}
                    onClick={() => {
                        updateStandardGeography(ScreeningData.standardGeographies.tract);
                    }}
                >
                    {t('Data.StandardGeographies.TRACT')}
                </Button>
                <Button
                    outline={standardGeography !== ScreeningData.standardGeographies.county}
                    onClick={() => {
                        updateStandardGeography(ScreeningData.standardGeographies.county);
                    }}
                >
                    {t('Data.StandardGeographies.COUNTY')}
                </Button>

                <Button
                    outline={standardGeography !== ScreeningData.standardGeographies.aiannha}
                    onClick={() => {
                        updateStandardGeography(ScreeningData.standardGeographies.aiannha);
                    }}
                >
                    {t('Data.StandardGeographies.aiannha')}
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default StandardGeographySelect;
