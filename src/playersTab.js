$(document).ready(() => {
    initializePlayersTab();
});

let playerProfiles = [];
let currentProfileIndex = 0;
let profileRotationInterval;

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
            playerProfiles = players;
            if (playerProfiles.length > 0) {
                displayPlayerProfile(playerProfiles[currentProfileIndex]);
                startProfileRotation();
            } else {
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
    const $profileDisplay = $('#player-profile-display');
    if (!player) {
        console.error('Invalid player object during profile display:', player);
        return;
    }

    const profileHtml = `
        <h4>${player.name} (${player.nickname})</h4>
        <img src="${player.profileImage}" alt="Profile Image" style="width: 100px; height: 100px;">
        <p>${player.bio}</p>
        <p><strong>Prediction:</strong> ${player.prediction}</p>
    `;

    $profileDisplay.html(profileHtml);
}

// Display No Players Message
function displayNoPlayersMessage() {
    $('#player-profile-display').html('<p class="text-danger">No players available.</p>');
}

// Display Error Message
function displayErrorMessage() {
    $('#player-profile-display').html('<p class="text-danger">Error loading players.</p>');
}

// Profile Rotation
function startProfileRotation() {
    profileRotationInterval = setInterval(() => {
        currentProfileIndex = (currentProfileIndex + 1) % playerProfiles.length;
        displayPlayerProfile(playerProfiles[currentProfileIndex]);
    }, 6000);
}

function pauseProfileRotation() {
    clearInterval(profileRotationInterval);
    $('#pause-rotation-btn').prop('disabled', true);
    $('#resume-rotation-btn').prop('disabled', false);
}

function resumeProfileRotation() {
    startProfileRotation();
    $('#pause-rotation-btn').prop('disabled', false);
    $('#resume-rotation-btn').prop('disabled', true);
}
