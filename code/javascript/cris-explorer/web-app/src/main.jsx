// Framework and third-party non-ui
import React from 'react';
import ReactDOM from 'react-dom/client';

// Hooks, context, and constants
import { AppContextProvider } from './contexts/AppContext.jsx';
import './utilities/i18n';

// App components
import App from './App.jsx';

// Component specific modules (Component-styled, etc.)
import './main.scss';

// Third-party components (buttons, icons, etc.)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </React.StrictMode>
);
