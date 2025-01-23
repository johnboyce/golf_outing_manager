const StateManager = (() => {
    let state = {
        playerProfiles: [],
        draftData: {
            teamOne: { captain: null, players: [] },
            teamTwo: { captain: null, players: [] },
            draftStarted: false,
        },
    };

    return {
        get: key => state[key],
        set: (key, value) => { state[key] = value; },
        updateDraftData: updates => {
            state.draftData = { ...state.draftData, ...updates };
        },
        reset: () => {
            state = {
                playerProfiles: [],
                draftData: {
                    teamOne: { captain: null, players: [] },
                    teamTwo: { captain: null, players: [] },
                    draftStarted: false,
                },
            };
        },
    };
})();
