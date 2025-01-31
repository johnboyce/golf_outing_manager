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

    $('#draft-turn-banner').html('<div class="alert alert-success">`Draft commissioned successfully!`</div>');
    $('#commission-draft-btn').prop('disabled', false).removeClass('d-none');
    $('#foursomes-tab').click(); // Redirect to Foursomes tab
    $('#draft-tab').addClass('d-none');
    $('#foursomes-tab').removeClass('d-none');
    updateFoursomesTab();
}

// Generate Foursomes
function generateFoursomes() {
    console.log('Generating foursomes...');

    const draftData = StateManager.get('draftData');
    const courses = StateManager.get('courses');
    const allFoursomes = {};

    courses.forEach(course => {
        const courseFoursomes = [];

        // Shuffle the teams independently for this course
        const shuffledTeamOne = StateManager.shuffleArray([...draftData.teamOne.players]);
        const shuffledTeamTwo = StateManager.shuffleArray([...draftData.teamTwo.players]);

        // Clone the shuffled teams to avoid modifying the original arrays
        const teamOnePlayers = [...shuffledTeamOne];
        const teamTwoPlayers = [...shuffledTeamTwo];

        // Generate balanced foursomes for the course
        while (teamOnePlayers.length >= 2 && teamTwoPlayers.length >= 2) {
            const [cartOne, cartTwo] = assignCarts(teamOnePlayers, teamTwoPlayers);
            courseFoursomes.push({ cartOne, cartTwo });
        }

        // Log any unassigned players for debugging
        if (teamOnePlayers.length > 0 || teamTwoPlayers.length > 0) {
            console.warn(`Extra players for course ${course.name}:`, { teamOnePlayers, teamTwoPlayers });
        }

        // Add the generated foursomes to the course
        allFoursomes[course.id] = courseFoursomes;
    });

    // Update the draft data with generated foursomes
    StateManager.updateDraftData({ foursomes: allFoursomes });
    console.log('Foursomes generated:', allFoursomes);
}




function assignCarts(teamOnePlayers, teamTwoPlayers) {
    const cartOne = [];
    const cartTwo = [];

    if (teamOnePlayers.length > 0) cartOne.push(teamOnePlayers.shift());
    if (teamTwoPlayers.length > 0) cartOne.push(teamTwoPlayers.shift());
    if (teamOnePlayers.length > 0) cartTwo.push(teamOnePlayers.shift());
    if (teamTwoPlayers.length > 0) cartTwo.push(teamTwoPlayers.shift());

    return [cartOne, cartTwo];
}



// Update Foursomes Tab
function updateFoursomesTab() {
    console.log('Updating Foursomes Tab...');
    const foursomes = StateManager.get('draftData').foursomes;
    const courses = StateManager.get('courses');
    const draftData = StateManager.get('draftData');

    const $tabsContainer = $('#foursomeCourseTabs').empty();
    const $tabContentContainer = $('#foursomeCourseTabContent').empty();

    // Fetch team names based on captains' nicknames
    const teamOneName = `Team ${draftData.teamOne.captain.nickname}`;
    const teamTwoName = `Team ${draftData.teamTwo.captain.nickname}`;

    courses.forEach((course, index) => {
        // Create the tab button
        const courseTab = $(`
            <button
                class="custom-tab ${index === 0 ? 'active-tab' : ''}" 
                data-course-id="${course.id}">
                ${course.name}
            </button>
        `);
        $tabsContainer.append(courseTab);

        // Create the tab content container
        const courseContent = $(`
            <div
                class="custom-tab-content ${index === 0 ? 'active-content' : 'hidden-content'}" 
                data-course-id="${course.id}">
                <div class="course-foursome">
                    <h4 class="text-center text-primary">${course.name}</h4>
                    <img src="${course.image}" alt="${course.name}" class="img-fluid rounded mb-3" style="height: 200px; border: 2px solid #007bff;">
                </div>
            </div>
        `);

        // Populate the course content with foursomes
        const courseFoursomes = foursomes[course.id] || [];
        courseFoursomes.forEach((foursome, index) => {
            const groupElement = $(`
                <div class="foursome-group mb-3 p-3 rounded border" style="background-color: #f8f9fa;">
                    <h5 class="text-center text-success"><i class="fas fa-users"></i> Foursome ${index + 1}</h5>
                </div>
            `);

            [foursome.cartOne, foursome.cartTwo].forEach((cart, cartIndex) => {
                const cartElement = $(`
                    <div class="cart-group mb-2 d-flex align-items-center">
                        <h6 class="me-2 text-info"><i class="fas fa-golf-cart"></i> Cart ${cartIndex + 1}:</h6>
                        <div class="cart-players d-flex justify-content-between flex-wrap"></div>
                    </div>
                `);

                const $cartPlayersContainer = cartElement.find('.cart-players');

                cart.forEach(player => {
                    const teamName = player.team === 'teamOne' ? teamOneName : teamTwoName;

                    $cartPlayersContainer.append(`
                        <div class="player-entry d-flex align-items-center mx-2 p-2" style="border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
                            <img src="${player.teamLogo}" 
                                 alt="${teamName} Logo" 
                                 style="width: 50px; height: 50px; margin-right: 10px; border-radius: 50%; border: 2px solid #007bff;">
                            <div>
                                <span style="font-weight: bold; color: #333;">${player.name} (${player.handicap})</span>
                                <br>
                                <small class="text-muted"><i class="fas fa-flag"></i> ${teamName}</small>
                            </div>
                        </div>
                    `);
                });

                groupElement.append(cartElement);
            });

            courseContent.append(groupElement);
        });

        $tabContentContainer.append(courseContent);
    });

    // Custom Tab Switching Logic
    $('.custom-tab').on('click', function () {
        const courseId = $(this).data('course-id');

        // Update tab button styling
        $('.custom-tab').removeClass('active-tab');
        $(this).addClass('active-tab');

        // Update tab content visibility
        $('.custom-tab-content').removeClass('active-content').addClass('hidden-content');
        $(`.custom-tab-content[data-course-id="${courseId}"]`).removeClass('hidden-content').addClass('active-content');
    });

    console.log('Foursomes tab updated with custom tab-switching logic.');
}









