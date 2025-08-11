// Framework and third-party non-ui
import React from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import ScreeningData from '../../constants/ScreeningData';

// App components
import HazardItem from './HazardItem';
// Component specific modules (Component-styled, etc.)
import './HazardList.scss';

const HazardList = () => {
    const { t } = useTranslation();

    return (
        <div className="hazardList-container grid-row flex-column">
            <div className="hazardList-header-container grid-row flex-row flex-align-center">
                <h2 className="hazardList-title font-serif-2md">{t('HazardList.Title')}</h2>
            </div>
            <ul className="hazardList-item-container grid-row flex-column flex-align-start">
                {ScreeningData.hazards.map((hazard, index) => (
                    <HazardItem key={index} hazardId={hazard.id} />
                ))}
            </ul>
            <div className="hazardList-bottom-placeholder"></div>
        </div>
    );
};

export default HazardList;
