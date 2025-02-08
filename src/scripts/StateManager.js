const StateManager = (() => {
    let state = {
        playerProfiles: [],
        draftData: {
            timestamp: null,  // ✅ Track when the draft was created
            description: "",  // ✅ Store draft description
            teamOne: { captain: null, players: [] },
            teamTwo: { captain: null, players: [] },
            draftStarted: false,
            foursomes: []
        },
        courses: [] // Start empty, will be populated dynamically
    };

    function notifyListeners() {
        console.log("State updated:", state);
        // 🚀 Hook this into UI updates if needed
    }

    return {
        get: key => state[key],
        set: (key, value) => {
            state[key] = value;
            notifyListeners();
        },
        updateDraftData: updates => {
            state.draftData = {
                ...state.draftData,
                ...updates,
                foursomes: updates.foursomes || state.draftData.foursomes || []
            };
            notifyListeners();
        },
        reset: () => {
            state = {
                playerProfiles: [],
                draftData: {
                    timestamp: null,
                    description: "",
                    teamOne: { captain: null, players: [] },
                    teamTwo: { captain: null, players: [] },
                    draftStarted: false,
                    foursomes: []
                },
                courses: [],
            };
            notifyListeners();
        },
        shuffleArray(array) {
            return array
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        },
        async fetchCourses() {
            try {
                const response = await fetch(`${API_GATEWAY_URL}/courses`);
                if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);

                const courses = await response.json();
                state.courses = courses;
                notifyListeners();
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        },
        notifyListeners,
        async initialize() {
            await this.fetchCourses();
        },
    };
})();

// ✅ Initialize the state manager on page load
StateManager.initialize();
