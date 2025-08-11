import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// App components
import { AppContainer } from './App-styled';
import Header from './components/Header';
import ScreeningMap from './components/ScreeningMap';
import ExplorePage from './pages/ExplorePage';
import ExploreMapPage from './pages/ExploreMapPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NavigationTabs from './components/NavigationTabs';

// Hooks, context, and constants
import { useAccountsContext } from './context/AccountsContext';
import { useAppContext } from './context/AppContext';
import AppRoutes from './constants/AppRoutes';

const App = () => {
    const { appRoute, setAppRoute, config } = useAppContext();

    // ----- Context -----
    const { account, userVerified, getAccountSessionStatus } = useAccountsContext();

    // ----- Authenticate -----
    const authenticated = account?.token && getAccountSessionStatus(account);

    let location = useLocation();

    useEffect(() => {
        Object.values(AppRoutes).forEach((route) => {
            if (location.pathname.includes(route.path) && route.path !== AppRoutes.root.path) {
                setAppRoute(route);
            }
        });
    }, [location, setAppRoute]);

    // ----- Render -----
    if (authenticated && userVerified) {
        // do nothing
    } else if (!userVerified) {
        return <SignInPage />;
    }

    return (
        <AppContainer>
            {appRoute && appRoute.id !== AppRoutes.home.id && <Header />}
            {appRoute && appRoute.path.includes('explore') && <NavigationTabs />}
            <Routes>
                <Route path={AppRoutes.home.path} element={<HomePage />} />
                <Route path={AppRoutes.search.path} element={<SearchPage />} />
                <Route path={AppRoutes.exploreDetails.path} element={<ExplorePage />} />
                <Route path={AppRoutes.exploreMap.path} element={<ExploreMapPage />} />
                <Route path={AppRoutes.root.path} element={<Navigate to={AppRoutes.home.path} />} />
            </Routes>
            <ScreeningMap webmapId={config.webmapIds.search} />
        </AppContainer>
    );
};

export default App;
