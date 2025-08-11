/**
 * Custom hook to toggle between chart and map viz types
 * @param {string} vizType - The current vizType state
 * @param {function} setVizType - The vizType state setter
 * @returns {function} - The toggle function
 */
import { useCallback } from 'react';
import DataDictionary from '../constants/DataDictionary';

export const useVizTypeToggle = (vizType, setVizType) => {
    return useCallback(() => {
        setVizType(
            vizType === DataDictionary.vizTypes.chart ? DataDictionary.vizTypes.map : DataDictionary.vizTypes.chart
        );
    }, [setVizType, vizType]);
};
