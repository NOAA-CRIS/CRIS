// Framework and third-party non-ui

// App components

// JSON & Styles
import splashImage from '../../assets/splash.jpg';
import logo from '../../assets/logo.svg';

// Hooks, context, and constants
import { useAccountsContext } from '../../contexts/AccountsContext';

// Third-party components (buttons, icons, etc.)
import { Button } from '@trussworks/react-uswds';

// Internationalization
import { useTranslation } from 'react-i18next';

import './SignInPage.scss';

const SignInPage = ({ signingOut }) => {
    // ----- Language -----
    const { t } = useTranslation();

    // ----- Context -----
    const { signIn, signOut, errorMessage } = useAccountsContext();

    return (
        <div
            className="signin-container"
            style={{ background: `url(${splashImage}) center/cover no-repeat; position: absolute; top: 0; left: 0` }}
        >
            <div className="signin-login-container">
                <div className="signin-login-content">
                    <img className="signin-logo" src={logo} />
                    <h2>{`${signingOut ? errorMessage || t('SignIn.Error') : t('SignIn.Login')}`}</h2>
                    <Button width="full" onClick={signingOut ? signOut : signIn}>
                        {t(`SignIn.${signingOut ? 'SignOut' : 'SignIn'}`)}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
