// Framework and third-party non-ui
import React from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

// utilites

// App components

// Component specific modules (Component-styled, etc.)
import './MobilePage.scss';

// Third-party components (buttons, icons, etc.)
import { Button } from '@trussworks/react-uswds';

// Images
import logo from '../../images/logo.png';

const MobilePage = () => {
    const [t] = useTranslation();
    const {
        config: { urls },
    } = useAppContext();

    return (
        <div className="bg-primary-dark mobilePage-container">
            <div className="mobilePage-header-container grid-row flex-row flex-align-center">
                <img className="mobilePage-logo" src={logo} alt={''} />
                <h1 className="mobilePage-title text-white header-title font-serif-lg">{t('App.Title')}</h1>
            </div>
            <div className="mobilePage-content-container grid-row flex-column">
                <h1 className="mobilePage-content-title">{t('Alert.DeviceSupport.Title')}</h1>
                <p className="mobilePage-check-exposure-text font-sans-lg">{t('Alert.DeviceSupport.P1')}</p>
                <p className="mobilePage-check-exposure-text font-sans-lg">{t('Alert.DeviceSupport.P2')}</p>
                <div className="mobilePage-buttons-container grid-row">
                    <Button
                        onClick={() => {
                            window.open(urls.portal, '_blank');
                        }}
                    >
                        {t('Alert.DeviceSupport.Button1')}
                    </Button>
                    <Button
                        outline
                        onClick={() => {
                            window.open(urls.userGuide, '_blank');
                        }}
                    >
                        {t('Alert.DeviceSupport.Button2')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MobilePage;
