const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let selectedCaptains = { teamOneCaptain: null, teamTwoCaptain: null };
let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch players from the API
        allPlayers = await fetchPlayersFromAPI();

        // Populate captain selectors
        populateCaptainSelectors(allPlayers);

        // Set up event listeners for interactivity
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
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');
    const startDraftBtn = document.getElementById('start-draft-btn');

    // Ensure captains cannot select the same player
    teamOneSelector.addEventListener('change', () => handleCaptainSelection('team-one-captain', 'team-two-captain'));
    teamTwoSelector.addEventListener('change', () => handleCaptainSelection('team-two-captain', 'team-one-captain'));

    // Start the draft process
    startDraftBtn.addEventListener('click', startDraft);
}

// Handle Captain Selection Logic
function handleCaptainSelection(changedSelectorId, otherSelectorId) {
    const changedSelector = document.getElementById(changedSelectorId);
    const otherSelector = document.getElementById(otherSelectorId);

    const selectedId = changedSelector.value;

    // Reset all options in the other selector
    Array.from(otherSelector.options).forEach(option => (option.disabled = false));

    // Disable the selected captain in the other selector
    if (selectedId) {
        const optionToDisable = Array.from(otherSelector.options).find(option => option.value === selectedId);
        if (optionToDisable) optionToDisable.disabled = true;
    }

    validateCaptainSelection();
}

// Validate Captain Selection
function validateCaptainSelection() {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;
    const startDraftBtn = document.getElementById('start-draft-btn');

    // Enable Start Draft button only if captains are unique and selected
    startDraftBtn.disabled = !(teamOneId && teamTwoId && teamOneId !== teamTwoId);
}

// Start Draft
function startDraft() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    // Identify selected captains
    selectedCaptains.teamOneCaptain = allPlayers.find(player => player.id === teamOneSelector.value);
    selectedCaptains.teamTwoCaptain = allPlayers.find(player => player.id === teamTwoSelector.value);

    // Transition to the draft panels
    setupTeams();
}

// Setup Teams
function setupTeams() {
    const draftPanels = document.getElementById('draft-panels');
    const teamOneName = document.getElementById('team-one-name');
    const teamTwoName = document.getElementById('team-two-name');

    // Update team names
    teamOneName.textContent = `Team ${selectedCaptains.teamOneCaptain.nickname}`;
    teamTwoName.textContent = `Team ${selectedCaptains.teamTwoCaptain.nickname}`;

    // Ensure the draft panel is visible
    draftPanels.classList.remove('d-none');

    // Assign captains to their respective teams
    assignPlayerToTeam('team-one', selectedCaptains.teamOneCaptain);
    assignPlayerToTeam('team-two', selectedCaptains.teamTwoCaptain);

    // Populate the available players list
    populateAvailablePlayers(
        allPlayers.filter(player => ![selectedCaptains.teamOneCaptain.id, selectedCaptains.teamTwoCaptain.id].includes(player.id))
    );
}

// Assign Player to Team
function assignPlayerToTeam(teamId, player) {
    const teamList = document.getElementById(teamId);
    const playerElement = createPlayerElement(player);

    // Add fade-in animation
    playerElement.classList.add('fade-in');
    teamList.appendChild(playerElement);
}

// Populate Available Players
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onmouseover="updatePlayerInfo('${player.id}')">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-${currentTurn === 'team-one' ? 'primary' : 'success'}" onclick="addPlayerToTeam('${player.id}', this)">
                Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(li);
    });
}

// Add Player to Team
function addPlayerToTeam(playerId, buttonElement) {
    const player = allPlayers.find(p => p.id === playerId);

    // Assign the player to the current team
    if (currentTurn === 'team-one') {
        assignPlayerToTeam('team-one', player);
    } else {
        assignPlayerToTeam('team-two', player);
    }

    // Disable the button after the player is added
    buttonElement.disabled = true;

    // Update available players and switch turn
    allPlayers = allPlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(allPlayers);
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
}

// Update Player Info Panel
function updatePlayerInfo(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    const playerInfoPanel = document.getElementById('player-info-panel');

    if (player) {
        playerInfoPanel.innerHTML = `
            <img src="${player.profileImage}" alt="${player.name}">
            <h5>${player.name} (${player.nickname})</h5>
            <p><strong>Handicap:</strong> ${player.handicap}</p>
            <p><strong>Bio:</strong> ${player.bio}</p>
            <p><strong>Prediction:</strong> ${player.prediction}</p>
        `;
    }
}
