const StateManager = (() => {
    // Private State
    let state = {
        draftData: {
            teamOne: {
                captain: null,
                players: [],
            },
            teamTwo: {
                captain: null,
                players: [],
            },
            currentDraftTurn: 'teamOne', // Default turn starts with Team One
            draftStarted: false,
            foursomes: {},
        },
        playerProfiles: [], // Contains all players fetched from the API
    };

    // Utility for deep merging objects
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object') {
                if (!target[key]) {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    return {
        // Get State
        get: (key) => {
            if (key in state) {
                return JSON.parse(JSON.stringify(state[key])); // Return a deep copy to avoid direct mutation
            }
            console.warn(`Key "${key}" does not exist in state.`);
            return undefined;
        },

        // Set State
        set: (key, value) => {
            if (key in state) {
                state[key] = JSON.parse(JSON.stringify(value)); // Deep copy to ensure immutability
                console.log(`State updated for key "${key}":`, state[key]);
            } else {
                console.warn(`Key "${key}" does not exist in state.`);
            }
        },

        // Update State (merge new data into existing state)
        updateDraftData: (newData) => {
            state.draftData = deepMerge(state.draftData, newData);
            console.log('Draft data updated:', state.draftData);
        },

        // Reset State
        reset: () => {
            state = {
                draftData: {
                    teamOne: {
                        captain: null,
                        players: [],
                    },
                    teamTwo: {
                        captain: null,
                        players: [],
                    },
                    currentDraftTurn: 'teamOne',
                    draftStarted: false,
                    foursomes: {},
                },
                playerProfiles: [],
            };
            console.log('State reset to initial values.');
        },
    };
})();
