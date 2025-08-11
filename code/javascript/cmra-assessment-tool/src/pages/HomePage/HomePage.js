import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useSearch } from '../../hooks/useSearch';

import { Button, IconLocationOn } from '@trussworks/react-uswds';
import logo from '../../images/logo.png';
import './HomePage.scss';
import AppRoutes from '../../constants/AppRoutes';
import { useAppContext } from '../../context/AppContext';

const HomePage = () => {
    const [searchElementRef, search] = useSearch(null, { locationEnabled: false });
    const { updateAreaOfInterest, setSearchResult } = useAppContext();
    const [t] = useTranslation();
    const navigate = useNavigate();

    const [completeHandler, setCompleteHandler] = useState();

    useEffect(() => {
        if (search) {
            if (!completeHandler) {
                const searchCompleteHandle = search.on('search-complete', function (event) {
                    const searchTerm = event.searchTerm;
                    try {
                        const searchResult = event.results[0].results[0];
                        setSearchResult({
                            searchTerm,
                            result: searchResult,
                        });
                        updateAreaOfInterest({ geometry: searchResult.feature.geometry, center: true, zoom: true });
                        navigate(AppRoutes.search.path);
                    } catch (err) {
                        console.warn('code issue in search widget');
                    }
                });
                setCompleteHandler(searchCompleteHandle);
            }
        }
        return () => {
            if (completeHandler) {
                completeHandler.remove();
                setCompleteHandler(null);
            }
        };
    }, [navigate, search, updateAreaOfInterest, setSearchResult, completeHandler]);

    return (
        <div className="bg-primary-dark homePage-container grid-row flex-column flex-align-center flex-justify-center">
            <div className="homePage-header-container grid-row flex-row flex-align-center">
                <img className="homePage-logo" src={logo} alt={''} />
                <h1 className="homePage-title font-heading-2xl text-white">{t('App.Title')}</h1>
            </div>
            <div className="homePage-location-input-container grid-row flex-row flex-align-center flex-justify-start">
                <div>
                    <div className="homePage-search-widget" ref={searchElementRef} />
                </div>
                <div className="homePage-search-spacer text-white font-serif-md">Or</div>
                <Button
                    className="homePage-search-button grid-row flex-row flex-align-center flex-justify-center usa-button--white font-serif-xs"
                    onClick={() => {
                        navigate(AppRoutes.search.path);
                    }}
                >
                    <IconLocationOn size="3" />
                    {t('Home.SearchMap')}
                </Button>
            </div>
            <p className="homePage-check-exposure-text text-white font-sans-sm">{t('Home.Details')}</p>
            <a
                className="homePage-check-exposure-text-link text-white font-sans-md"
                href="https://toolkit.climate.gov/steps-to-resilience/steps-resilience-overview"
                target={'_blank'}
                rel="noreferrer"
            >
                {t('Home.DetailsLinkText')}
            </a>
        </div>
    );
};

export default HomePage;
