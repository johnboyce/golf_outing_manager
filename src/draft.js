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
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch players for draft');
            return response.json();
        })
        .then(players => {
            console.log('Players fetched for draft:', players);
            allPlayers = players;
            populateCaptainSelectors(players);
        })
        .catch(error => {
            console.error('Error fetching players for draft:', error);
        });
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain-selector');
    const teamTwoSelector = document.getElementById('team-two-captain-selector');
    const startDraftButton = document.getElementById('start-draft-btn');

    teamOneSelector.innerHTML = '<option value="">Select Captain</option>';
    teamTwoSelector.innerHTML = '<option value="">Select Captain</option>';

    players.forEach(player => {
        const optionOne = document.createElement('option');
        const optionTwo = document.createElement('option');

        optionOne.value = player.id;
        optionOne.textContent = `${player.name} (${player.nickname || 'No nickname'})`;
        optionTwo.value = player.id;
        optionTwo.textContent = `${player.name} (${player.nickname || 'No nickname'})`;

        teamOneSelector.appendChild(optionOne);
        teamTwoSelector.appendChild(optionTwo);
    });

    teamOneSelector.addEventListener('change', validateCaptainSelection);
    teamTwoSelector.addEventListener('change', validateCaptainSelection);

    startDraftButton.disabled = true;

    function validateCaptainSelection() {
        const selectedTeamOneCaptainId = teamOneSelector.value;
        const selectedTeamTwoCaptainId = teamTwoSelector.value;

        teamOneCaptain = players.find(player => player.id === selectedTeamOneCaptainId);
        teamTwoCaptain = players.find(player => player.id === selectedTeamTwoCaptainId);

        if (
            teamOneCaptain &&
            teamTwoCaptain &&
            teamOneCaptain.id !== teamTwoCaptain.id
        ) {
            startDraftButton.disabled = false;
        } else {
            startDraftButton.disabled = true;
        }
    }
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

    allPlayers = allPlayers.filter(
        player => player.id !== teamOneCaptain.id && player.id !== teamTwoCaptain.id
    );

    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.remove('d-none');

    updateDraftUI(allPlayers, teamOne, teamTwo, currentDraftTurn);
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) {
        console.error('Player not found:', playerId);
        return;
    }

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else if (team === 'teamTwo') {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    updateDraftUI(allPlayers, teamOne, teamTwo, currentDraftTurn);

    if (teamOne.length + teamTwo.length === allPlayers.length + 2) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    draftStarted = false;
    teamOne = [];
    teamTwo = [];
    allPlayers.push(teamOneCaptain, teamTwoCaptain);
    teamOneCaptain = null;
    teamTwoCaptain = null;

    populateCaptainSelectors(allPlayers);

    document.getElementById('start-draft-btn').disabled = true;
    document.getElementById('start-draft-btn').classList.remove('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');

    const draftTurnIndicator = document.getElementById('draft-turn-indicator');
    draftTurnIndicator.innerHTML = '';
}

// Update Draft UI
function updateDraftUI(players, teamOne, teamTwo, currentDraftTurn) {
    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');
    const draftTurnIndicator = document.getElementById('draft-turn-indicator');

    availablePlayersList.innerHTML = '';
    teamOneList.innerHTML = '';
    teamTwoList.innerHTML = '';

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            ${player.name} (${player.handicap})
            <button class="btn btn-sm ${
            currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary'
        }" onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(listItem);
    });

    teamOne.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamOneList.appendChild(listItem);
    });

    teamTwo.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamTwoList.appendChild(listItem);
    });

    if (draftStarted) {
        const currentTeamNickname =
            currentDraftTurn === 'teamOne'
                ? teamOneCaptain?.nickname || 'Team One'
                : teamTwoCaptain?.nickname || 'Team Two';

        draftTurnIndicator.innerHTML = `
            <div class="alert alert-info">
                It's ${currentTeamNickname}'s turn to draft!
            </div>
        `;
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

    if (startDraftButton) {
        startDraftButton.addEventListener('click', startDraft);
    }
    if (startOverButton) {
        startOverButton.addEventListener('click', resetDraft);
    }
}
