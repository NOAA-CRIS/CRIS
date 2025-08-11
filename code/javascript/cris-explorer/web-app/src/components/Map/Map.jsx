// Framework and third-party non-ui
import Legend from '@arcgis/core/widgets/Legend.js';
import Home from '@arcgis/core/widgets/Home.js';

// Hooks
import { useWebMap } from '../../hooks/useWebMap';
import { useWatch } from '../../hooks/useWatch';
import { useTranslation } from 'react-i18next';

// Context
import { useAppContext } from '../../contexts/AppContext';

// App components

// Utilities

// JSON & Styles
import './Map.scss';

// Third-party components (buttons, icons, etc.)

const Map = ({ webmapId }) => {
    // Translation
    const [t] = useTranslation();
    // Get values from context
    const { dataUpdating, updateMapView, setAlertInfo } = useAppContext();

    const viewOptions = {
        view: null,
    };

    // Get values from context
    // Use hooks to establish webmap
    const [ref, view] = useWebMap(webmapId, viewOptions);

    const handleMapReady = async () => {
        try {
            // Initialize map view
            // Update context
            const legend = new Legend({ view });
            const home = new Home({ view });
            view.ui.add(home, 'bottom-left');
            view.ui.add(legend, 'bottom-right');

            setTimeout(() => {
                /**
                 * Add text to legend for
                 */
                const newDiv = document.createElement('div');
                newDiv.classList.add('esri-legend__service');
                const h3 = document.createElement('h3');
                // and give it some content
                const newContent = document.createTextNode(t('Legend.info'));
                h3.id = 'legendTextNode';
                // add the text node to the newly created div
                h3.appendChild(newContent);
                newDiv.appendChild(h3);
                const legendDiv = document.getElementsByClassName('esri-legend')[0];
                console.log(legendDiv);
                legendDiv.appendChild(newDiv);
            }, 3000);

            view.popup = {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                    position: 'top-left',
                },
                visibleElements: {
                    actionBar: false,
                    closeButton: false,
                },
            };
            updateMapView(view);
        } catch (err) {
            console.error(t('App.errors.map.initializing'), err);
            setAlertInfo({
                type: 'error',
                message: t('App.errors.map.initializing'),
            });
        }
    };

    // Watch for When view is ready, init map when ready
    useWatch(view, 'ready', handleMapReady);

    return <div ref={ref} className={`main__views-inner map--container ${dataUpdating ? 'hidden' : ''}`} />;
};

export default Map;
