import numeral from 'numeral';

/**
 * Convert an indicator value to a string using the given format.
 * @param {{format: string}} indicator
 * @param {number | string | null | undefined} val
 * @returns
 */
export function indicatorToString(indicator, val) {
    return val === null || val === undefined ? 'N/A' : numeral(val).format(indicator.format);
}

export function indicatorKeyToString(indicator, key) {
    const val = indicator[key];
    return indicatorToString(indicator, val);
}
