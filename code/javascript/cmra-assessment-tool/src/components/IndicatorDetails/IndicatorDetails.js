// Framework and third-party non-ui
import React, { useState } from 'react';
import classNames from 'classnames';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

// App components
import IndicatorChart from '../IndicatorChart/IndicatorChart';

// Component specific modules (Component-styled, etc.)
import './IndicatorDetails.scss';

// Third-party components (buttons, icons, etc.)
import Skeleton from 'react-loading-skeleton';
import IndicatorTable from '../IndicatorTable';

const IndicatorDetails = () => {
    // ----- Language -----
    const { t } = useTranslation();
    const { selectedIndicator, standardGeography } = useAppContext();

    const [mode, setMode] = useState('Chart');

    const chartClassNames = classNames(['indicatorDetails-button-container'], {
        'indicatorDetails-button-container-selected': mode === 'Chart',
    });

    const tableClassNames = classNames(['indicatorDetails-button-container'], {
        'indicatorDetails-button-container-selected': mode === 'Details',
    });

    return (
        <div className="indicatorDetails-container">
            <div className="indicatorDetails-header grid-row flex-row flex-justify">
                <h2 className="indicatorDetails-title font-serif-2md">{t('IndicatorDetails.Title')}</h2>
                <div className="grid-row flex-row">
                    <div
                        className={chartClassNames}
                        onClick={() => {
                            setMode('Chart');
                        }}
                    >
                        <h4 className="font-serif-xs">{t('IndicatorDetails.Tab1')}</h4>
                    </div>
                    <div
                        className={tableClassNames}
                        onClick={() => {
                            setMode('Details');
                        }}
                    >
                        <h4 className="font-serif-xs">{t('IndicatorDetails.Tab2')}</h4>
                    </div>
                </div>
            </div>
            <div className="indicatorDetails-content">
                {selectedIndicator ? (
                    <h5 className="font-serif-sm text-base-darker indicatorDetails-indicator-title">
                        {t(`Indicators.${selectedIndicator.id}.Title`, {
                            standardGeography: t(`Data.StandardGeographies.${standardGeography}`).toLowerCase(),
                        })}
                    </h5>
                ) : (
                    <div className="indicatorDetails-skeleton-container">
                        <Skeleton className="indicatorDetails-item-container-skeleton-item" count={4} />{' '}
                    </div>
                )}

                {selectedIndicator && mode === 'Details' && <IndicatorTable />}
                {selectedIndicator && mode === 'Chart' && <IndicatorChart />}
            </div>
        </div>
    );
};

export default IndicatorDetails;
