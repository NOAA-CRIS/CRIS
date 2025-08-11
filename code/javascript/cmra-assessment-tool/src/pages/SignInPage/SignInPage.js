// Framework and third-party non-ui
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// App components

// JSON & Styles

// Hooks, context, and constants
import { useAccountsContext } from '../../context/AccountsContext';

// Third-party components (buttons, icons, etc.)

// Internationalization
import { useTranslation } from 'react-i18next';
import AppRoutes from '../../constants/AppRoutes';
import logo from '../../images/logo.png';
import { Button } from '@trussworks/react-uswds';

import './SignInPage.scss';

const SignInPage = ({ signingOut }) => {
    // ----- Language -----
    const { t } = useTranslation();

    // ----- Navigation -----
    const navigate = useNavigate();

    // ----- Context -----
    const { signIn, signOut, errorMessage, account } = useAccountsContext();

    // ----- Routing -----
    useEffect(() => {
        // Redirect if user is already logged in
        if (account && account?.session && !signingOut) {
            navigate(AppRoutes.home.path);
        }
    }, [account, navigate, signingOut]);

    return (
        <div className="signInPage-container">
            <div className="signInPage-dialog">
                <div className="signInPage-content">
                    <img src={logo} alt="App Logo" />
                    <h3>{`${signingOut ? errorMessage || t('SignInPage.Error') : t('SignInPage.Login')}`}</h3>
                    <Button className="usa-button--white font-serif-xs" onClick={signingOut ? signOut : signIn}>
                        {t(`SignInPage.${signingOut ? 'SignOut' : 'SignIn'}`)}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
