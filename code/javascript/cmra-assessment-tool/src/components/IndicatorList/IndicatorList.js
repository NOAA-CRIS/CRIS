// Framework and third-party non-ui
import React, { useEffect, useMemo } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import ScreeningData from '../../constants/ScreeningData';

// App components
import IndicatorItem from './IndicatorItem';

// Component specific modules (Component-styled, etc.)
import './IndicatorList.scss';

// Third-party components (buttons, icons, etc.)
import { Dropdown, Tooltip } from '@trussworks/react-uswds';
import Skeleton from 'react-loading-skeleton';

const IndicatorList = () => {
    // ----- Language -----
    const { t } = useTranslation();

    const { indicators, timeframe, setTimeframe, selectedIndicator, setSelectedIndicator, selectedHazard } =
        useAppContext();

    const localIndicators = useMemo(() => {
        return (indicators ?? []).filter((indicator) => !indicator.hideFromTable);
    }, [indicators]);

    useEffect(() => {
        if (selectedIndicator && !localIndicators.find((item) => item.id === selectedIndicator.id)) {
            setSelectedIndicator(localIndicators[0]);
        }
    }, [localIndicators, selectedIndicator, setSelectedIndicator]);

    useEffect(() => {
        // update the timeframe if it was historic change to early
        if (timeframe && timeframe === ScreeningData.timeframe.historic) {
            setTimeframe(ScreeningData.timeframe.early);
        }
    }, [setTimeframe, timeframe]);

    const indicatorsLoaded = localIndicators && localIndicators.length > 0;

    const isInundation = selectedHazard === ScreeningData.hazardIds.coastalInundation;

    return (
        <div className="indicatorList-container grid-col flex-row">
            {!indicatorsLoaded && (
                <div className="indicatorList-skeleton-container">
                    <Skeleton className="indicatorList-item-container-skeleton-item" count={4} />
                </div>
            )}
            {indicatorsLoaded && (
                <div className="indicatorList-item-container grid-row flex-column flex-no-wrap">
                    <div className="indicatorList-header-container grid-row flex-row flex-align-center">
                        <h2 className="indicatorList-table-main-column grid-row flex-row indicatorList-title font-serif-2md">
                            {t('IndicatorList.Title')}
                            <Dropdown
                                className="dropdown--borderless indicatorList-dropdown text-primary-dark font-sans-1xs"
                                id="timeframe-dropdown"
                                name="timeframe-dropdown"
                                onChange={(event) => {
                                    if (event?.target?.value) {
                                        setTimeframe(event.target.value);
                                    }
                                }}
                                defaultValue={timeframe}
                            >
                                {Object.values(ScreeningData.timeframe)
                                    .filter((value) => value !== ScreeningData.timeframe.historic)
                                    .map((value, idx) => (
                                        <option value={value} key={idx}>
                                            {t(`Data.Time.${value}.Label`) + ' (' + t(`Data.Time.${value}.Years`) + ')'}
                                        </option>
                                    ))}
                            </Dropdown>
                        </h2>
                        <div className="indicatorList-table-data-column indicatorList-header indicatorList-header--orange font-sans-2xs">
                            <Tooltip label={t('Data.Models.RCP45.Tooltip')} position="bottom">
                                <span className="font-sans-2xs">{t(`Data.Models.RCP45.ShortLabel`)}</span>
                            </Tooltip>
                        </div>
                        <div className="indicatorList-table-data-column indicatorList-header indicatorList-header--red font-sans-2xs">
                            <Tooltip label={t('Data.Models.RCP85.Tooltip')} position="bottom" disabled={isInundation}>
                                <span className="font-sans-2xs">{t(`Data.Models.RCP85.ShortLabel`)}</span>
                            </Tooltip>
                        </div>
                    </div>
                    {localIndicators.map((indicator, idx) => (
                        <IndicatorItem key={idx} indicator={indicator} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IndicatorList;
