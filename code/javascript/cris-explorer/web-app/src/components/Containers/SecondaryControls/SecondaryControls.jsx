// Framework and third-party non-ui

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../contexts/AppContext';
import DataDictionary from '../../../constants/DataDictionary.json';

// App components
import SimpleSelect from '../../Selectors/SimpleSelect';
import DecadeSelect from '../../Selectors/DecadeSelect';
import ModelSelect from '../../Selectors/ModelSelect';

// Component specific modules (Component-styled, etc.)
import './SecondaryControls.scss';

// Third-party components (buttons, icons, etc.)
import { Button, Alert } from '@trussworks/react-uswds';
import { useCallback, useEffect, useState } from 'react';

export const SecondaryControls = ({ showSecondaryControls }) => {
    const [t] = useTranslation();

    const {
        tabbedValues,
        setTabbedValues,
        selectedTab,
        vizType,
        setVizType,
        mapView,
        geoId,
        geoName,
        geoType,
        setAlertInfo,
    } = useAppContext();

    const [decadeLocal, setDecadeLocal] = useState();
    const [scenarioLocal, setScenarioLocal] = useState();
    const [statisticLocal, setStatisticLocal] = useState();
    const [modelSetLocal, setModelSetLocal] = useState();
    const [modelLocal, setModelLocal] = useState();
    const [decadeTypeLocal, setDecadeTypeLocal] = useState();
    const [gridLocal, setGridLocal] = useState();
    const [applyDisabled, setApplyDisabled] = useState(true);

    useEffect(() => {
        const { decade, decadeType, grid, scenario, modelSet, model, statistic } = tabbedValues[selectedTab];

        setDecadeLocal(decade);
        setDecadeTypeLocal(decadeType);
        setGridLocal(grid);
        setScenarioLocal(scenario);
        setModelSetLocal(modelSet);
        setModelLocal(model);
        setStatisticLocal(statistic);
    }, [tabbedValues, selectedTab]);

    useEffect(() => {
        const { decade, decadeType, grid, scenario, modelSet, model, statistic } = tabbedValues[selectedTab];

        setApplyDisabled(
            decade === decadeLocal &&
                decadeType === decadeTypeLocal &&
                grid === gridLocal &&
                scenario === scenarioLocal &&
                model === modelLocal &&
                modelSet === modelSetLocal &&
                statistic === statisticLocal
        );
    }, [
        decadeLocal,
        decadeTypeLocal,
        gridLocal,
        modelLocal,
        modelSetLocal,
        scenarioLocal,
        selectedTab,
        statisticLocal,
        tabbedValues,
    ]);

    const handleApplyClick = useCallback(() => {
        const values = tabbedValues.map((item, idx) => {
            if (selectedTab === idx) {
                return {
                    decade: decadeLocal,
                    decadeType: decadeTypeLocal,
                    grid: gridLocal,
                    scenario: scenarioLocal,
                    modelSet: modelSetLocal,
                    model: modelLocal,
                    statistic: statisticLocal,
                };
            }
            return item;
        });
        setTabbedValues(values);
        if (mapView.popup.visible) {
            mapView.popup.close();
        }
    }, [
        decadeLocal,
        decadeTypeLocal,
        gridLocal,
        modelLocal,
        modelSetLocal,
        scenarioLocal,
        selectedTab,
        setTabbedValues,
        statisticLocal,
        tabbedValues,
        mapView,
    ]);

    const handleCancelClick = useCallback(() => {
        const { decade, decadeType, grid, scenario, modelSet, model, statistic } = tabbedValues[selectedTab];
        setDecadeLocal(decade);
        setDecadeTypeLocal(decadeType);
        setGridLocal(grid);
        setScenarioLocal(scenario);
        setModelSetLocal(modelSet);
        setModelLocal(model);
        setStatisticLocal(statistic);
    }, [selectedTab, tabbedValues]);

    const handleVizToggleClick = useCallback(() => {
        if (vizType === DataDictionary.vizTypes.chart) {
            setVizType(DataDictionary.vizTypes.map);
        } else {
            if (geoId) {
                setVizType(DataDictionary.vizTypes.chart);
            } else {
                setAlertInfo({
                    type: 'warning',
                    message: t('Messages.invalidLocation', { geoType: t(`DataDictionary.geoTypes.${geoType}`) }),
                });
            }
        }
    }, [geoId, geoType, setAlertInfo, setVizType, t, vizType]);

    return (
        <div
            className={
                !showSecondaryControls
                    ? 'mapControls--container mapControls--container--hide'
                    : 'mapControls--container'
            }
        >
            <div className="mapControls--container-title">
                <h1>
                    {geoName ? (
                        <>
                            {geoType && (
                                <div className="mapControls--container-subtitle-wrap">
                                    <small className="mapControls--container-subtitle">
                                        {geoType === 'county' && 'County'}
                                        {geoType === 'tribal' && 'Tribal Area'}
                                        {geoType === 'huc' && 'HUC 8 Watershed'}
                                    </small>
                                </div>
                            )}
                            {geoName}
                        </>
                    ) : (
                        <div>
                            <Alert className="app__alerts--item app__alerts--select-geotype" type="info" slim noIcon>
                                <small style={{ fontWeight: '400' }}>{t('App.panelDefaultTitle')}</small>
                            </Alert>
                        </div>
                    )}
                </h1>
            </div>
            <div className="mapControls--container-selectors">
                <SimpleSelect
                    setter={setDecadeTypeLocal}
                    selectedValue={decadeTypeLocal}
                    dataDictionaryPath="decadeTypes"
                    invalid={vizType === DataDictionary.vizTypes.chart}
                />
                <SimpleSelect
                    setter={setModelSetLocal}
                    selectedValue={modelSetLocal}
                    dataDictionaryPath="modelSets"
                    invalid={
                        decadeTypeLocal === DataDictionary.decadeTypes.PAST_OBSERVED &&
                        vizType === DataDictionary.vizTypes.map
                    }
                />
                <ModelSelect
                    model={modelLocal}
                    setModel={setModelLocal}
                    modelSet={modelSetLocal}
                    dataDictionaryPath="models"
                    invalid={
                        decadeTypeLocal === DataDictionary.decadeTypes.PAST_OBSERVED &&
                        vizType === DataDictionary.vizTypes.map
                    }
                />
                <SimpleSelect
                    setter={setScenarioLocal}
                    selectedValue={scenarioLocal}
                    dataDictionaryPath="scenarios"
                    invalid={
                        decadeTypeLocal !== DataDictionary.decadeTypes.FUTURE ||
                        vizType === DataDictionary.vizTypes.chart
                    }
                />
                <SimpleSelect
                    setter={setGridLocal}
                    selectedValue={gridLocal}
                    dataDictionaryPath="grids"
                    invalid={
                        decadeTypeLocal !== DataDictionary.decadeTypes.PAST_OBSERVED ||
                        vizType === DataDictionary.vizTypes.chart
                    }
                />
                <DecadeSelect
                    decade={decadeLocal}
                    setDecade={setDecadeLocal}
                    decadeType={decadeTypeLocal}
                    invalid={vizType === DataDictionary.vizTypes.chart}
                />
                {/* <SimpleSelect
                    setter={setStatisticLocal}
                    selectedValue={statisticLocal}
                    dataDictionaryPath="statistics"
                    invalid={vizType === DataDictionary.vizTypes.chart}
                /> */}
            </div>
            <div className="mapControls--container-actions">
                <Button disabled={applyDisabled} onClick={handleApplyClick}>
                    {t('Buttons.apply')}
                </Button>
                <Button disabled={applyDisabled} className="mapControls--container-revert" onClick={handleCancelClick}>
                    {t('Buttons.cancel')}
                </Button>

                <Button unstyled onClick={handleVizToggleClick}>
                    {t(`Buttons.view${vizType === DataDictionary.vizTypes.chart ? 'Map' : 'Chart'}`)}
                </Button>
            </div>
        </div>
    );
};

export default SecondaryControls;
