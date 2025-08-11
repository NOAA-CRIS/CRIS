const AppConfig = {
    apiKey: 'AAPKf78eebd6f9c1414b9e686c16e456939eE7UZ2Ya1XhrzyKwzTcP7pJhgshXdgSVp-iUZBGVvc0jUowGMSWx2nu5hL6AlJDYY',
    auth: {
        appItemId: '7c091564683f4edfbad442240de79801',
        clientId: 'KG6zuGKrGA0CAgDa',
        portalUrl: 'https://nationalclimate.maps',
        params: {
            popup: false,
            canHandleCrossOrgSignIn: true,
        },
    },
    googleAnalytics: 'UA-160175705-3',
    webmapIds: {
        search: '97f080d81cdc401d97e6c196f953ea20',
        search_dev: '7d9ec004789448228b109204500fdd3d',
    },
    datasets: {
        counties: {
            url: 'https://services3.arcgis.com/0Fs3HcaFfvzXvm7w/ArcGIS/rest/services/CMRA_Screening_Data/FeatureServer/0',
        },
        tracts: {
            url: 'https://services3.arcgis.com/0Fs3HcaFfvzXvm7w/arcgis/rest/services/CMRA_Screening_Data/FeatureServer/1',
        },
        aiannha: {
            url: 'https://services3.arcgis.com/0Fs3HcaFfvzXvm7w/ArcGIS/rest/services/CMRA_Screening_Data/FeatureServer/2',
        },
    },
    searchZoom: 13,
    zoomToGeomExtentFactor: 1.5,
    rendererDataExtentFactor: 1.5,
    renderer: {
        type: 'classBreaks',
        visualVariables: [
            {
                type: 'sizeInfo',
                valueExpression: '$view.scale',
                stops: [
                    {
                        size: 2,
                        value: 421728,
                    },
                    {
                        size: 1,
                        value: 1317901,
                    },
                    {
                        size: 0.5,
                        value: 5271605,
                    },
                    {
                        size: 0,
                        value: 10543209,
                    },
                ],
                target: 'outline',
            },
        ],
        classBreakInfos: [
            {
                classMaxValue: 9007199254740991,
                symbol: {
                    type: 'esriSFS',
                    color: [170, 170, 170, 255],
                    outline: {
                        type: 'esriSLS',
                        color: [194, 194, 194, 64],
                        width: 0.375,
                        style: 'esriSLSSolid',
                    },
                    style: 'esriSFSSolid',
                },
            },
        ],
        field: '',
        minValue: -9007199254740991,
    },
    urls: {
        report: 'https://cmra-reports.s3.amazonaws.com',
        toolMethodology: 'https://screeningtool.geoplatform.gov/en/methodology',
        bcatInfo: 'https://www.fema.gov/emergency-managers/risk-management/building-science/bcat',
        userGuide: 'https://resilience.climate.gov/pages/user-guide',
        portal: 'https://resilience.climate.gov/',
        dataSources: 'https://resilience.climate.gov/pages/data-sources',
    },
};

export default AppConfig;
