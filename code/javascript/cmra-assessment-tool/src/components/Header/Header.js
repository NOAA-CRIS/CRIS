// Framework and third-party non-ui
import React from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import AppRoutes from '../../constants/AppRoutes';
import { useNavigate } from 'react-router-dom';

// App components
import logo from '../../images/logo.png';

// Component specific modules (Component-styled, etc.)
import './Header.scss';

// Third-party components (buttons, icons, etc.)
import { Button, Tooltip } from '@trussworks/react-uswds';
import ScreeningData from '../../constants/ScreeningData';

const Header = () => {
    const [t] = useTranslation();
    const {
        appRoute,
        selectedIndicator,
        standardGeography,
        config: { urls },
        updateAreaOfInterest,
    } = useAppContext();
    const navigate = useNavigate();

    const { REACT_APP_VERSION } = process.env;

    const handleTitleClick = () => {
        updateAreaOfInterest(null);
        navigate(AppRoutes.search.path);
    };

    const handleReportClick = () => {
        const geoId = standardGeography.toLowerCase();
        const indicator = selectedIndicator[ScreeningData.standardGeographies.geoIdField];

        const url = `${urls.report}/${geoId}/${indicator}.html`;
        window.open(url, '_blank');
    };

    const reportButton =
        standardGeography === ScreeningData.standardGeographies.tract ? (
            <div>
                <Tooltip
                    label={t('Header.ButtonDisabled')}
                    position="bottom"
                    wrapperclasses="header-report-button-tooltip"
                ></Tooltip>
                <Button
                    className="header-report-button usa-button usa-button--outline usa-button--inverse"
                    disabled={true}
                >
                    {t('Header.Button')}
                </Button>
            </div>
        ) : (
            <Button
                className="header-report-button usa-button usa-button--outline usa-button--inverse"
                onClick={handleReportClick}
            >
                {t('Header.Button')}
            </Button>
        );

    return (
        <header className="header-container grid-row flex-row flex-align-center flex-justify-start">
            <img className="header-logo" src={logo} alt={'CMRA Logo'} />
            <div className="grid-row flex-row  flex-justify-start">
                <h1 className="header-title font-serif-lg text-white cursor-pointer" onClick={handleTitleClick}>
                    {t('App.Title')}
                </h1>
                <div className="header-container-version text-white font-sans-2xs grid-row flex-row  flex-justify-start">
                    {`v${REACT_APP_VERSION}`}
                </div>
            </div>
            <div className="header-button-container">
                <a
                    href={urls.dataSources}
                    className="header-link text-white text-underline font-sans-2xs"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t('App.DataSources')}
                </a>
                <a
                    href={urls.portal}
                    className="header-link text-white text-underline font-sans-2xs"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t('App.LinkToPortal')}
                </a>

                <a
                    href={urls.userGuide}
                    className="header-link text-white text-underline font-sans-2xs"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t('App.UserGuide')}
                </a>

                {appRoute.id !== AppRoutes.search.id &&
                    selectedIndicator &&
                    selectedIndicator[ScreeningData.standardGeographies.geoIdField] &&
                    reportButton}
            </div>
            {/* <div className="header-button-container">
                <SignOut />
            </div> */}
        </header>
    );
};

Header.propTypes = {};
export default Header;
