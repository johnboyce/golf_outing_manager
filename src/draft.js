document.addEventListener('DOMContentLoaded', initializeDraftTab);

// Global Variables for Draft
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

    const startDraftButton = document.getElementById('start-draft-btn');
    const startOverButton = document.getElementById('start-over-btn');
    const commissionDraftButton = document.getElementById('commission-draft-btn');

    if (startDraftButton) startDraftButton.addEventListener('click', startDraft);
    if (startOverButton) startOverButton.addEventListener('click', resetDraft);
    if (commissionDraftButton) commissionDraftButton.addEventListener('click', commissionDraft);
}

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch players');
            return response.json();
        })
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

    if (!teamOneSelector || !teamTwoSelector) {
        console.error('Captain selectors not found in the DOM.');
        return;
    }

    teamOneSelector.innerHTML = '<option value="">Select Captain</option>';
    teamTwoSelector.innerHTML = '<option value="">Select Captain</option>';

    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (${player.nickname || 'No nickname'})`;

        teamOneSelector.appendChild(option.cloneNode(true));
        teamTwoSelector.appendChild(option.cloneNode(true));
    });

    const validateCaptainSelection = () => {
        teamOneCaptain = players.find(player => player.id === teamOneSelector.value);
        teamTwoCaptain = players.find(player => player.id === teamTwoSelector.value);

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
    document.getElementById('commission-draft-btn').classList.add('d-none');

    updateDraftUI();
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);
    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    const player = allPlayers.splice(playerIndex, 1)[0];

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    updateDraftUI();

    if (allPlayers.length === 0) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
        document.getElementById('draft-turn-indicator').innerHTML =
            '<div class="alert alert-success">All players have been assigned!</div>';
    }
}

// Commission Draft
function commissionDraft() {
    console.log('Committing draft and creating foursomes...');

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

// The rest of the functions remain unchanged
