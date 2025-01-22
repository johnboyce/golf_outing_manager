class StateManager {
    constructor() {
        this.state = {
            draftData: {
                teamOne: { captain: null, players: [] },
                teamTwo: { captain: null, players: [] },
                foursomes: {},
                currentDraftTurn: 'teamOne',
                draftStarted: false,
            },
            playerProfiles: [],
            courses: [
                {
                    name: "Bear Trap Dunes",
                    description:
                        "A spectacular course featuring coastal views and challenging dunes. Perfect for golfers of all skill levels.",
                    image: "https://www.beartrapdunes.com/wp-content/uploads/sites/8962/2023/06/home-main-1.jpg",
                    icon: "fas fa-golf-ball",
                },
                {
                    name: "War Admiral",
                    description:
                        "Inspired by the famous thoroughbred, this course offers a mix of strategy and precision with its unique design.",
                    image: "https://www.pamsgolfoc.com/wp-content/uploads/2020/01/waradmiral-1.jpg",
                    icon: "fas fa-golf-club",
                },
                {
                    name: "Man O' War",
                    description:
                        "A thrilling challenge for golfers, with picturesque views and water hazards adding to its allure.",
                    image: "https://www.ruarkgolf.com/app/uploads/2018/08/MOW-30-1024x576.jpg",
                    icon: "fas fa-horse-head",
                },
                {
                    name: "Lighthouse Sound",
                    description:
                        "Known for its incredible views of the bay and a distinctive setup that challenges even the best golfers.",
                    image: "https://www.ruarkgolf.com/app/uploads/2018/08/RP-06_DJI_0062.jpg",
                    icon: "fas fa-lightbulb",
                },
            ],
        };
    }

    // Get the state value by key
    get(key) {
        if (this.state.hasOwnProperty(key)) {
            return this.state[key];
        } else {
            console.error(`StateManager: Key "${key}" not found.`);
            return null;
        }
    }

    // Set the state value by key
    set(key, value) {
        if (this.state.hasOwnProperty(key)) {
            this.state[key] = value;
            console.log(`StateManager: Updated "${key}".`, value);
        } else {
            console.error(`StateManager: Key "${key}" not found.`);
        }
    }

    // Update a nested part of draftData
    updateDraftData(updates) {
        const draftData = this.state.draftData;

        if (!draftData) {
            console.error('StateManager: Draft data is not initialized.');
            return;
        }

        this.state.draftData = { ...draftData, ...updates };
        console.log('StateManager: Draft data updated.', this.state.draftData);
    }

    // Update players in draftData
    addPlayerToTeam(team, player) {
        const draftData = this.state.draftData;

        if (!draftData[team]) {
            console.error(`StateManager: Team "${team}" not found.`);
            return;
        }

        draftData[team].players.push(player);
        console.log(`StateManager: Added player to ${team}.`, player);
    }

    removePlayerFromAvailable(playerId) {
        const playerProfiles = this.state.playerProfiles;
        this.state.playerProfiles = playerProfiles.filter(player => player.id !== playerId);
        console.log(`StateManager: Removed player with ID ${playerId} from available players.`);
    }

    // Reset the state to initial values
    reset() {
        const courses = this.state.courses; // Preserve courses
        this.state = {
            draftData: {
                teamOne: { captain: null, players: [] },
                teamTwo: { captain: null, players: [] },
                foursomes: {},
                currentDraftTurn: 'teamOne',
                draftStarted: false,
            },
            playerProfiles: [],
            courses,
        };
        console.log('StateManager: State reset.');
    }

    // Shuffle and generate foursomes for all courses
    generateFoursomes() {
        const allPlayers = [...this.state.draftData.teamOne.players, ...this.state.draftData.teamTwo.players];
        const shuffledPlayers = this.shuffleArray(allPlayers);

        const courses = this.state.courses;
        const playersPerCourse = Math.ceil(allPlayers.length / courses.length);
        const foursomes = {};

        courses.forEach((course, index) => {
            foursomes[course.name] = shuffledPlayers.slice(
                index * playersPerCourse,
                (index + 1) * playersPerCourse
            );
        });

        this.updateDraftData({ foursomes });
        console.log('StateManager: Foursomes generated.', foursomes);
    }

    // Utility to shuffle an array
    shuffleArray(array) {
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }
}

// Instantiate and export a singleton instance
const StateManagerInstance = new StateManager();
export default StateManagerInstance;
