// Framework and third-party non-ui
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import esriConfig from '@arcgis/core/config';
import IdentityManager from '@arcgis/core/identity/IdentityManager';

import { useAccountManager } from 'calcite-react/ArcgisAccount';

import { getPortalItem } from '../utilities/arcgisUtils';
import AppRoutes from '../constants/AppRoutes';

export const AccountsContext = createContext();

export const AccountsContextProvider = ({ children, config }) => {
    const [userVerified, setUserVerified] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const { auth } = config;

    esriConfig.portalUrl = auth.portalUrl;
    const sharingUrl = auth.portalUrl + '/sharing';

    const options = {
        clientId: auth.clientId,
        popup: auth.popup,
        portalUrl: sharingUrl,
        params: { ...auth.params },
        redirectUri: `${window.location.origin}${process.env.PUBLIC_URL}${AppRoutes.home.path}`,
    };

    const { accountManagerState, addAccount, logoutAccount, verifyToken } = useAccountManager(options);
    const { active, accounts } = accountManagerState;

    const signIn = async () => {
        addAccount();
    };

    const signOut = async () => {
        logoutAccount(accounts[active]);
        setUserVerified(false);
    };

    const getAccountSessionStatus = useCallback(async () => {
        const account = accounts[active];
        if (account?.key && account?.session) {
            const session = account?.session;

            const tokenExpires = session?.tokenExpires;
            const dateTime = new Date();

            const check = account?.key && (await verifyToken(account));
            const status = tokenExpires && tokenExpires > dateTime;

            return check && status;
        }
    }, [verifyToken, accounts, active]);

    // Verify user has access to appItemId
    const verifyAccess = useCallback(
        async (account) => {
            try {
                const data = await getPortalItem(auth.appItemId, {
                    authentication: account?.session,
                    portal: sharingUrl,
                });
                if (data) {
                    IdentityManager.registerToken({
                        token: account.token,
                        server: sharingUrl + '/rest',
                        ssl: account.session.ssl,
                        userId: account.user.id,
                        expires: account.session.tokenExpires,
                    });
                    setUserVerified(true);
                    setErrorMessage(null);
                } else {
                    setUserVerified(false);
                }
            } catch (err) {
                console.log('access issue');
                setUserVerified(false);
                setErrorMessage(err.message);
                logoutAccount(account);
            }
        },
        [auth.appItemId, logoutAccount, sharingUrl]
    );

    // Verify access each time the account changes
    useEffect(() => {
        const account = accounts[active];
        if (account && account?.session) {
            verifyAccess(account);
        }
    }, [accounts, active, verifyAccess]);

    const getOriginRoute = useCallback(() => {
        const { originRoute } = accountManagerState?.status || {};
        try {
            const path = new URL(originRoute).pathname;
            return path;
        } catch (e) {
            console.error(`Error retrieving originPath. ${e}`);
            return undefined;
        }
    }, [accountManagerState.status]);

    return (
        <AccountsContext.Provider
            value={{
                signIn,
                signOut,
                getAccountSessionStatus,
                getOriginRoute,
                userVerified,
                errorMessage,
                account: accounts[active],
                config,
            }}
        >
            {children}
        </AccountsContext.Provider>
    );
};

export const useAccountsContext = () => {
    const accountsContext = useContext(AccountsContext);
    if (!accountsContext) throw new Error(`Cannot use 'useAccountsContext' outside of a AccountsContextProvider`);
    return accountsContext;
};
