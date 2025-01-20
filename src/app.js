const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let selectedCaptains = { teamOneCaptain: null, teamTwoCaptain: null };
let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access
let teamOne = [];
let teamTwo = [];

// On DOM Loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch players from API
        allPlayers = await fetchPlayersFromAPI();

        // Populate Players Tab
        populatePlayersTab(allPlayers);

        // Populate captain selectors in Draft Tab
        populateCaptainSelectors(allPlayers);

        // Set up event listeners
        setupEventListeners();

        // Start polling for draft updates
        startPolling();
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

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('team-one-captain').addEventListener('change', validateCaptainSelection);
    document.getElementById('team-two-captain').addEventListener('change', validateCaptainSelection);
    document.getElementById('start-draft-btn').addEventListener('click', startDraft);

    // Pause/Resume Player Profile Rotation
    document.getElementById('pause-rotation-btn').addEventListener('click', pauseProfileRotation);
    document.getElementById('resume-rotation-btn').addEventListener('click', resumeProfileRotation);

    // Commission Draft Button
    const commissionDraftBtn = document.getElementById('commission-draft-btn');
    if (commissionDraftBtn) {
        commissionDraftBtn.addEventListener('click', generateFoursomes);
    }
}

// Populate Players Tab
function populatePlayersTab(players) {
    const playersList = document.getElementById('players-list');
    if (playersList) {
        playersList.innerHTML = ''; // Clear previous content

        players.forEach(player => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `
                <div class="card">
                    <img src="${player.profileImage}" class="card-img-top" alt="${player.name}">
                    <div class="card-body">
                        <h5 class="card-title">${player.name} (${player.nickname})</h5>
                        <p class="card-text"><strong>Handicap:</strong> ${player.handicap}</p>
                        <button class="btn btn-primary btn-sm" onclick="showPlayerProfile('${player.id}')">View Profile</button>
                    </div>
                </div>
            `;
            playersList.appendChild(col);
        });
    }
}

// Show Player Profile
function showPlayerProfile(playerId) {
    const player = allPlayers.find(p => p.id === playerId);

    if (player) {
        const modal = new bootstrap.Modal(document.getElementById('playerProfileModal'));
        document.getElementById('profile-modal-body').innerHTML = `
            <img src="${player.profileImage}" alt="${player.name}" class="img-fluid rounded mb-3">
            <h5>${player.name} (${player.nickname})</h5>
            <p><strong>Handicap:</strong> ${player.handicap}</p>
            <p><strong>Bio:</strong> ${player.bio}</p>
            <p><strong>Prediction:</strong> ${player.prediction}</p>
        `;
        modal.show();
    }
}

// Validate Captain Selection
function validateCaptainSelection() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');
    const selectedTeamOne = teamOneSelector.value;
    const selectedTeamTwo = teamTwoSelector.value;

    // Reset disabled options
    Array.from(teamOneSelector.options).forEach(opt => (opt.disabled = false));
    Array.from(teamTwoSelector.options).forEach(opt => (opt.disabled = false));

    // Disable already selected captain in the other selector
    if (selectedTeamOne) {
        const option = Array.from(teamTwoSelector.options).find(opt => opt.value === selectedTeamOne);
        if (option) option.disabled = true;
    }

    if (selectedTeamTwo) {
        const option = Array.from(teamOneSelector.options).find(opt => opt.value === selectedTeamTwo);
        if (option) option.disabled = true;
    }

    // Enable "Start Draft" button only if valid selections exist
    const startDraftBtn = document.getElementById('start-draft-btn');
    startDraftBtn.disabled = !(selectedTeamOne && selectedTeamTwo && selectedTeamOne !== selectedTeamTwo);
}

// Start Draft
function startDraft() {
    selectedCaptains.teamOneCaptain = allPlayers.find(player => player.id === document.getElementById('team-one-captain').value);
    selectedCaptains.teamTwoCaptain = allPlayers.find(player => player.id === document.getElementById('team-two-captain').value);

    // Hide captain selection and show draft panels
    document.getElementById('draft-content').classList.add('d-none');
    document.getElementById('draft-panels').classList.remove('d-none');

    // Initialize teams with their captains
    teamOne = [selectedCaptains.teamOneCaptain];
    teamTwo = [selectedCaptains.teamTwoCaptain];

    // Populate the available players
    populateAvailablePlayers(
        allPlayers.filter(player => ![selectedCaptains.teamOneCaptain.id, selectedCaptains.teamTwoCaptain.id].includes(player.id))
    );
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
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-${currentTurn === 'team-one' ? 'primary' : 'success'}" onclick="addPlayerToTeam('${player.id}')">
                Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(li);
    });
}

// Add Player to Team
function addPlayerToTeam(playerId) {
    const player = allPlayers.find(p => p.id === playerId);

    if (currentTurn === 'team-one') {
        teamOne.push(player);
        document.getElementById('team-one').appendChild(createPlayerElement(player));
    } else {
        teamTwo.push(player);
        document.getElementById('team-two').appendChild(createPlayerElement(player));
    }

    allPlayers = allPlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(allPlayers);

    if (allPlayers.length === 0) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }

    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
}

// Create Player Element for Draft Panels
function createPlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
    li.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2">
            <span>${player.name} (${player.handicap})</span>
        </div>
    `;
    return li;
}

// Start Polling
function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch(`${API_GATEWAY_URL}/draft-state`);
            if (response.ok) {
                const state = await response.json();
                updateDraftState(state);
            }
        } catch (error) {
            console.error('Error fetching draft state:', error);
        }
    }, 3000); // Poll every 3 seconds
}
