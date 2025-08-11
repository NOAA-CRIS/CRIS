// Framework and third-party non-ui
import React from 'react';
import ReactDOM from 'react-dom/client';

// Hooks, context, and constants
import { AppContextProvider } from './contexts/AppContext';
import { AccountsContextProvider } from './contexts/AccountsContext';
import { auth } from './constants/AppConfig.json';
import './utilities/i18n';

// App components
import AppSecured from './AppSecured.jsx';

// Component specific modules (Component-styled, etc.)
import './main.scss';

// Third-party components (buttons, icons, etc.)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AccountsContextProvider auth={auth}>
            <AppContextProvider>
                <AppSecured />
            </AppContextProvider>
        </AccountsContextProvider>
    </React.StrictMode>
);
