// Framework and third-party non-ui

// Hooks, context, and constants
import { useAccountsContext } from './contexts/AccountsContext';

// App components
import SignInPage from './pages/SignInPage';

// Component specific modules (Component-styled, etc.)

// Third-party components (buttons, icons, etc.)
import './App.scss';
import App from './App';

function AppSecured() {
    // ----- Context -----
    const { account, userAccessVerified, getAccountSessionStatus } = useAccountsContext();

    // ----- Authenticate -----
    const authenticated = account?.token && getAccountSessionStatus(account);

    // ----- Render -----
    if (authenticated && userAccessVerified) {
        // do nothing
    } else if (!userAccessVerified) {
        return <SignInPage />;
    }

    return <App />;
}

export default AppSecured;
