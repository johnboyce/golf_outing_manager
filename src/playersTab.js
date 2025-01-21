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
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            // Log the response
            console.log(JSON.stringify(players, null, 2));
            console.log('Raw API response:', players);

            // Debug the type of the response
            console.log('Type of players:', typeof players);
            console.log('Is players an array?', Array.isArray(players));

            if (Array.isArray(players)) {
                if (players.length > 0) {
                    playerProfiles = players;
                    console.log('Players fetched successfully:', playerProfiles);
                    displayPlayerProfile(playerProfiles[currentProfileIndex]);
                    startProfileRotation();
                } else {
                    console.warn('No players available.');
                    displayNoPlayersMessage();
                }
            } else if (typeof players === 'string') {
                try {
                    const parsedPlayers = JSON.parse(players);
                    if (Array.isArray(parsedPlayers)) {
                        console.log('Parsed players array:', parsedPlayers);
                        playerProfiles = players;
                        console.log('Players fetched successfully:', playerProfiles);
                        displayPlayerProfile(playerProfiles[currentProfileIndex]);
                        startProfileRotation();
                    } else {
                        console.error('Parsed response is not an array:', parsedPlayers);
                    }
                } catch (error) {
                    console.error('Error parsing string response as JSON:', error);
                }
            } else {
                console.error('Unexpected API response format:', players);
                displayErrorMessage();
            }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error(`Error fetching players: ${textStatus}`, errorThrown);
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
