$(document).ready(() => {
    initializeCommissionTab();
});

// Initialize Commission Tab
function initializeCommissionTab() {
    console.log('Initializing Commission Tab...');
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Commission Draft
function commissionDraft() {
    console.log('Commissioning draft...');
    const draftData = StateManager.get('draftData');
    const timestamp = new Date().toISOString();
    const humanReadableName = new Date().toLocaleString();

    if (!draftData.teamOne.players.length || !draftData.teamTwo.players.length) {
        console.error('Cannot commission draft: Teams are incomplete.');
        alert('Please ensure all players have been assigned before commissioning the draft.');
        return;
    }

    // Save draft under unique timestamp
    StateManager.set(`drafts.${timestamp}`, {
        timestamp,
        name: humanReadableName,
        data: draftData,
    });

    console.log(`Draft saved as ${humanReadableName}:`, draftData);

    // Generate Foursomes
    generateFoursomes();

    // Confirm success to the user
    alert(`Draft commissioned successfully on ${humanReadableName}.`);
    updateFoursomesTab();
    $('#foursomes-tab').click(); // Redirect to Foursomes tab
}

// Generate Foursomes
function generateFoursomes() {
    console.log('Generating foursomes...');
    const draftData = StateManager.get('draftData');
    const courses = StateManager.get('courses');

    // Clone and shuffle team arrays to avoid mutating the original data
    const teamOne = StateManager.shuffleArray([...draftData.teamOne.players]);
    const teamTwo = StateManager.shuffleArray([...draftData.teamTwo.players]);

    const allPlayers = [...teamOne, ...teamTwo]; // All players combined
    const playerMatchTracker = new Map(allPlayers.map(player => [player.id, new Set()])); // Track matchups

    // Initialize empty groups for each course
    const courseFoursomes = courses.reduce((acc, course) => {
        acc[course.id] = []; // Each course gets an empty array
        return acc;
    }, {});

    // Generate foursomes for each course
    courses.forEach(course => {
        const remainingTeamOne = [...teamOne];
        const remainingTeamTwo = [...teamTwo];

        const courseFoursomesForCourse = [];
        while (remainingTeamOne.length > 0 || remainingTeamTwo.length > 0) {
            // Generate a foursome by alternating players between teams
            const [cartOne, cartTwo] = createBalancedFoursome(remainingTeamOne, remainingTeamTwo, playerMatchTracker);

            if (cartOne.length > 0 || cartTwo.length > 0) {
                courseFoursomesForCourse.push({ cartOne, cartTwo });
            }

            // Stop when we can't form a complete foursome
            if (remainingTeamOne.length + remainingTeamTwo.length < 4) break;
        }

        courseFoursomes[course.id] = courseFoursomesForCourse;
    });

    StateManager.updateDraftData({ foursomes: courseFoursomes });
    console.log('Foursomes generated:', courseFoursomes);
}


function createBalancedFoursome(teamOne, teamTwo, playerMatchTracker) {
    const cartOne = [];
    const cartTwo = [];

    // Assign players to carts ensuring balance between teams
    while (cartOne.length < 2 && teamOne.length > 0 && teamTwo.length > 0) {
        const playerOne = teamOne.shift();
        const playerTwo = teamTwo.shift();

        cartOne.push(playerOne);
        cartTwo.push(playerTwo);

        // Update the match tracker
        updateMatchTracker(playerOne, playerTwo, playerMatchTracker);
    }

    // Balance remaining players, prioritize players from opposite teams
    while (cartOne.length < 2 && (teamOne.length > 0 || teamTwo.length > 0)) {
        const nextPlayer = teamOne.length > 0 ? teamOne.shift() : teamTwo.shift();
        cartOne.push(nextPlayer);
    }

    while (cartTwo.length < 2 && (teamOne.length > 0 || teamTwo.length > 0)) {
        const nextPlayer = teamOne.length > 0 ? teamOne.shift() : teamTwo.shift();
        cartTwo.push(nextPlayer);
    }

    return [cartOne, cartTwo];
}

function updateMatchTracker(playerOne, playerTwo, playerMatchTracker) {
    if (!playerOne || !playerTwo) return;

    playerMatchTracker.get(playerOne.id).add(playerTwo.id);
    playerMatchTracker.get(playerTwo.id).add(playerOne.id);
}

// Update Foursomes Tab
function updateFoursomesTab() {
    console.log('Updating Foursomes Tab...');
    const foursomes = StateManager.get('draftData').foursomes;
    const courses = StateManager.get('courses');
    const draftData = StateManager.get('draftData');
    const $foursomesContainer = $('#foursomes-container').empty();

    const teamOneName = `Team ${draftData.teamOne.captain.nickname}`;
    const teamTwoName = `Team ${draftData.teamTwo.captain.nickname}`;

    courses.forEach(course => {
        const courseFoursomes = foursomes[course.id] || [];
        const courseElement = $(`
            <div class="course-foursome mb-4">
                <h4>${course.name}</h4>
                <img src="${course.image}" alt="${course.name}" class="img-fluid rounded mb-3">
            </div>
        `);

        courseFoursomes.forEach((foursome, index) => {
            const groupElement = $(`
                <div class="foursome-group mb-3">
                    <h5>Foursome ${index + 1}</h5>
                </div>
            `);

            [foursome.cartOne, foursome.cartTwo].forEach((cart, cartIndex) => {
                const cartElement = $(`
                    <div class="cart-group mb-2">
                        <h6>Cart ${cartIndex + 1}</h6>
                    </div>
                `);

                cart.forEach(player => {
                    const teamName = player.team === 'teamOne' ? teamOneName : teamTwoName;

                    cartElement.append(`
                        <div class="player-entry d-flex align-items-center mb-2">
                            <img src="${player.team === 'teamOne' ? draftData.teamOne.captain.teamLogo : draftData.teamTwo.captain.teamLogo}" 
                                 alt="${teamName} Logo" 
                                 style="width: 50px; height: 50px; margin-right: 10px;">
                            <div>
                                <span>${player.name} (${player.handicap})</span>
                                <br>
                                <small class="text-muted">${teamName}</small>
                            </div>
                        </div>
                    `);
                });

                groupElement.append(cartElement);
            });

            courseElement.append(groupElement);
        });

        $foursomesContainer.append(courseElement);
    });

    console.log('Foursomes tab updated.');
}

