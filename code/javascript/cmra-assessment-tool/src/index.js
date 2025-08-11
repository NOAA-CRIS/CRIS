import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import '@trussworks/react-uswds/lib/uswds.css';
import '@trussworks/react-uswds/lib/index.css';
import 'react-loading-skeleton/dist/skeleton.css';

import './index.scss';

import esriConfig from '@arcgis/core/config';
import AppConfig from './constants/AppConfig';
import App from './App';
import FallbackLoadingPage from './pages/FallbackLoadingPage/FallbackLoadingPage';

//Helpers

// Internationalization
import './utilities/i18n';
import { AppContextProvider } from './context/AppContext';
import { BrowserRouter } from 'react-router-dom';

async function init() {
    // ----- Config -----
    const config = AppConfig;
    esriConfig.apiKey = config.apiKey;

    ReactDOM.render(
        <React.StrictMode>
            <Suspense fallback={<FallbackLoadingPage />}>
                <BrowserRouter basename={process.env.PUBLIC_URL}>
                    <AppContextProvider config={config}>
                        <App />
                    </AppContextProvider>
                </BrowserRouter>
            </Suspense>
        </React.StrictMode>,
        document.getElementById('root')
    );
}

init();
