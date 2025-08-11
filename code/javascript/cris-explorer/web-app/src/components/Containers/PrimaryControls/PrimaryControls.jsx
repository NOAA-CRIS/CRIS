// Framework and third-party non-ui

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../contexts/AppContext';
import DataDictionary from '../../../constants/DataDictionary.json';
// App components
import SimpleSelect from '../../Selectors/SimpleSelect';
import IndicatorSelect from '../../Selectors/IndicatorSelect';

// Component specific modules (Component-styled, etc.)
import './PrimaryControls.scss';
import MapSearch from '../../MapSearch';

// Third-party components (buttons, icons, etc.)

export const PrimaryControls = () => {
    const [t] = useTranslation();
    const { geoType, setGeoType, indicator, setIndicator, mapCompareEnabled, vizType } = useAppContext();

    return (
        <>
            <IndicatorSelect
                setter={setIndicator}
                selectedValue={indicator}
                dataDictionaryPath="indicators"
                disabled={mapCompareEnabled}
            />
            <SimpleSelect
                setter={setGeoType}
                selectedValue={geoType}
                dataDictionaryPath="geoTypes"
                disabled={mapCompareEnabled || vizType === DataDictionary.vizTypes.chart}
            />

            <MapSearch disabled={mapCompareEnabled || vizType === DataDictionary.vizTypes.chart} />
        </>
    );
};

export default PrimaryControls;
