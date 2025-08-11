// Framework and third-party non-ui
import React from 'react';

// Hooks
import { useWebMap } from '../../hooks/useWebMap';

// Context
import { useWatch } from '../../hooks/useWatch';

// App components

// Utilities

// JSON & Styles
import { StyledMap } from './Map-styled';
import { useAppContext } from '../../context/AppContext';

// Third-party components (buttons, icons, etc.)

const Map = ({ webmapId }) => {
    // Get values from context
    const { mapView, updateMapView } = useAppContext();

    const viewOptions = {
        view: null,
    };

    // Get values from context
    // Use hooks to establish webmap
    const [ref, view, webmap] = useWebMap(webmapId, viewOptions);

    const handleMapReady = async () => {
        try {
            // Initialize map view
            // Update context
            updateMapView(view, webmap);
        } catch (err) {
            console.error(err);
        }
    };

    // Watch for When view is ready, init map when ready
    useWatch(view, 'ready', handleMapReady);

    return <StyledMap ref={ref} isLoaded={mapView} />;
};

export default Map;
