// Framework and third-party non-ui
import React from 'react';
import classNames from 'classnames';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';

// App components

// Component specific modules (Component-styled, etc.)
import './HazardItem.scss';

const HazardItem = ({ hazardId }) => {
    // ----- Language -----
    const { t } = useTranslation();

    const { selectedHazard, updateSelectedHazard } = useAppContext();

    const containerClassName = classNames([
        'hazardItem-container',
        'grid-row',
        'flex-row',
        'flex-align-center',
        'flex-justify',
        { selected: hazardId === selectedHazard },
    ]);

    return (
        <li
            className={containerClassName}
            onClick={() => {
                updateSelectedHazard(hazardId);
            }}
        >
            <h5 className="hazardItem-title font-sans-md ">{t(`Hazards.${hazardId}.Title`)}</h5>
        </li>
    );
};

export default HazardItem;
