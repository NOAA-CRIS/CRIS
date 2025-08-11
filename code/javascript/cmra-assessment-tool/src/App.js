// Framework and third-party non-ui
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ReactGA from 'react-ga4';

// App components
import { AppContainer } from './App-styled';
import Header from './components/Header';
import ScreeningMap from './components/ScreeningMap';
import ExplorePage from './pages/ExplorePage';
import ExploreMapPage from './pages/ExploreMapPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NavigationTabs from './components/NavigationTabs';

// Hooks, context, and constants
import { useMediaQuery } from 'react-responsive';
import { useAppContext } from './context/AppContext';
import AppRoutes from './constants/AppRoutes';
import MobilePage from './pages/MobilePage';

const App = () => {
    const { appRoute, setAppRoute, config } = useAppContext();

    ReactGA.initialize(config.googleAnalytics);

    let location = useLocation();

    useEffect(() => {
        Object.values(AppRoutes).forEach((route) => {
            if (location.pathname.includes(route.path) && route.path !== AppRoutes.root.path) {
                setAppRoute(route);
            }
        });
        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [location, setAppRoute]);

    const mobileWidth = useMediaQuery({ query: '(max-width: 699px)' });
    const mobileHeight = useMediaQuery({ query: '(max-height: 540px)' });

    // if mobile show device not supported page
    if (mobileWidth || mobileHeight) {
        return (
            <AppContainer>
                <MobilePage />
            </AppContainer>
        );
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
