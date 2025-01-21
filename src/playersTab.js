// Global Variables
let playerProfiles = [];
let currentProfileIndex = 0;
let profileRotationInterval = null;

// Initialize Players Tab
function initializePlayersTab() {
    console.log('Initializing Players Tab...');
    fetchPlayersForPlayersTab();

    $('#pause-rotation-btn').on('click', pauseProfileRotation);
    $('#resume-rotation-btn').on('click', resumeProfileRotation);
}

// Fetch Players for Players Tab
function fetchPlayersForPlayersTab() {
    console.log('Fetching players for Players Tab...');
    $.get(`${API_GATEWAY_URL}/players`)
        .done(players => {
            console.log("Players is :" + players);
            if (Array.isArray(players) && players.length > 0) {
                playerProfiles = players;
                console.log('Players fetched successfully:', players);
                displayPlayerProfile(playerProfiles[currentProfileIndex]);
                startProfileRotation();
            } else {
                console.warn('No players available.');
                displayNoPlayersMessage();
            }
        })
        .fail(error => {
            console.error('Error fetching players:', error);
            displayErrorMessage();
        });
}

// Display Player Profile
function displayPlayerProfile(player) {
    if (!player) {
        console.error('Invalid player object during profile display:', player);
        return;
    }

    const profileHtml = `
        <div class="player-profile">
            <img src="${player.profileImage}" alt="${player.name}" class="player-image">
            <h4>${player.name} (${player.nickname || 'No nickname'})</h4>
            <p>${player.bio}</p>
            <p><strong>Prediction:</strong> ${player.prediction}</p>
        </div>
    `;

    $('#player-profile-display').html(profileHtml);
}

// Display No Players Message
function displayNoPlayersMessage() {
    $('#player-profile-display').html('<p class="text-muted">No players available to display.</p>');
}

// Display Error Message
function displayErrorMessage() {
    $('#player-profile-display').html('<p class="text-danger">An error occurred while loading player data. Please try again later.</p>');
}

// Start Profile Rotation
function startProfileRotation() {
    console.log('Starting profile rotation...');
    profileRotationInterval = setInterval(() => {
        currentProfileIndex = (currentProfileIndex + 1) % playerProfiles.length;
        displayPlayerProfile(playerProfiles[currentProfileIndex]);
    }, 6000);

    $('#pause-rotation-btn').prop('disabled', false);
    $('#resume-rotation-btn').prop('disabled', true);
}

// Pause Profile Rotation
function pauseProfileRotation() {
    console.log('Pausing profile rotation...');
    clearInterval(profileRotationInterval);
    profileRotationInterval = null;

    $('#pause-rotation-btn').prop('disabled', true);
    $('#resume-rotation-btn').prop('disabled', false);
}

// Resume Profile Rotation
function resumeProfileRotation() {
    console.log('Resuming profile rotation...');
    startProfileRotation();
    $('#pause-rotation-btn').prop('disabled', false);
    $('#resume-rotation-btn').prop('disabled', true);
}
