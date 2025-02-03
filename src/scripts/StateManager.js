const StateManager = (() => {
    let state = {
        playerProfiles: [],
        draftData: {
            teamOne: { captain: null, players: [] },
            teamTwo: { captain: null, players: [] },
            draftStarted: false,
        },
        courses: [], // Start empty, will be populated dynamically
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
                courses: [],
            };
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
                this.notifyListeners(); // Ensure UI updates after loading courses
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        },
        notifyListeners() {
            // Placeholder function to trigger UI updates (modify based on framework)
            console.log("State updated:", state);
        },
        async initialize() {
            await this.fetchCourses();
        },
    };
})();

// Initialize the state manager
StateManager.initialize();
