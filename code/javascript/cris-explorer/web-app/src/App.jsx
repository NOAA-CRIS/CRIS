// Framework and third-party non-ui

// Hooks, context, and constants
import { useAppContext } from './contexts/AppContext';

// App components

// Component specific modules (Component-styled, etc.)
import ExplorePage from './pages/ExplorePage/ExplorePage';
// import Alert from './components/Alert/Alert';

// Third-party components (buttons, icons, etc.)
import '@trussworks/react-uswds/lib/uswds.css';
import '@trussworks/react-uswds/lib/index.css';
import { Alert, Icon, Button } from '@trussworks/react-uswds';
import './App.scss';

function App() {
    const { alertInfo, setAlertInfo } = useAppContext();

    return (
        <>
            <div className="app--container">
                <ExplorePage />

                {/* show alert(s) newest on bottom */}
                <div className="app__alerts--container">
                    {alertInfo && (
                        <Alert className="app__alerts--item" type={alertInfo.type} headingLevel="h4" slim>
                            {alertInfo.message}
                            <Button className="app__alerts--item-close" onClick={() => setAlertInfo(null)}>
                                <Icon.Close />
                            </Button>
                        </Alert>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
