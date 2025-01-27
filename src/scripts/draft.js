$(document).ready(() => {
    initializeDraftTab();
});

function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Fetch players for populating captain selectors
function fetchPlayersForDraft() {
    console.log('Fetching players for draft...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            console.log('Players fetched:', players);
            StateManager.set('playerProfiles', players); // Store players in StateManager
            populateCaptainSelectors(players);
        })
        .fail(() => {
            console.error('Error fetching players for draft.');
            displayErrorMessage();
        });
}

// Populate captain selectors
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

        updateCaptainLogos(teamOneCaptain, teamTwoCaptain);

        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);

    $startDraftButton.prop('disabled', true);
}

function updateCaptainLogos(teamOneCaptain, teamTwoCaptain) {
    const $teamOneLogoContainer = $('#team-one-logo');
    const $teamTwoLogoContainer = $('#team-two-logo');
    const $teamOneLogo = $('#team-one-captain-logo');
    const $teamTwoLogo = $('#team-two-captain-logo');

    if (teamOneCaptain?.teamLogo) {
        $teamOneLogo.attr('src', teamOneCaptain.teamLogo).fadeIn();
        $teamOneLogoContainer.removeClass('d-none');
    } else {
        $teamOneLogoContainer.addClass('d-none');
    }

    if (teamTwoCaptain?.teamLogo) {
        $teamTwoLogo.attr('src', teamTwoCaptain.teamLogo).fadeIn();
        $teamTwoLogoContainer.removeClass('d-none');
    } else {
        $teamTwoLogoContainer.addClass('d-none');
    }
}

// Display error message for fetch failure
function displayErrorMessage() {
    $('#draft-tab').html('<p class="text-danger text-center">Failed to load players. Please try again later.</p>');
}

// Start draft process
function startDraft() {
    console.log('Starting draft...');
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    // Assign captains to their respective teams

    draftData.teamOne.captain.captainsLogo = draftData.teamOne.captain.teamLogo;
    draftData.teamOne.captain.team = "teamOne";
    draftData.teamOne.players = [draftData.teamOne.captain];

    draftData.teamTwo.captain.captainsLogo = draftData.teamTwo.captain.teamLogo;
    draftData.teamTwo.captain.team = "teamTwo";
    draftData.teamTwo.players = [draftData.teamTwo.captain];


    // Remove captains from the available players list
    const availablePlayers = allPlayers.filter(
        player => player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    // Update StateManager with the modified data
    StateManager.set('playerProfiles', availablePlayers);
    StateManager.updateDraftData({ draftStarted: true, currentDraftTurn: 'teamOne' });

    // Update UI
    $('#captain-selection-section').addClass('d-none');
    $('#draft-section').removeClass('d-none');
    $('#start-draft-btn').prop('disabled', true).addClass('d-none');
    $('#start-over-btn').prop('disabled', false).removeClass('d-none');
    updateDraftUI();
}

function updateDraftUI() {
    const draftData = StateManager.get('draftData');
    const availablePlayers = StateManager.get('playerProfiles');

    const $availablePlayersList = $('#available-players-list').empty();
    const $teamOneList = $('#team-one-list').empty();
    const $teamTwoList = $('#team-two-list').empty();

    // Update team headers
    $('#team-one-header').text(`Team ${draftData.teamOne.captain.nickname}`);
    $('#team-two-header').text(`Team ${draftData.teamTwo.captain.nickname}`);

    // Populate available players
    availablePlayers.forEach(player => {
        const buttonClass = draftData.currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        const currentTurn = draftData.currentDraftTurn;
        const team = currentTurn;
        const captainsLogo = draftData.currentDraftTurn === 'teamOne' ? draftData.teamOne.captain.teamLogo : draftData.teamTwo.captain.teamLogo;
        const listItem = `
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${team}', '${captainsLogo}')">
                    Add to ${team === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            </li>
        `;
        $availablePlayersList.append(listItem);
    });

    // Populate team lists
    draftData.teamOne.players.forEach(player => {
        $teamOneList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    draftData.teamTwo.players.forEach(player => {
        $teamTwoList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    // Update turn banner
    if (availablePlayers.length === 0) {
        $('#draft-turn-banner').html('<div class="alert alert-success">All players have been drafted!</div>');
        $('#available-players-list').addClass('d-none');
        $('#commission-draft-btn').prop('disabled', false).removeClass('d-none');
    } else if(draftData.draftStarted){
        const currentTeam = draftData.currentDraftTurn === 'teamOne'
            ? draftData.teamOne.captain.nickname
            : draftData.teamTwo.captain.nickname;
        const currentTeamLogo = draftData.currentDraftTurn === 'teamOne'
            ? draftData.teamOne.captain.teamLogo
            : draftData.teamTwo.captain.teamLogo;

        $('#draft-turn-banner').html(`It's ${currentTeam}'s turn to draft!`);
    } else {
        $('#draft-turn-banner').html('');
        $('#commission-draft-btn').prop('disabled', true).addClass('d-none');
    }
}

function assignPlayerToTeam(playerId, team, captainsLogo) {
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    const player = allPlayers.splice(playerIndex, 1)[0];

    // Assign team name to the player

    player.team = team;
    player.captainsLogo = captainsLogo;


    draftData[team].players.push(player);

    // Alternate draft turn
    draftData.currentDraftTurn = team === 'teamOne' ? 'teamTwo' : 'teamOne';

    StateManager.set('playerProfiles', allPlayers);
    StateManager.set('draftData', draftData);

    updateDraftUI();
}

