const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let selectedCaptains = { teamOneCaptain: null, teamTwoCaptain: null };
let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access

document.addEventListener('DOMContentLoaded', async () => {
    try {
        allPlayers = await fetchPlayersFromAPI();
        populateCaptainSelectors(allPlayers);
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Fetch Players from API
async function fetchPlayersFromAPI() {
    const response = await fetch(`${API_GATEWAY_URL}/players`);
    if (!response.ok) throw new Error(`Failed to fetch players: ${response.statusText}`);
    return await response.json();
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    players.forEach(player => {
        const optionOne = new Option(player.name, player.id);
        const optionTwo = new Option(player.name, player.id);
        teamOneSelector.add(optionOne);
        teamTwoSelector.add(optionTwo);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('team-one-captain').addEventListener('change', () => validateCaptainSelection());
    document.getElementById('team-two-captain').addEventListener('change', () => validateCaptainSelection());
    document.getElementById('start-draft-btn').addEventListener('click', startDraft);
}

// Validate Captain Selection
function validateCaptainSelection() {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;
    document.getElementById('start-draft-btn').disabled = !(teamOneId && teamTwoId && teamOneId !== teamTwoId);
}

// Start Draft
function startDraft() {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;

    selectedCaptains.teamOneCaptain = allPlayers.find(player => player.id === teamOneId);
    selectedCaptains.teamTwoCaptain = allPlayers.find(player => player.id === teamTwoId);

    setupTeams();
}

// Setup Teams
function setupTeams() {
    document.getElementById('draft-panels').classList.remove('d-none');
    document.getElementById('team-one-name').textContent = `Team ${selectedCaptains.teamOneCaptain.nickname}`;
    document.getElementById('team-two-name').textContent = `Team ${selectedCaptains.teamTwoCaptain.nickname}`;

    assignPlayerToTeam('team-one', selectedCaptains.teamOneCaptain);
    assignPlayerToTeam('team-two', selectedCaptains.teamTwoCaptain);

    populateAvailablePlayers(
        allPlayers.filter(player => ![selectedCaptains.teamOneCaptain.id, selectedCaptains.teamTwoCaptain.id].includes(player.id))
    );
}

// Assign Player to Team
function assignPlayerToTeam(teamId, player) {
    const teamList = document.getElementById(teamId);
    const playerElement = createPlayerElement(player);
    teamList.appendChild(playerElement);
}

// Populate Available Players
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item fade-in';
        li.innerHTML = `
            <div>
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="addPlayerToTeam('${player.id}')">Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}</button>
        `;
        availablePlayersList.appendChild(li);
    });
}

// Add Player to Team
function addPlayerToTeam(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    assignPlayerToTeam(currentTurn, player);
    allPlayers = allPlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(allPlayers);
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
}
