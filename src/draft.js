$(document).ready(() => {
    initializeDraftTab();
});

// Global Variables
let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentDraftTurn = 'teamOne';
let draftStarted = false;
let teamOneCaptain = null;
let teamTwoCaptain = null;

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
        .done(response => {
            console.log("Fetching players for draft:" + response);
            // Ensure response is an array
            if (Array.isArray(response)) {
                allPlayers = response;
                populateCaptainSelectors(response);
            } else {
                console.error('Unexpected API response format:', response);
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
    const $availablePlayers = $('#available-players');
    $availablePlayers.html('<p class="text-danger">An error occurred while loading players for the draft. Please try again later.</p>');
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector').html('<option value="">Select Captain</option>');
    const $teamTwoSelector = $('#team-two-captain-selector').html('<option value="">Select Captain</option>');
    const $startDraftButton = $('#start-draft-btn').prop('disabled', true);

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    const validateCaptainSelection = () => {
        teamOneCaptain = players.find(player => player.id === $teamOneSelector.val());
        teamTwoCaptain = players.find(player => player.id === $teamTwoSelector.val());
        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);
}

// Start Draft
function startDraft() {
    draftStarted = true;
    teamOne = [teamOneCaptain];
    teamTwo = [teamTwoCaptain];
    allPlayers = allPlayers.filter(player => player.id !== teamOneCaptain.id && player.id !== teamTwoCaptain.id);

    $('#start-draft-btn').addClass('d-none');
    $('#start-over-btn').removeClass('d-none');
    $('#commission-draft-btn').addClass('d-none');
    updateDraftUI();
}

// Update Draft UI
function updateDraftUI() {
    const $availablePlayersList = $('#available-players').empty();
    const $teamOneList = $('#team-one').empty();
    const $teamTwoList = $('#team-two').empty();

    const $teamOneHeader = $('#team-one-header h3').text(`Team ${teamOneCaptain.nickname}`);
    const $teamTwoHeader = $('#team-two-header h3').text(`Team ${teamTwoCaptain.nickname}`);

    // Additional operations on the headers (if needed)
    $teamOneHeader.css('color', 'blue');
    $teamTwoHeader.css('color', 'red');

    allPlayers.forEach(player => {
        const buttonClass = currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        const listItem = `
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                    Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            </li>
        `;
        $availablePlayersList.append(listItem);
    });

    teamOne.forEach(player => {
        $teamOneList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    teamTwo.forEach(player => {
        $teamTwoList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    if (draftStarted) {
        const currentTeamNickname =
            currentDraftTurn === 'teamOne'
                ? teamOneCaptain?.nickname || 'Team One'
                : teamTwoCaptain?.nickname || 'Team Two';

        $('#draft-turn-indicator').html(`<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`);
    } else {
        $('#draft-turn-indicator').html('');
    }
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    allPlayers = allPlayers.filter(p => p.id !== playerId);
    updateDraftUI();

    if (allPlayers.length === 0) {
        $('#commission-draft-btn').removeClass('d-none');
        $('#draft-turn-indicator').html('<div class="alert alert-success">All players have been assigned!</div>');
    }
}

// Reset Draft
function resetDraft() {
    draftStarted = false;
    allPlayers = [...teamOne, ...teamTwo, ...allPlayers];
    teamOne = [];
    teamTwo = [];
    teamOneCaptain = null;
    teamTwoCaptain = null;
    populateCaptainSelectors(allPlayers);

    $('#start-draft-btn').removeClass('d-none').prop('disabled', true);
    $('#start-over-btn').addClass('d-none');
    $('#commission-draft-btn').addClass('d-none');
    $('#draft-turn-indicator').html('');
}

// Commission Draft
function commissionDraft() {
    console.log('Committing draft and creating foursomes...');
    savedFoursomes = []; // Reset saved foursomes
    const foursomes = [];
    const totalPlayers = Math.max(teamOne.length, teamTwo.length);

    for (let i = 0; i < totalPlayers; i++) {
        const group = [];
        if (teamOne[i]) group.push({ ...teamOne[i], team: 'Team One' });
        if (teamTwo[i]) group.push({ ...teamTwo[i], team: 'Team Two' });
        foursomes.push(group);
    }

    updateFoursomesTab(foursomes);
}

// Update Foursomes Tab
function updateFoursomesTab(foursomes) {
    const $foursomesContainer = $('#foursomes-container').html('');

    foursomes.forEach((group, index) => {
        const groupElement = $('<div class="foursome-group mb-3"></div>');

        groupElement.append(`<h4>Foursome ${index + 1}</h4>`);

        group.forEach(player => {
            const playerHtml = `
                <div class="foursome-player d-flex align-items-center">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                         alt="${player.team} Logo" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `;
            groupElement.append(playerHtml);
        });

        $foursomesContainer.append(groupElement);
    });

    console.log('Foursomes updated:', foursomes);
}
