const enTranslation = {
    SignInPage: {
        Login: 'Climate Mapping For Resilience and Adaptation',
        SignIn: 'Sign In',
        SignOut: 'Sign Out',
        Error: 'Access Denied',
    },
    App: {
        Title: 'Climate Mapping For Resilience and Adaptation',
        LinkToPortal: 'CMRA',
        UserGuide: 'User Guide',
        DataSources: 'Data Sources',
    },
    Alert: {
        NoData: {
            Title: 'Data Not Found',
            Message: {
                default: 'Select a {{standardGeography}} within the United States',
                aiannha: 'Select an American Indian/Alaska Native/Native Hawaiian Area, shown in gray.',
            },
        },
        RenderError: {
            Title: 'Error Displaying Data',
            Message: 'An Error has occurred, please modify your selection.',
        },
        DeviceSupport: {
            Title: 'Device not supported',
            P1: 'We are sorry, and the CMRA assessment tool currently does not support mobile devices or anything that has a smaller screen resolution than 700 x 540. ',
            P2: 'You can go back to the CMRA Portal, or use a different device to visit the assessment tool again.',
            Button1: 'View CRMA Portal',
            Button2: 'Access User Guide',
        },
    },
    Header: {
        Button: 'Get Complete Report',
        ButtonDisabled: 'Reports are not available for Census Tracts.',
    },
    Home: {
        SearchMap: 'Search Map',
        Details:
            'Data and maps available in this tool are downscaled results from global climate models. Results for selected geographies indicate how local exposure to five common climate-related hazards is projected to change through this century.  Assessing climate vulnerability and risk to your local assets will require additional information that is not available in this tool.',
        DetailsLinkText:
            'See the U.S. Climate Resilience Toolkit’s Steps to Resilience framework for more information.',
    },
    Search: {
        BrowseMap: 'Select Location',
        Submit: 'Check Climate Exposure',
        ProjectLocation: 'Project Location',
        MapPin: 'Choose a location on the map',
    },
    HazardList: {
        Title: 'Climate Hazards',
    },
    IndicatorList: {
        Title: 'Climate Projections for',
        ProjectedBy: 'Projected by',
    },
    IndicatorItem: {
        PositiveDelta: '+ {{value}} since 1976-2005',
        NegativeDelta: '- {{value}} since 1976-2005',
        NoDelta: 'No change since 1976-2005',
    },
    IndicatorDetails: {
        Title: 'Indicator Details',
        Tab1: 'Chart',
        Tab2: 'Table',
        MeanValueLabel: 'Mean Estimated Value',
        ValueLabel: 'Estimated Value',
    },
    Flags: {
        Disadvantaged: 'Disadvantaged Community',
        DisadvantagedPopulation: '{{popPercent}}% of Population in Disadvantaged Communities',
        NonDisadvantaged: 'Not a Disadvantaged Community',
        DisadvantagedTooltip:
            'According to the Climate and Economic Justice Screening Tool (CEJST), communities are considered to be disadvantaged if they are in census tracts that meet the thresholds for at least one of the tool’s categories of burden, or if they are on land within the boundaries of Federally Recognized Tribes, including Alaska Native Villages.\n\nFederal agencies will use CEJST to help identify communities that can benefit from investments in climate, clean energy, and related areas.\n\nClick the button to learn more about CEJST.',
        BuildingCode: 'Building Code: {{buildingCode}}',
        BuildingCodeTooltip:
            'Resistant  — 100% of the county is required to adhere to a hazard-resistant building code\n\nPartially Resistant – portions of the county are required to adhere to a hazard-resistant building code\n\nLower resistance – no part of the county is required to adhere to a hazard-resistant building code\n\nClick the button for more information.',
    },
    Inputs: {
        Hazards: {
            ShortLabel: 'Hazards',
        },
        Indicators: {
            ShortLabel: 'Indicators',
        },
        Models: {
            ShortLabel: 'Prediction Model',
        },
        Timeframe: {
            Future: 'Prediction Years',
            All: 'Timeframe',
        },
    },
    NavigationTab: {
        Details: 'Climate Projections',
        DetailsTooltip: 'Climate projections for three periods and two scenarios',
        Map: 'Map Exploration',
    },
    StandardGeographySelect: {
        Info: 'Select a geography:',
    },
    Legend: {
        Header: 'Climate Indicator Value:',
        Tribal: 'Tribal Area',
        Message: 'Click on the map to get information for the selected indicator',
        LeftText: 'Low',
        RightText: 'High',
    },
    Data: {
        Time: {
            HISTORIC: {
                LongLabel: 'Modeled History (1976-2005)',
                Label: 'Modeled History',
                Years: '1976-2005',
            },
            EARLY: {
                Label: 'Early Century',
                Years: '2015–2044',
            },
            MID: {
                Label: 'Mid Century',
                Years: '2035–2064',
            },
            LATE: {
                Label: 'Late Century',
                Years: '2070–2099',
            },
        },
        Stats: {
            MAX: 'Maximum',
            MEAN: 'Mean',
            MIN: 'Minimum',
            PROJECTION: 'Projection',
        },
        Models: {
            RCP45: {
                Short: 'RCP 4.5',
                Label: 'Lower Emissions Scenario',
                LongLabel: 'Lower Emissions Scenario (RCP 4.5)',
                ShortLabel: 'Lower emissions',
                Tooltip:
                    'The Lower Emissions Scenario is a possible future in which humans drastically reduce their use of fossil fuels, reducing global emissions of heat-trapping gases to zero by 2040. This scenario is known as RCP 4.5.',
            },
            RCP85: {
                Short: 'RCP 8.5',
                Label: 'Higher Emissions Scenario',
                LongLabel: 'Higher Emissions Scenario (RCP 8.5)',
                ShortLabel: 'Higher emissions',
                Tooltip:
                    'The Higher Emissions Scenario is a possible future in which humans continue increasing emissions of heat-trapping gases from fossil fuels through 2100. This scenario is known as RCP 8.5.',
            },
        },
        StandardGeographies: {
            COUNTY: 'County',
            TRACT: 'Census Tract',
            aiannha: 'Tribal Area',
            aiannha_Tip: 'American Indian/Alaska Native/Native Hawaiian Area',
        },
    },
    Hazards: {
        drought: {
            Title: 'Drought',
        },
        extreme_temperature: {
            Title: 'Extreme Heat',
        },
        fire: {
            Title: 'Wildfire',
        },
        flooding_inland: {
            Title: 'Flooding',
        },
        flooding_costal: {
            Title: 'Coastal Inundation',
        },
    },
    Indicators: {
        SLR: {
            Title: 'Percent of selected {{standardGeography}} impacted by global sea level rise',
            Name: 'Sea Level Rise',
            LeveeedLegend: 'Leveed Areas',
            Details: 'Percent of selected area impacted by global sea level rise',
            Prefix: '',
            Postfix: '%',
            ValueCard: 'Arae Impacted by See Level Rise',
        },
        CURRENT_INLAND_FLOOD: {
            Title: 'Current flood hazard',
            FLOOD_PCT_100: {
                Name: '100-year flood zone',
                Details: 'Area in 100-year flood zone',
                Prefix: '',
                Postfix: '%',
            },
            FLOOD_PCT_500: {
                Name: '500-year flood zone',
                Details: 'Area in 500-year flood zone',
                Prefix: '',
                Postfix: '%',
            },
            FLOOD_PCT_UND: {
                Name: 'Flood hazard unknown',
                Details: 'Area flood hazard unknown',
                Prefix: '',
                Postfix: '%',
            },
        },

        CDD: {
            Title: 'Cooling-degree days (CDD)',
            Details:
                'Cooling degree days (Estimate of cooling needed to maintain a comfortable temperature. Calculated as the sum of the degrees above 65 °F per day per year)',
            Prefix: '',
            Postfix: 'Degree Days',
        },
        CONSECDD: {
            Title: 'Maximum number of consecutive dry days',
            Details:
                'Annual maximum number of consecutive dry days (days with total precipitation less than 0.01 inches)',
            Prefix: '',
            Postfix: 'Days',
        },
        CONSECWD: {
            Title: 'Maximum number of consecutive wet days',
            Details:
                'Annual maximum number of consecutive wet days (days with total precipitation greater than or equal to 0.01 inches)',
            Prefix: '',
            Postfix: 'Days',
        },
        HDD: {
            Title: 'Heating degree days',
            Details:
                'Heating degree days (Estimate of heating needed to maintain a comfortable temperature. Calculated as the sum of the degrees less than 65 °F per day per year)',
            Prefix: '',
            Postfix: 'Degree Days',
        },
        PR_ANNUAL: {
            Title: 'Average annual total precipitation',
            Details: 'Average annual total precipitation (inches)',
            Prefix: '',
            Postfix: 'Inches',
        },
        PR1IN: {
            Title: 'Annual days with total precipitation > 1 inch',
            Details: 'Annual number of days with total precipitation greater than 1 inch',
            Prefix: '',
            Postfix: 'Days',
        },
        PR2IN: {
            Title: 'Annual days with total precipitation > 2 inches',
            Details: 'Annual number of days with total precipitation greater than 2 inches',
            Prefix: '',
            Postfix: 'Days',
        },
        PR3IN: {
            Title: 'Annual days with total precipitation > 3 inches',
            Details: 'Annual number of days with total precipitation greater than 3 inches',
            Prefix: '',
            Postfix: 'Days',
        },
        PR4IN: {
            Title: 'Annual days with total precipitation > 4 inches',
            Details: 'Annual number of days with total precipitation greater than 4 inches',
            Prefix: '',
            Postfix: 'Days',
        },
        PRMAX1DAY: {
            Title: 'Annual highest precipitation total for a single day',
            Details: 'Annual highest precipitation total for a single day [inches]',
            Prefix: '',
            Postfix: 'Inches',
        },
        PRMAX5DAY: {
            Title: 'Annual highest precipitation total over a 5-day period',
            Details: 'Annual highest precipitation total over a 5-day period [inches]',
            Prefix: '',
            Postfix: 'Inches',
        },
        PR99: {
            Title: 'Annual days that exceed 99th percentile precipitation',
            Details:
                'Annual number of extreme precipitation events, top 1% of historical baseline calculated with reference to the 1976-2005 average [inches]',
            Prefix: '',
            Postfix: 'Days',
        },
        PR0IN: {
            Title: 'Days per year with precipitation (wet days)',
            Details: 'Annual number of days with total precipitation greater than 0.01 inches',
            Prefix: '',
            Postfix: 'Days',
        },
        PRLT0IN: {
            Title: 'Days per year with no precipitation (dry days)',
            Details: 'Annual number of days with total precipitation less than 0.01 inches',
            Prefix: '',
            Postfix: 'Days',
        },
        TAVG: {
            Title: 'Daily average temperature',
            Details: 'Daily average temperature °F',
            Prefix: '',
            Postfix: '°F',
        },
        TMAX: {
            Title: 'Average daily maximum temperature',
            Details: 'Average daily maximum temperature °F',
            Prefix: '',
            Postfix: '°F',
        },
        TMAX100F: {
            Title: 'Annual days with maximum temperature > 100°F',
            Details: 'Annual number of days with a maximum temperature greater than 100°F',
            Prefix: '',
            Postfix: 'Days',
        },
        TMAX105F: {
            Title: 'Annual days with maximum temperature > 105°F',
            Details: 'Annual number of days with a maximum temperature greater than 105°F',
            Prefix: '',
            Postfix: 'Days',
        },
        TMAX1DAY: {
            Title: 'Annual single highest maximum temperature',
            Details: 'Annual single highest maximum temperature °F',
            Prefix: '',
            Postfix: '°F',
        },
        TMAX32F: {
            Title: 'Days with maximum temperature below 32°F',
            Details: 'Annual number of icing days (days with a maximum temperature less than 32°F)',
            Prefix: '',
            Postfix: 'Days',
        },
        TMAX5DAY: {
            Title: 'Annual highest maximum temperature averaged over a 5-day period',
            Details: 'Annual highest maximum temperature averaged over a 5-day period °F',
            Prefix: '',
            Postfix: '°F',
        },
        TMAX90F: {
            Title: 'Annual days with maximum temperature > 90°F',
            Details: 'Annual number of days with a maximum temperature greater than 90°F',
            Prefix: '',
            Postfix: 'Days',
        },
        TMAX95F: {
            Title: 'Annual days with maximum temperature > 95°F',
            Details: 'Annual number of days with a maximum temperature greater than 95°F',
            Prefix: '',
            Postfix: 'Days',
        },
        TMIN: {
            Title: 'Average daily minimum temperature',
            Details: 'Average daily minimum temperature °F',
            Prefix: '',
            Postfix: '°F',
        },
        TMIN32F: {
            Title: 'Annual frost days',
            Details: 'Annual number of frost days (days with a minimum temperature less than 32°F)',
            Prefix: '',
            Postfix: 'Days',
        },
    },
};

export default enTranslation;
