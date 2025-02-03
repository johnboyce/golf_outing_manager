$(document).ready(() => {
    initializeDraftTab();
});

/** ========================== INITIALIZATION ========================== **/

function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
    $('#commission-draft-btn').on('click', commissionDraft);
    $('#start-over-btn').on('click', resetDraft);
}

function resetDropdown($dropdown) {
    $dropdown.empty().append('<option value="">Select Captain</option>');
}

/** ========================== DATA FETCHING & STATE MANAGEMENT ========================== **/

function fetchPlayersForDraft() {
    console.log('Fetching players for draft...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            console.log('Players fetched:', players);

            // Store the original player list before modifications
            StateManager.set("originalPlayerProfiles", [...players]);

            // Also store in playerProfiles for in-draft modifications
            StateManager.set('playerProfiles', [...players]);

            populateCaptainSelectors(players);
        })
        .fail(() => {
            console.error('Error fetching players for draft.');
            displayErrorMessage();
        });
}

function initializeDraftData(teamOneCaptain = null, teamTwoCaptain = null) {
    return {
        teamOne: { captain: teamOneCaptain, players: [] },
        teamTwo: { captain: teamTwoCaptain, players: [] },
        draftStarted: false,
        currentDraftTurn: "teamOne"
    };
}

function resetDraft() {
    console.log("Resetting the draft...");

    const originalPlayers = StateManager.get("originalPlayerProfiles");
    if (!originalPlayers || originalPlayers.length === 0) {
        console.error("Original player list not found. Resetting might be incomplete.");
        return;
    }

    const teamOneCaptain = StateManager.get('draftData').teamOne.captain;
    const teamTwoCaptain = StateManager.get('draftData').teamTwo.captain;

    const restoredPlayers = originalPlayers.filter(player =>
        player.id !== teamOneCaptain?.id && player.id !== teamTwoCaptain?.id
    );

    StateManager.set('draftData', initializeDraftData(teamOneCaptain, teamTwoCaptain));
    StateManager.set('playerProfiles', restoredPlayers);

    updateUIAfterReset();
}

/** ========================== DRAFT LOGIC ========================== **/

function startDraft() {
    console.log('Starting draft...');
    const draftData = StateManager.get('draftData');
    let allPlayers = StateManager.get('playerProfiles');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    // Store original players if not already stored
    if (!StateManager.get("originalPlayerProfiles") || StateManager.get("originalPlayerProfiles").length === 0) {
        StateManager.set("originalPlayerProfiles", [...allPlayers]);
    }

    // Assign captains to teams
    draftData.teamOne.players = [assignCaptain(draftData.teamOne.captain, "teamOne")];
    draftData.teamTwo.players = [assignCaptain(draftData.teamTwo.captain, "teamTwo")];

    // Remove captains from available players
    const availablePlayers = allPlayers.filter(
        player => player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    StateManager.set('playerProfiles', availablePlayers);
    StateManager.updateDraftData({ draftStarted: true, currentDraftTurn: 'teamOne' });

    updateUIAfterDraftStart();
}

/** ========================== PLAYER ASSIGNMENT ========================== **/
function updateCaptainLogos(teamOneCaptain, teamTwoCaptain) {
    const $teamOneLogoContainer = $('#team-one-logo');
    const $teamTwoLogoContainer = $('#team-two-logo');
    const $teamOneLogo = $('#team-one-captain-logo');
    const $teamTwoLogo = $('#team-two-captain-logo');

    // ✅ Update Team One Captain's Logo
    if (teamOneCaptain?.teamLogo) {
        $teamOneLogo.attr('src', teamOneCaptain.teamLogo).fadeIn();
        $teamOneLogoContainer.removeClass('d-none');
    } else {
        $teamOneLogoContainer.addClass('d-none');
    }

    // ✅ Update Team Two Captain's Logo
    if (teamTwoCaptain?.teamLogo) {
        $teamTwoLogo.attr('src', teamTwoCaptain.teamLogo).fadeIn();
        $teamTwoLogoContainer.removeClass('d-none');
    } else {
        $teamTwoLogoContainer.addClass('d-none');
    }
}

function assignPlayerToTeam(playerId, team) {
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    const player = allPlayers.splice(playerIndex, 1)[0];
    player.team = team;

    draftData[team].players.push(player);

    // Alternate draft turn
    draftData.currentDraftTurn = team === 'teamOne' ? 'teamTwo' : 'teamOne';

    StateManager.set('playerProfiles', allPlayers);
    StateManager.set('draftData', draftData);

    updateDraftUI();
}

/** ========================== CAPTAIN SELECTION & ASSIGNMENT ========================== **/

function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector');
    const $teamTwoSelector = $('#team-two-captain-selector');
    const $startDraftButton = $('#start-draft-btn');

    resetDropdown($teamOneSelector);
    resetDropdown($teamTwoSelector);

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    $teamOneSelector.on('change', () => validateCaptainSelection(players, $teamOneSelector, $teamTwoSelector, $startDraftButton));
    $teamTwoSelector.on('change', () => validateCaptainSelection(players, $teamOneSelector, $teamTwoSelector, $startDraftButton));

    $startDraftButton.prop('disabled', true);
}

