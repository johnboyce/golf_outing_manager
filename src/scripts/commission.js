$(document).ready(() => {
    initializeCommissionTab();
});

// Initialize Commission Tab
function initializeCommissionTab() {
    console.log('Initializing Commission Tab...');
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Commission Draft (No Persistence Yet)
function commissionDraft() {
    console.log('Commissioning draft...');
    const draftData = StateManager.get('draftData');

    if (!draftData.teamOne.players.length || !draftData.teamTwo.players.length) {
        console.error('Cannot commission draft: Teams are incomplete.');
        alert('Please ensure all players have been assigned before commissioning the draft.');
        return;
    }

    const timestamp = new Date().toISOString();
    const description = `Commissioned Draft - ${new Date().toLocaleString()}`;

    // ✅ Generate and save foursomes
    const foursomes = generateFoursomes();
    StateManager.updateDraftData({ timestamp, description, foursomes });

    console.log("Foursomes generated and saved:", foursomes);
    updateDraftTabUI();
    // ✅ Enable "Save Draft" button after commission
    $('#save-draft-btn').prop('disabled', false);

    $('#draft-turn-banner').html('<div class="alert alert-success">Draft commissioned successfully! Now you can save it.</div>');
}


function updateDraftTabUI() {
    console.log("Updating Draft Tab UI...");

    const draftData = StateManager.get('draftData');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error("Captains are missing, unable to update Draft Tab.");
        return;
    }

    const $draftTabContent = $('#draft-section').empty().removeClass('d-none');

    const teamOneHTML = `
        <div class="col-md-6">
            <h3 class="text-center text-primary">Team ${draftData.teamOne.captain.nickname}</h3>
            <div class="text-center mb-3">
                <img src="${draftData.teamOne.captain.teamLogo}" class="team-logo" alt="Team One Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #007bff;">
            </div>
            <ul class="list-group">
                <li class="list-group-item active text-white bg-primary">${draftData.teamOne.captain.name} (Captain)</li>
                ${draftData.teamOne.players.map(player => `
                    <li class="list-group-item">${player.name} (${player.handicap})</li>
                `).join("")}
            </ul>
        </div>
    `;

    const teamTwoHTML = `
        <div class="col-md-6">
            <h3 class="text-center text-danger">Team ${draftData.teamTwo.captain.nickname}</h3>
            <div class="text-center mb-3">
                <img src="${draftData.teamTwo.captain.teamLogo}" class="team-logo" alt="Team Two Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #dc3545;">
            </div>
            <ul class="list-group">
                <li class="list-group-item active text-white bg-danger">${draftData.teamTwo.captain.name} (Captain)</li>
                ${draftData.teamTwo.players.map(player => `
                    <li class="list-group-item">${player.name} (${player.handicap})</li>
                `).join("")}
            </ul>
        </div>
    `;

    $draftTabContent.append(`<div class="row">${teamOneHTML}${teamTwoHTML}</div>`);
}






// Generate Foursomes
function generateFoursomes() {
    console.log('Generating foursomes...');

    const draftData = StateManager.get('draftData');
    const courses = StateManager.get('courses');
    const allFoursomes = {};

    // ✅ Get team captain logos
    const teamOneLogo = draftData.teamOne.captain.teamLogo || "default_logo.png";
    const teamTwoLogo = draftData.teamTwo.captain.teamLogo || "default_logo.png";

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
            const [cartOne, cartTwo] = assignCarts(teamOnePlayers, teamTwoPlayers, teamOneLogo, teamTwoLogo);
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

    return allFoursomes;
}

function assignCarts(teamOnePlayers, teamTwoPlayers, teamOneLogo, teamTwoLogo) {
    const cartOne = [];
    const cartTwo = [];

    if (teamOnePlayers.length > 0) {
        let player = teamOnePlayers.shift();
        player.teamLogo = teamOneLogo; // ✅ Assign team captain's logo
        cartOne.push(player);
    }
    if (teamTwoPlayers.length > 0) {
        let player = teamTwoPlayers.shift();
        player.teamLogo = teamTwoLogo; // ✅ Assign team captain's logo
        cartOne.push(player);
    }
    if (teamOnePlayers.length > 0) {
        let player = teamOnePlayers.shift();
        player.teamLogo = teamOneLogo; // ✅ Assign team captain's logo
        cartTwo.push(player);
    }
    if (teamTwoPlayers.length > 0) {
        let player = teamTwoPlayers.shift();
        player.teamLogo = teamTwoLogo; // ✅ Assign team captain's logo
        cartTwo.push(player);
    }

    return [cartOne, cartTwo];
}


function updateFoursomesUI(foursomes) {
    const $foursomesContainer = $('#foursomes-container').empty();
    if ($("#foursomes-section").hasClass("d-none")) {
        console.log("Making Foursomes UI visible...");
        $("#foursomes-section").removeClass("d-none");
    }

    if (!foursomes || Object.keys(foursomes).length === 0) {
        $foursomesContainer.html('<p>No foursomes available.</p>');
        return;
    }

    console.log("Rendering foursomes UI...", foursomes);

    Object.entries(foursomes).forEach(([course, groups]) => {
        const courseHeader = `<h3 class="course-header">${course}</h3>`;
        const courseGroup = $('<div class="course-group"></div>').append(courseHeader);

        groups.forEach((group, index) => {
            const groupContainer = $('<div class="foursome-group"></div>');

            group.cartOne.forEach(player => {
                groupContainer.append(renderPlayerCard(player, "cartOne"));
            });

            group.cartTwo.forEach(player => {
                groupContainer.append(renderPlayerCard(player, "cartTwo"));
            });

            courseGroup.append(groupContainer);
        });

        $foursomesContainer.append(courseGroup);
    });
}

function renderPlayerCard(player, cart) {
    return `
        <div class="player-card">
            <span>${player}</span> 
            <small class="cart-label">(${cart})</small>
        </div>
    `;
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









