// Global Variables for Draft
let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentTurn = 'teamOne';

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
            initializeDraft(players);
        })
        .catch(error => {
            console.error('Error fetching players for draft:', error);
        });
}

// Initialize Draft
function initializeDraft(players) {
    allPlayers = players;

    const captainOne = allPlayers.find(player => player.name === 'John Boyce');
    const captainTwo = allPlayers.find(player => player.name === 'Jim Boyce');

    if (captainOne) teamOne.push(captainOne);
    if (captainTwo) teamTwo.push(captainTwo);

    allPlayers = allPlayers.filter(player => player !== captainOne && player !== captainTwo);

    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);
}

// Update Draft UI
function updateDraftUI(players, teamOne, teamTwo, currentTurn) {
    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');
    const draftTurnIndicator = document.getElementById('draft-turn-indicator');

    availablePlayersList.innerHTML = '';
    teamOneList.innerHTML = '';
    teamTwoList.innerHTML = '';

    // Populate available players
    players.forEach(player => {
        if (!teamOne.includes(player) && !teamTwo.includes(player)) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${player.name} (${player.handicap})
                <button class="btn btn-sm ${
                currentTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary'
            }" onclick="assignPlayerToTeam('${player.id}', '${currentTurn}')">
                    Add to ${currentTurn === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            `;
            availablePlayersList.appendChild(listItem);
        }
    });

    // Populate Team One
    teamOne.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamOneList.appendChild(listItem);
    });

    // Populate Team Two
    teamTwo.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamTwoList.appendChild(listItem);
    });

    // Update draft turn indicator
    draftTurnIndicator.innerHTML = `
        <div class="alert alert-info">
            It's ${currentTurn === 'teamOne' ? 'Team One' : 'Team Two'}'s turn to draft!
        </div>
    `;
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
        currentTurn = 'teamTwo';
    } else if (team === 'teamTwo') {
        teamTwo.push(player);
        currentTurn = 'teamOne';
    }

    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);

    if (teamOne.length + teamTwo.length === allPlayers.length + 2) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }
}

// Start Draft
function startDraft() {
    console.log('Draft started!');
    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.remove('d-none');
    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    teamOne = [];
    teamTwo = [];
    initializeDraft(allPlayers);
    document.getElementById('start-draft-btn').classList.remove('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');
}

// Initialize Draft Tab
document.addEventListener('DOMContentLoaded', () => {
    fetchPlayersForDraft();

    const startDraftButton = document.getElementById('start-draft-btn');
    const startOverButton = document.getElementById('start-over-btn');

    if (startDraftButton) {
        startDraftButton.addEventListener('click', startDraft);
    }
    if (startOverButton) {
        startOverButton.addEventListener('click', resetDraft);
    }
});
