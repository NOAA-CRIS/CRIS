// Framework and third-party non-ui
import DataDictionary from '../../constants/DataDictionary.json';

// Hooks, context, and constants
import { useAppContext } from '../../contexts/AppContext';

// App components
import ChartPanel from '../../components/ChartPanel/ChartPanel';
import Header from '../../components/Header';
import PrimaryControls from '../../components/Containers/PrimaryControls';
import MapPanel from '../../components/MapPanel';
import DownloadButton from '../../components/Download/DownloadButton';

// Component specific modules (Component-styled, etc.)
import './ExplorePage.scss';

// Third-party components (buttons, icons, etc.)
import TabBar from '../../components/TabBar';
import { Icon } from '@trussworks/react-uswds';

export const ExplorePage = () => {
    const { mapCompareEnabled, vizType, dataUpdating } = useAppContext();
    return (
        <div className="explore--container">
            <Header />
            <main className="main">
                <div className="main__form">
                    <div className="main__form-fields">
                        <PrimaryControls />
                    </div>
                </div>
                <div className="main__views">
                    <TabBar />

                    {!mapCompareEnabled && <DownloadButton id="download-map-button" />}
                    <MapPanel hidden={vizType !== DataDictionary.vizTypes.map} />
                    <ChartPanel hidden={vizType !== DataDictionary.vizTypes.chart} />

                    {dataUpdating && vizType === DataDictionary.vizTypes.map && (
                        <div className="loading-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="96"
                                height="96"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExplorePage;
