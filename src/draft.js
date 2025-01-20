document.addEventListener('DOMContentLoaded', initializeDraftTab);

// Global Variables for Draft
let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentDraftTurn = 'teamOne';
let draftStarted = false;
let teamOneCaptain = null;
let teamTwoCaptain = null;

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch players'))
        .then(players => {
            console.log('Players fetched for draft:', players);
            allPlayers = players;
            populateCaptainSelectors(players);
        })
        .catch(error => console.error('Error fetching players for draft:', error));
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain-selector');
    const teamTwoSelector = document.getElementById('team-two-captain-selector');
    const startDraftButton = document.getElementById('start-draft-btn');

    const createOption = (player) => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (${player.nickname || 'No nickname'})`;
        return option;
    };

    teamOneSelector.innerHTML = '<option value="">Select Captain</option>';
    teamTwoSelector.innerHTML = '<option value="">Select Captain</option>';

    players.forEach(player => {
        teamOneSelector.appendChild(createOption(player));
        teamTwoSelector.appendChild(createOption(player));
    });

    const validateCaptainSelection = () => {
        teamOneCaptain = players.find(p => p.id === teamOneSelector.value);
        teamTwoCaptain = players.find(p => p.id === teamTwoSelector.value);
        startDraftButton.disabled = !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id);
    };

    teamOneSelector.addEventListener('change', validateCaptainSelection);
    teamTwoSelector.addEventListener('change', validateCaptainSelection);

    startDraftButton.disabled = true;
}

// Start Draft
function startDraft() {
    console.log('Draft started!');
    draftStarted = true;

    if (!teamOneCaptain || !teamTwoCaptain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    teamOne = [teamOneCaptain];
    teamTwo = [teamTwoCaptain];

    allPlayers = allPlayers.filter(player => player.id !== teamOneCaptain.id && player.id !== teamTwoCaptain.id);

    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.remove('d-none');

    updateDraftUI();
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);
    if (playerIndex === -1) return console.error('Player not found:', playerId);

    const player = allPlayers.splice(playerIndex, 1)[0]; // Remove from available players

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    updateDraftUI();

    if (teamOne.length + teamTwo.length === allPlayers.length + 2) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    draftStarted = false;
    allPlayers = [...teamOne, ...teamTwo, ...allPlayers]; // Return all players to available
    teamOne = [];
    teamTwo = [];
    teamOneCaptain = null;
    teamTwoCaptain = null;

    populateCaptainSelectors(allPlayers);

    document.getElementById('start-draft-btn').disabled = true;
    document.getElementById('start-draft-btn').classList.remove('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');

    document.getElementById('draft-turn-indicator').innerHTML = '';
}

// Update Draft UI
function updateDraftUI() {
    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');
    const draftTurnIndicator = document.getElementById('draft-turn-indicator');

    const createListItem = (player, team) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${player.name} (${player.handicap})
            ${team ? '' : `<button class="btn btn-sm btn-${team === 'teamOne' ? 'primary' : 'secondary'}" onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
            </button>`}
        </li>
    `;

    availablePlayersList.innerHTML = allPlayers.map(player => createListItem(player)).join('');
    teamOneList.innerHTML = teamOne.map(player => createListItem(player, 'teamOne')).join('');
    teamTwoList.innerHTML = teamTwo.map(player => createListItem(player, 'teamTwo')).join('');

    if (draftStarted) {
        const currentTeamNickname = currentDraftTurn === 'teamOne' ? teamOneCaptain?.nickname || 'Team One' : teamTwoCaptain?.nickname || 'Team Two';
        draftTurnIndicator.innerHTML = `<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`;
    } else {
        draftTurnIndicator.innerHTML = '';
    }
}

// Initialize Draft Tab
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    const startDraftButton = document.getElementById('start-draft-btn');
    const startOverButton = document.getElementById('start-over-btn');

    if (startDraftButton) startDraftButton.addEventListener('click', startDraft);
    if (startOverButton) startOverButton.addEventListener('click', resetDraft);
}