function validateCaptainSelection(players, $teamOneSelector, $teamTwoSelector, $startDraftButton) {
    const teamOneCaptain = players.find(player => player.id === $teamOneSelector.val());
    const teamTwoCaptain = players.find(player => player.id === $teamTwoSelector.val());

    StateManager.updateDraftData({
        teamOne: { ...StateManager.get('draftData').teamOne, captain: teamOneCaptain },
        teamTwo: { ...StateManager.get('draftData').teamTwo, captain: teamTwoCaptain },
    });

    updateCaptainLogos(teamOneCaptain, teamTwoCaptain);

    $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
}

function assignCaptain(captain, team) {
    return { ...captain, captainsLogo: captain.teamLogo, team };
}

/** ========================== UI UPDATES ========================== **/

function updateUIAfterDraftStart() {
    $('#captain-selection-section').addClass('d-none');
    $('#draft-section').removeClass('d-none');
    $('#start-draft-btn').prop('disabled', true).addClass('d-none');
    $('#start-over-btn').prop('disabled', false).removeClass('d-none');
    updateDraftUI();
}

function updateUIAfterReset() {
    $('#captain-selection-section').removeClass('d-none');
    $('#draft-section').addClass('d-none');
    $('#start-draft-btn').prop('disabled', false).removeClass('d-none');
    $('#start-over-btn').prop('disabled', true).addClass('d-none');
    $('#commission-draft-btn').prop('disabled', true).addClass('d-none');
    updateDraftUI();
}

function updateDraftUI() {
    const draftData = StateManager.get('draftData');
    const availablePlayers = StateManager.get('playerProfiles');

    updateTeamHeaders(draftData);
    updateAvailablePlayersList(availablePlayers, draftData.currentDraftTurn);
    updateTeamLists(draftData.teamOne.players, draftData.teamTwo.players);

    toggleCommissionDraftButton(availablePlayers.length === 0);
}

function updateTeamHeaders(draftData) {
    $('#team-one-header').text(`Team ${draftData.teamOne.captain.nickname}`);
    $('#team-two-header').text(`Team ${draftData.teamTwo.captain.nickname}`);
}

function updateAvailablePlayersList(players, currentTurn) {
    const $availablePlayersList = $('#available-players-list').empty();

    players.forEach(player => {
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
}

function updateTeamLists(teamOnePlayers, teamTwoPlayers) {
    $('#team-one-list').empty().append(teamOnePlayers.map(player => `<li class="list-group-item">${player.name} (${player.handicap})</li>`));
    $('#team-two-list').empty().append(teamTwoPlayers.map(player => `<li class="list-group-item">${player.name} (${player.handicap})</li>`));
}

function toggleCommissionDraftButton(isEnabled) {
    $('#commission-draft-btn').prop('disabled', !isEnabled).toggleClass('d-none', !isEnabled);
}
