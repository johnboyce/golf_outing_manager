// StateManager.js

(function () {
    const state = {
        draftData: {
            teamOne: { captain: null, players: [] },
            teamTwo: { captain: null, players: [] },
            currentDraftTurn: 'teamOne',
            draftStarted: false,
            foursomes: {},
        },
        playerProfiles: [],
        courses: [
            {
                name: "Bear Trap Dunes",
                description: "A spectacular course featuring coastal views and challenging dunes. Perfect for golfers of all skill levels.",
                image: "https://www.beartrapdunes.com/wp-content/uploads/sites/8962/2023/06/home-main-1.jpg",
                icon: "fas fa-golf-ball",
            },
            {
                name: "War Admiral",
                description: "Inspired by the famous thoroughbred, this course offers a mix of strategy and precision with its unique design.",
                image: "https://www.pamsgolfoc.com/wp-content/uploads/2020/01/waradmiral-1.jpg",
                icon: "fas fa-golf-club",
            },
            {
                name: "Man O' War",
                description: "A thrilling challenge for golfers, with picturesque views and water hazards adding to its allure.",
                image: "https://www.ruarkgolf.com/app/uploads/2018/08/MOW-30-1024x576.jpg",
                icon: "fas fa-water",
            },
            {
                name: "Lighthouse Sound",
                description: "Known for its incredible views of the bay and a distinctive setup that challenges even the best golfers.",
                image: "https://www.ruarkgolf.com/app/uploads/2018/08/RP-06_DJI_0062.jpg",
                icon: "fas fa-lightbulb",
            },
        ],
    };

    const StateManager = {
        get(key) {
            return state[key];
        },
        set(key, value) {
            state[key] = value;
        },
        updateDraftData(data) {
            state.draftData = { ...state.draftData, ...data };
        },
        reset() {
            state.draftData = {
                teamOne: { captain: null, players: [] },
                teamTwo: { captain: null, players: [] },
                currentDraftTurn: 'teamOne',
                draftStarted: false,
                foursomes: {},
            };
            state.playerProfiles = [];
        },
        shuffleArray(array) {
            return array
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        },
    };

    // Attach to global namespace
    window.StateManager = StateManager;
})();
