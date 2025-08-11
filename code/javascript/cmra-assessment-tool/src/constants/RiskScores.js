const RiskScores = {
    textToNumber: {
        'Insufficient Data': 0,
        'Not Applicable': 0,
        'No Rating': 0,
        'Very Low': 1,
        'Relatively Low': 2,
        'Relatively Moderate': 3,
        'Relatively High': 4,
        'Very High': 5,
    },
    nullNumber: 0,
    nullText: 'No Rating',
};

export default RiskScores;
