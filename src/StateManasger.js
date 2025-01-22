const StateManager = (function () {
    // Private state
    let state = {
        draftData: {
            teamOne: {
                captain: null,
                name: 'Team One',
                players: [],
            },
            teamTwo: {
                captain: null,
                name: 'Team Two',
                players: [],
            },
            foursomes: {
                bearTrapDunes: [],
                warAdmiral: [],
                manOWar: [],
                lighthouseSound: [],
            },
        },
        allPlayers: [],
    };

    // Public API
    return {
        get(key) {
            return state[key];
        },
        set(key, value) {
            if (key in state) {
                state[key] = value;
            } else {
                console.error(`Key "${key}" does not exist in state.`);
            }
        },
        updateDraftData(updates) {
            state.draftData = { ...state.draftData, ...updates };
        },
        reset() {
            state = {
                draftData: {
                    teamOne: { captain: null, name: 'Team One', players: [] },
                    teamTwo: { captain: null, name: 'Team Two', players: [] },
                    foursomes: {
                        bearTrapDunes: [],
                        warAdmiral: [],
                        manOWar: [],
                        lighthouseSound: [],
                    },
                },
                allPlayers: [],
            };
            console.log('State has been reset.');
        },
    };
})();
