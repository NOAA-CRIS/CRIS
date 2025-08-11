// Framework and third-party non-ui
import { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useAppContext } from '../../contexts/AppContext';
import { useSearch } from '../../hooks/useSearch';
import MapSymbols from '../../constants/MapSymbols.json';
// App components
// Component specific modules (Component-styled, etc.)
import './MapSearch.scss';

// Third-party components (buttons, icons, etc.)
import { Label } from '@trussworks/react-uswds';

const MapSearch = ({ disabled }) => {
    const [searchElementRef, search] = useSearch(null, { popupEnabled: false });
    const [clearHandler, setClearHandler] = useState();
    const [completeHandler, setCompleteHandler] = useState();

    const { searchResult, updateSearchResult, mapView } = useAppContext();

    useEffect(() => {
        if (mapView && search && !search.view) {
            search.view = mapView;
        }
    }, [search, mapView]);

    useEffect(() => {
        if (search) {
            search.disabled = disabled;
        }
    }, [search, disabled]);

    useEffect(() => {
        if (search) {
            if (!searchResult) {
                search.clear();
            }
        }
    }, [search, searchResult]);

    useEffect(() => {
        if (search) {
            if (!clearHandler) {
                const searchClearHandle = search.on('search-clear', function () {
                    if (searchResult !== 'CLEAR') {
                        updateSearchResult(null);
                    }
                });
                setClearHandler(searchClearHandle);
            }
            if (!completeHandler) {
                const searchCompleteHandle = search.on('search-complete', function (event) {
                    if (!search.activeSource.resultSymbol) {
                        search.activeSource.resultSymbol = MapSymbols.searchPoint;
                    }

                    const searchTerm = event.searchTerm;
                    try {
                        const searchResult = event.results[0].results[0];
                        console.log(searchResult);
                        updateSearchResult({
                            searchTerm,
                            result: searchResult,
                        });
                    } catch (err) {
                        console.warn('code issue in search widget');
                    }
                });
                setCompleteHandler(searchCompleteHandle);
            }
            if (searchResult) {
                search.searchTerm = searchResult.searchTerm;
            }
        }
        return () => {
            if (clearHandler) {
                clearHandler.remove();
                setClearHandler(null);
            }
            if (completeHandler) {
                completeHandler.remove();
                setCompleteHandler(null);
            }
        };
    }, [clearHandler, completeHandler, search, searchResult, updateSearchResult]);

    return (
        <div className={`mapSearch mapSearch--container ${disabled ? 'mapSearch--disabled-container' : ''}`}>
            <Label htmlFor="mapSearch" disabled={disabled}>
                Location
            </Label>
            <div
                id="mapSearch"
                className={`mapSearch--search-widget-container ${disabled ? 'mapSearch--disabled-input' : ''}`}
                ref={searchElementRef}
            />
        </div>
    );
};

MapSearch.propTypes = {};
export default MapSearch;
