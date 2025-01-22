$(document).ready(() => {
    initializeDraftTab();
});

// Initialize Draft Tab
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
    $('#start-over-btn').on('click', resetDraft);
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            console.log('Players fetched:', players);

            if (Array.isArray(players)) {
                StateManager.set('playerProfiles', players);
                populateCaptainSelectors(players);
            } else {
                console.error('Unexpected response format:', players);
                displayErrorMessage();
            }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error(`Error fetching players: ${textStatus}`, errorThrown);
            displayErrorMessage();
        });
}

// Display Error Message
function displayErrorMessage() {
    $('#available-players').html('<p class="text-danger">An error occurred while loading players. Please try again.</p>');
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector');
    const $teamTwoSelector = $('#team-two-captain-selector');
    const $startDraftButton = $('#start-draft-btn');

    $teamOneSelector.empty().append('<option value="">Select Captain</option>');
    $teamTwoSelector.empty().append('<option value="">Select Captain</option>');

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    const validateCaptainSelection = () => {
        const teamOneCaptain = players.find(player => player.id === $teamOneSelector.val());
        const teamTwoCaptain = players.find(player => player.id === $teamTwoSelector.val());

        StateManager.updateDraftData({
            teamOne: { ...StateManager.get('draftData').teamOne, captain: teamOneCaptain },
            teamTwo: { ...StateManager.get('draftData').teamTwo, captain: teamTwoCaptain },
        });

        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);

    $startDraftButton.prop('disabled', true);
}

// Start Draft
function startDraft() {
    console.log('Starting draft...');
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    draftData.teamOne.players = [draftData.teamOne.captain];
    draftData.teamTwo.players = [draftData.teamTwo.captain];

    const availablePlayers = allPlayers.filter(
        player => player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    StateManager.set('playerProfiles', availablePlayers);
    StateManager.updateDraftData({ draftStarted: true });

    $('#start-draft-btn').addClass('d-none');
    $('#start-over-btn').removeClass('d-none');
    $('#commission-draft-btn').addClass('d-none');

    updateDraftUI();
}

// Update Draft UI
function updateDraftUI() {
    const draftData = StateManager.get('draftData');
    const availablePlayers = StateManager.get('playerProfiles');

    const $availablePlayersList = $('#available-players').empty();
    const $teamOneList = $('#team-one').empty();
    const $teamTwoList = $('#team-two').empty();

    $('#team-one-header h3').text(`Team ${draftData.teamOne.captain?.nickname || 'One'}`);
    $('#team-two-header h3').text(`Team ${draftData.teamTwo.captain?.nickname || 'Two'}`);

    availablePlayers.forEach(player => {
        const currentTurn = draftData.currentDraftTurn;
        const buttonClass = currentTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        const listItem = `
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${currentTurn}')">
                    Add to ${currentTurn === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            </li>
        `;
        $availablePlayersList.append(listItem);
    });

    draftData.teamOne.players.forEach(player => {
        $teamOneList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    draftData.teamTwo.players.forEach(player => {
        $teamTwoList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    if (draftData.draftStarted) {
        const currentTeamNickname =
            draftData.currentDraftTurn === 'teamOne'
                ? draftData.teamOne.captain?.nickname || 'Team One'
                : draftData.teamTwo.captain?.nickname || 'Team Two';

        $('#draft-turn-indicator').html(`<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`);
    } else {
        $('#draft-turn-indicator').html('');
    }
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    StateManager.reset();
    populateCaptainSelectors(StateManager.get('playerProfiles'));

    $('#start-draft-btn').prop('disabled', true).removeClass('d-none');
    $('#start-over-btn, #commission-draft-btn').addClass('d-none');
    $('#draft-turn-indicator').empty();
    updateDraftUI();
}

function commissionDraft() {
    console.log('Commissioning draft...');
    const draftData = StateManager.get('draftData');

    // Generate Foursomes
    generateFoursomes();

    // Update the UI in the Foursomes tab
    updateFoursomesTab();

    // Disable the Commission Draft button
    $('#commission-draft-btn').prop('disabled', true).text('Draft Commissioned');

    // Log final draft data
    console.log('Draft data finalized:', draftData);
}

function assignPlayerToTeam(playerId, team) {
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    // Remove player from available players and add to the selected team
    const player = allPlayers.splice(playerIndex, 1)[0];
    draftData[team].players.push(player);

    // Switch draft turn to the other team
    draftData.currentDraftTurn = team === 'teamOne' ? 'teamTwo' : 'teamOne';

    // Update state with the changes
    StateManager.set('playerProfiles', allPlayers);
    StateManager.set('draftData', draftData);

    // Enable Commission Draft button if all players are drafted
    if (allPlayers.length === 0) {
        $('#commission-draft-btn').removeClass('d-none');
        $('#draft-turn-indicator').html('<div class="alert alert-success">All players have been drafted!</div>');
    }

    // Update the draft UI
    updateDraftUI();
}

function generateFoursomes() {
    console.log('Generating foursomes...');
    const draftData = StateManager.get('draftData');
    const allPlayers = [
        ...draftData.teamOne.players,
        ...draftData.teamTwo.players,
    ];

    // Shuffle players for random assignment
    const shuffledPlayers = shuffleArray(allPlayers);

    // Initialize groups for each course
    const groups = {
        'Bear Trap Dunes': [],
        'War Admiral': [],
        'Man O War': [],
        'Lighthouse Sound': [],
    };

    const playersPerGroup = Math.ceil(allPlayers.length / 4);

    // Distribute players among courses
    Object.keys(groups).forEach((course, index) => {
        groups[course] = shuffledPlayers
            .slice(index * playersPerGroup, (index + 1) * playersPerGroup)
            .map(player => ({
                ...player,
                group: index + 1,
            }));
    });

    // Update draft data with the generated groups
    draftData.foursomes = groups;
    StateManager.set('draftData', draftData);

    console.log('Foursomes generated:', groups);
}

function updateFoursomesTab() {
    console.log('Updating Foursomes Tab...');
    const draftData = StateManager.get('draftData');
    const foursomes = draftData.foursomes;
    const $foursomesContainer = $('#foursomes-container').html('');

    if (!foursomes) {
        $foursomesContainer.html('<p class="text-danger">No foursomes to display.</p>');
        return;
    }

    // Render each course and its groups
    Object.entries(foursomes).forEach(([course, groups]) => {
        const courseElement = $('<div class="mb-4"></div>');
        courseElement.append(`<h3>${course}</h3>`);

        groups.forEach((group, index) => {
            const groupElement = $('<div class="foursome-group mb-3"></div>');

            groupElement.append(`<h4>Foursome ${index + 1}</h4>`);

            group.forEach(player => {
                const playerHtml = `
                    <div class="foursome-player d-flex align-items-center">
                        <img src="${player.team}" === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                             alt="${player.team} Logo" 
                             style="width: 50px; height: 50px; margin-right: 10px;">
                        <span>${player.name} (${player.handicap})</span>
                    </div>
                `;
                groupElement.append(playerHtml);
            });

            courseElement.append(groupElement);
        });

        $foursomesContainer.append(courseElement);
    });

    console.log('Foursomes tab updated.');
}
