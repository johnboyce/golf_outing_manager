$(document).ready(() => {
    initializePlayersTab();
});

function initializePlayersTab() {
    console.log('Initializing Players Tab...');

    fetchPlayersForPlayersTab()
        .then((players) => {
            StateManager.set('playerProfiles', players);
            startProfileRotation(players);
        })
        .catch((error) => {
            console.error('Error fetching players:', error);
            displayErrorMessage();
        });
}

// Fetch Players for Players Tab
function fetchPlayersForPlayersTab() {
    return $.getJSON(`${API_GATEWAY_URL}/players`)
        .done((response) => {
            console.log('Players fetched successfully:', response);
            if (Array.isArray(response)) {
                return response;
            } else {
                throw new Error('Unexpected API response format.');
            }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error(`Error fetching players: ${textStatus}`, errorThrown);
            throw errorThrown;
        });
}

// Start Profile Rotation
function startProfileRotation(players) {
    let currentProfileIndex = 0;
    const $profileDisplay = $('#player-profile-display');

    function updateProfile() {
        if (players.length === 0) {
            $profileDisplay.html('<p>No players available.</p>');
            return;
        }

        const player = players[currentProfileIndex];
        $profileDisplay.html(`
            <div class="profile-card">
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image">
                <h3>${player.name} (${player.nickname || 'No nickname'})</h3>
                <p>${player.bio}</p>
                <p><strong>Prediction:</strong> ${player.prediction}</p>
            </div>
        `);

        currentProfileIndex = (currentProfileIndex + 1) % players.length;
    }

    updateProfile();
    setInterval(updateProfile, 6000); // Rotate every 6 seconds
}

// Display Error Message
function displayErrorMessage() {
    $('#player-profile-display').html('<p class="text-danger">An error occurred while loading player profiles.</p>');
}
