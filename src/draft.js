import StateManagerInstance from './StateManager.js';

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
                StateManagerInstance.set('playerProfiles', players);
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

        StateManagerInstance.updateDraftData({
            teamOne: { ...StateManagerInstance.get('draftData').teamOne, captain: teamOneCaptain },
            teamTwo: { ...StateManagerInstance.get('draftData').teamTwo, captain: teamTwoCaptain },
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
    const draftData = StateManagerInstance.get('draftData');
    const allPlayers = StateManagerInstance.get('playerProfiles');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    draftData.teamOne.players = [draftData.teamOne.captain];
    draftData.teamTwo.players = [draftData.teamTwo.captain];

    const availablePlayers = allPlayers.filter(
        player => player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    StateManagerInstance.set('playerProfiles', availablePlayers);
    StateManagerInstance.updateDraftData({ draftStarted: true });

    $('#start-draft-btn').addClass('d-none');
    $('#start-over-btn').removeClass('d-none');
    $('#commission-draft-btn').addClass('d-none');

    updateDraftUI();
}

// Update Draft UI
function updateDraftUI() {
    const draftData = StateManagerInstance.get('draftData');
    const availablePlayers = StateManagerInstance.get('playerProfiles');

    const $availablePlayersList = $('#available-players').empty();
    const $teamOneList = $('#team-one').empty();
    const $teamTwoList = $('#team-two').empty();

    $('#team-one-header h3').text(`Team ${draftData.teamOne.captain?.nickname || 'One'}`);
    $('#team-two-header h3').text(`Team ${draftData.teamTwo.captain?.nickname || 'Two'}`);

    availablePlayers.forEach(player => {
        const currentTurn = draftData.currentDraftTurn;
        const buttonClass = currentTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';

        const listItem = $(`
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" >Add to ${currentTurn === 'teamOne' ? 'Team One' : 'Team Two'}</button>
            </li>
        `);

        listItem.find('button').on('click', () => assignPlayerToTeam(player.id, currentTurn));
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
    }

    if (availablePlayers.length === 0) {
        $('#commission-draft-btn').removeClass('d-none');
        $('#draft-turn-indicator').html('<div class="alert alert-success">All players have been drafted!</div>');
    }
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const draftData = StateManagerInstance.get('draftData');
    const allPlayers = StateManagerInstance.get('playerProfiles');
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    const player = allPlayers.splice(playerIndex, 1)[0];
    draftData[team].players.push(player);

    draftData.currentDraftTurn = team === 'teamOne' ? 'teamTwo' : 'teamOne';

    StateManagerInstance.set('playerProfiles', allPlayers);
    StateManagerInstance.set('draftData', draftData);

    updateDraftUI();
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    StateManagerInstance.reset();
    populateCaptainSelectors(StateManagerInstance.get('playerProfiles'));

    $('#start-draft-btn').prop('disabled', true).removeClass('d-none');
    $('#start-over-btn, #commission-draft-btn').addClass('d-none');
    $('#draft-turn-indicator').empty();
    updateDraftUI();
}

// Generate Foursomes
function generateFoursomes() {
    const draftData = StateManagerInstance.get('draftData');
    const allPlayers = [...draftData.teamOne.players, ...draftData.teamTwo.players];
    const courses = StateManagerInstance.get('courses');
    const shuffledPlayers = StateManagerInstance.shuffleArray(allPlayers);

    const groups = courses.reduce((acc, course) => {
        acc[course.name] = [];
        return acc;
    }, {});

    shuffledPlayers.forEach((player, index) => {
        const course = courses[index % courses.length].name;
        groups[course].push(player);
    });

    StateManagerInstance.updateDraftData({ foursomes: groups });
}

// Update Foursomes Tab
function updateFoursomesTab() {
    const draftData = StateManagerInstance.get('draftData');
    const $foursomesContainer = $('#foursomes-container').empty();

    Object.entries(draftData.foursomes).forEach(([course, players]) => {
        const courseGroup = $(`<div class="course-group"><h4>${course}</h4></div>`);

        players.forEach(player => {
            const playerElement = $(`
                <div class="player-item">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" alt="${player.team} Logo" style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `);
            courseGroup.append(playerElement);
        });

        $foursomesContainer.append(courseGroup);
    });
}

// Commission Draft
function commissionDraft() {
    console.log('Commissioning draft...');
    generateFoursomes();
    updateFoursomesTab();
    $('#start-draft-btn, #start-over-btn').addClass('d-none');
    $('#commission-draft-btn').prop('disabled', true).text('Draft Commissioned');
}

export { assignPlayerToTeam, startDraft, resetDraft, commissionDraft };
