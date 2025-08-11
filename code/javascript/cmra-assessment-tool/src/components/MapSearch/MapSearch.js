// Framework and third-party non-ui
import React, { useEffect, useState } from 'react';

// Hooks, context, and constants
import { useAppContext } from '../../context/AppContext';
import { useSearch } from '../../hooks/useSearch';
import { useSketchViewModel } from '../../hooks/useSketchViewModel';

// App components
import SketchPointButton from '../../components/SketchPointButton/SketchPointButton';

// Component specific modules (Component-styled, etc.)
import './MapSearch.scss';

// Third-party components (buttons, icons, etc.)

const MapSearch = ({ location }) => {
    const [searchElementRef, search] = useSearch();
    const [sketchViewModel] = useSketchViewModel();
    const [clearHandler, setClearHandler] = useState();
    const [completeHandler, setCompleteHandler] = useState();

    const { updateAreaOfInterest, mapView, searchResult, setSearchResult } = useAppContext();

    useEffect(() => {
        if (search) {
            if (!clearHandler) {
                const searchClearHandle = search.on('search-clear', function () {
                    setSearchResult(null);
                });
                setClearHandler(searchClearHandle);
            }
            if (!completeHandler) {
                const searchCompleteHandle = search.on('search-complete', function (event) {
                    const searchTerm = event.searchTerm;
                    try {
                        const searchResult = event.results[0].results[0];
                        setSearchResult({
                            searchTerm,
                            result: searchResult,
                        });
                        updateAreaOfInterest({ geometry: searchResult.feature.geometry });
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
    }, [search, searchResult, updateAreaOfInterest, setSearchResult, clearHandler, completeHandler]);

    useEffect(() => {
        if (sketchViewModel) {
            sketchViewModel.on('create', function (event) {
                const searchTerm = event.searchTerm;
                try {
                    const searchResult = event.results[0].results[0];
                    setSearchResult({
                        searchTerm,
                        result: searchResult,
                    });
                } catch (err) {
                    console.warn('code issue in search widget');
                }
            });
        }
    }, [search, setSearchResult, sketchViewModel]);

    return (
        <div className="grid-row flex-row flex-align-center">
            <div className="mapSearch-search-widget-container" ref={searchElementRef} />
            {mapView && (
                <SketchPointButton
                    view={mapView}
                    onSketchComplete={(graphic) => {
                        if (graphic) {
                            updateAreaOfInterest({ geometry: graphic.geometry });
                        }
                    }}
                />
            )}
        </div>
    );
};

MapSearch.propTypes = {};
export default MapSearch;
