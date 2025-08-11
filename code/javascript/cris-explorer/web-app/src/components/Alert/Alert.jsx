// Framework and third-party non-ui

// Hooks, context, and constants
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import ChartConfig from '../../constants/ChartConfig.json';

// Utilities

// App components

// Component specific modules (Component-styled, etc.)
import './Alert.scss';

// Third-party components (buttons, icons, etc.)
import { Alert } from '@trussworks/react-uswds';

export const Alert = () => {
    const [t] = useTranslation();

    return (
        <div className="alert--container">
            <Alert type="success" headingLevel="h4" slim noIcon>
                Test Alert
            </Alert>
        </div>
    );
};

export default Alert;
