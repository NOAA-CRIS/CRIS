// Framework and third-party non-ui

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import DataDictionary from '../../constants/DataDictionary.json';

// App components

// Assets

// Component specific modules (Component-styled, etc.)
import './TabBar.scss';

// Third-party components (buttons, icons, etc.)
import { Tooltip, Icon } from '@trussworks/react-uswds';
import { useEffect, useState } from 'react';

export const TabBar = () => {
    const [t] = useTranslation();
    const [compareValid, setCompareValid] = useState(false);

    const {
        tabbedValues,
        tabbedRenderers,
        mapCompareEnabled,
        setMapCompareEnabled,
        setTabbedValues,
        selectedTab,
        setSelectedTab,
        vizType,
    } = useAppContext();

    useEffect(() => {
        let valid = tabbedRenderers?.length === 2;

        if (valid) {
            tabbedRenderers.forEach((item) => {
                if (!item) {
                    valid = false;
                } else if (!item.type) {
                    valid = false;
                }
            });
        }
        setCompareValid(valid);
    }, [tabbedRenderers]);
    const maxTabCount = 2;
    const tabStrings = t('Tabs.list', { returnObjects: true });

    return (
        <div className="main__tab-wrap">
            {tabbedValues.map((values, idx) => {
                return (
                    <button
                        key={`tab_${idx}`}
                        className={`main__tab main__tab--1 ${
                            !mapCompareEnabled && idx === selectedTab ? 'active' : ''
                        }`}
                        onClick={() => {
                            setSelectedTab(idx);
                            setMapCompareEnabled(false);
                        }}
                    >
                        <span>{tabStrings[idx].label}</span>
                        {!mapCompareEnabled && tabbedValues.length > 1 && (
                            <svg
                                role="button"
                                aria-label={t('Tabs.Close')}
                                className="main__tab--close-btn"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    const temp = [...tabbedValues];
                                    temp.splice(idx, 1);
                                    setTabbedValues(temp);
                                    setSelectedTab(0);
                                }}
                            >
                                <title>{t('Tabs.Close')}</title>
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        )}
                    </button>
                );
            })}

            {tabbedValues.length < maxTabCount && (
                <Tooltip
                    label={t('Tabs.Add')}
                    className="main__tab main__tab--add"
                    onClick={() => {
                        setTabbedValues([...tabbedValues, ...[tabbedValues[selectedTab]]]);
                        setSelectedTab(selectedTab + 1);
                    }}
                >
                    <Icon.Add size={2} />
                </Tooltip>
            )}
            {/* <button className="main__tab main__tab--add"> */}
            {compareValid && tabbedValues.length > 1 && vizType === DataDictionary.vizTypes.map && (
                <Tooltip
                    label="Toggle Comparison"
                    className={`main__tab main__tab--compare ${mapCompareEnabled ? 'active' : ''}`}
                    onClick={() => {
                        setMapCompareEnabled(true);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <path d="M12 9v1.746L14.296 8.5 12 6.254V8h-2V2h6v13h-6V9zm-4 7h1V1H8zm-7-1h6v-1H2V3h5V2H1zm4-8.45L2.95 8.5 5 10.45V9h2V8H5z" />
                    </svg>
                </Tooltip>
            )}
        </div>
    );
};

export default TabBar;
