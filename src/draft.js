// Global Variables for Draft
const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentTurn = 'teamOne';

// Fetch Players and Initialize Draft
function fetchPlayers() {
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => response.json())
        .then(data => {
            initializeDraft(data);
        })
        .catch(error => {
            console.error('Error fetching players:', error);
        });
}

// Initialize Draft
function initializeDraft(players) {
    allPlayers = players;

    // Pre-select captains
    const captainOne = allPlayers.find(player => player.name === 'John Boyce');
    const captainTwo = allPlayers.find(player => player.name === 'Jim Boyce');

    if (captainOne) teamOne.push(captainOne);
    if (captainTwo) teamTwo.push(captainTwo);

    // Remove captains from available players
    allPlayers = allPlayers.filter(player => player !== captainOne && player !== captainTwo);

    // Initialize Draft UI
    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);
}

// Update Draft UI
function updateDraftUI(players, teamOne, teamTwo, currentTurn) {
    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');
    const draftTurnIndicator = document.getElementById('draft-turn-indicator');

    if (!availablePlayersList || !teamOneList || !teamTwoList || !draftTurnIndicator) {
        console.error("Draft UI elements not found.");
        return;
    }

    // Clear the lists
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
        console.error("Player not found:", playerId);
        return;
    }

    if (team === 'teamOne') {
        teamOne.push(player);
        currentTurn = 'teamTwo'; // Switch turn
    } else if (team === 'teamTwo') {
        teamTwo.push(player);
        currentTurn = 'teamOne'; // Switch turn
    } else {
        console.error("Invalid team:", team);
        return;
    }

    // Update the draft UI
    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);
}

// Start Draft
function startDraft() {
    console.log('Draft started!');
    updateDraftUI(allPlayers, teamOne, teamTwo, currentTurn);
}

// Set up event listeners for the draft tab
document.getElementById('start-draft-btn').addEventListener('click', startDraft);
document.addEventListener('DOMContentLoaded', fetchPlayers);
