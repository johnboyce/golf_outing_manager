const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let selectedCaptains = { teamOneCaptain: null, teamTwoCaptain: null };
let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access
let teamOne = [];
let teamTwo = [];
let profileRotationInterval = null; // Interval for rotating profiles
let isProfileRotationPaused = false; // Tracks the pause state of rotation

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

        // Start player profile rotation
        startProfileRotation();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Fetch Players from API
async function fetchPlayersFromAPI() {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/players`);
        if (!response.ok) throw new Error(`Failed to fetch players: ${response.statusText}`);
        const players = await response.json();
        console.log("Fetched players:", players); // Debugging log
        return players;
    } catch (error) {
        console.error("Error fetching players:", error);
        return []; // Return an empty array to avoid undefined issues
    }
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
    const profileDisplay = document.getElementById('player-profile-display');
    if (!profileDisplay) return;

    profileDisplay.innerHTML = `
        <img src="" alt="" id="profile-image" class="img-fluid rounded mb-3" />
        <h5 id="profile-name"></h5>
        <p><strong>Nickname:</strong> <span id="profile-nickname"></span></p>
        <p><strong>Handicap:</strong> <span id="profile-handicap"></span></p>
        <p><strong>Bio:</strong> <span id="profile-bio"></span></p>
        <p><strong>Prediction:</strong> <span id="profile-prediction"></span></p>
    `;
}

// Start Player Profile Rotation
function startProfileRotation() {
    const profileDisplay = document.getElementById('player-profile-display');
    if (!allPlayers || allPlayers.length === 0 || !profileDisplay) {
        console.error("No players available for profile rotation."); // Debugging log
        return;
    }

    let currentIndex = 0;

    function updateProfile() {
        if (isProfileRotationPaused) return;

        const player = allPlayers[currentIndex];
        if (!player) {
            console.error("Invalid player object during profile rotation:", player); // Debugging log
            return;
        }

        document.getElementById('profile-image').src = player.profileImage || 'default-profile-image.jpg';
        document.getElementById('profile-name').textContent = player.name || 'Unknown Player';
        document.getElementById('profile-nickname').textContent = player.nickname || 'No Nickname';
        document.getElementById('profile-handicap').textContent = player.handicap || 'N/A';
        document.getElementById('profile-bio').textContent = player.bio || 'No bio available.';
        document.getElementById('profile-prediction').textContent = player.prediction || 'No prediction available.';

        currentIndex = (currentIndex + 1) % allPlayers.length;
    }

    profileRotationInterval = setInterval(updateProfile, 6000); // Rotate every 6 seconds
    updateProfile(); // Immediately display the first profile
}

// Pause Profile Rotation
function pauseProfileRotation() {
    isProfileRotationPaused = true;
    document.getElementById('pause-rotation-btn').disabled = true;
    document.getElementById('resume-rotation-btn').disabled = false;
}

// Resume Profile Rotation
function resumeProfileRotation() {
    isProfileRotationPaused = false;
    document.getElementById('resume-rotation-btn').disabled = true;
    document.getElementById('pause-rotation-btn').disabled = false;
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    teamOneSelector.innerHTML = '';
    teamTwoSelector.innerHTML = '';

    players.forEach(player => {
        const optionOne = new Option(player.name, player.id);
        const optionTwo = new Option(player.name, player.id);

        if (player.name === 'John Boyce') {
            optionOne.selected = true;
            selectedCaptains.teamOneCaptain = player;
        }

        if (player.name === 'Jim Boyce') {
            optionTwo.selected = true;
            selectedCaptains.teamTwoCaptain = player;
        }

        teamOneSelector.add(optionOne);
        teamTwoSelector.add(optionTwo);
    });

    validateCaptainSelection();
}

// Validate Captain Selection
function validateCaptainSelection() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    const selectedTeamOne = teamOneSelector.value;
    const selectedTeamTwo = teamTwoSelector.value;

    Array.from(teamOneSelector.options).forEach(option => option.disabled = false);
    Array.from(teamTwoSelector.options).forEach(option => option.disabled = false);

    if (selectedTeamOne) {
        const option = Array.from(teamTwoSelector.options).find(opt => opt.value === selectedTeamOne);
        if (option) option.disabled = true;
    }

    if (selectedTeamTwo) {
        const option = Array.from(teamOneSelector.options).find(opt => opt.value === selectedTeamTwo);
        if (option) option.disabled = true;
    }

    const startDraftBtn = document.getElementById('start-draft-btn');
    startDraftBtn.disabled = !(selectedTeamOne && selectedTeamTwo && selectedTeamOne !== selectedTeamTwo);
}

// Start Draft
function startDraft() {
    selectedCaptains.teamOneCaptain = allPlayers.find(player => player.id === document.getElementById('team-one-captain').value);
    selectedCaptains.teamTwoCaptain = allPlayers.find(player => player.id === document.getElementById('team-two-captain').value);

    document.getElementById('draft-content').classList.add('d-none');
    document.getElementById('draft-panels').classList.remove('d-none');

    teamOne = [selectedCaptains.teamOneCaptain];
    teamTwo = [selectedCaptains.teamTwoCaptain];

    const availablePlayers = allPlayers.filter(player =>
        player.id !== selectedCaptains.teamOneCaptain.id &&
        player.id !== selectedCaptains.teamTwoCaptain.id
    );

    populateAvailablePlayers(availablePlayers);
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

// Create Player Element
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

// Generate Foursomes
function generateFoursomes() {
    const foursomesList = document.getElementById('foursomes-list');
    foursomesList.innerHTML = '';

    const allPlayersInTeams = [...teamOne, ...teamTwo];

    for (let i = 0; i < allPlayersInTeams.length; i += 4) {
        const foursome = allPlayersInTeams.slice(i, i + 4);
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Foursome ${Math.floor(i / 4) + 1}</h5>
                    <ul>
                        ${foursome.map(player => `<li>${player.name}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        foursomesList.appendChild(col);
    }
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

// Update Draft State
function updateDraftState(state) {
    if (!state) return;

    teamOne = state.teamOne || [];
    teamTwo = state.teamTwo || [];
    allPlayers = state.availablePlayers || [];

    populateAvailablePlayers(allPlayers);
    populateTeamList('team-one', teamOne);
    populateTeamList('team-two', teamTwo);

    showNotification('Draft state updated.');
}

// Show Notification
function showNotification(message) {
    const notificationPanel = document.getElementById('notification-panel');
    const notificationMessage = document.getElementById('notification-message');

    notificationMessage.textContent = message;
    notificationPanel.classList.remove('d-none');

    setTimeout(() => {
        notificationPanel.classList.add('d-none');
    }, 5000); // Hide after 5 seconds
}

// Populate Team List
function populateTeamList(teamId, teamPlayers) {
    const teamList = document.getElementById(teamId);
    teamList.innerHTML = ''; // Clear existing content

    teamPlayers.forEach(player => {
        teamList.appendChild(createPlayerElement(player));
    });
}
