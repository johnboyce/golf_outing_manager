(function () {
    let currentProfileIndex = 0;
    let profileRotationInterval = null;

    // Start Profile Rotation
    function startProfileRotation(players) {
        const profilePanel = document.getElementById('player-profile-display');

        if (!players || players.length === 0) {
            console.error('No players available for profile rotation.');
            profilePanel.innerHTML = `<div class="text-danger">No players available.</div>`;
            return;
        }

        const updateProfile = () => {
            const player = players[currentProfileIndex];
            if (!player) {
                console.error('Invalid player object during profile rotation:', player);
                return;
            }
            profilePanel.innerHTML = `
                <h3>${player.name} (${player.handicap})</h3>
                <img src="${player.profileImage}" alt="${player.name}" class="img-fluid rounded mb-2" style="max-width: 150px;">
                <p>${player.bio}</p>
                <p><strong>Prediction:</strong> ${player.prediction}</p>
            `;
            currentProfileIndex = (currentProfileIndex + 1) % players.length;
        };

        updateProfile();
        profileRotationInterval = setInterval(updateProfile, 6000);
    }

    // Pause Profile Rotation
    function pauseProfileRotation() {
        clearInterval(profileRotationInterval);
        profileRotationInterval = null;
    }

    // Resume Profile Rotation
    function resumeProfileRotation(players) {
        if (!profileRotationInterval) {
            startProfileRotation(players);
        }
    }

    // Fetch Players for Profile Rotation
    function fetchPlayers() {
        console.log('Fetching players for Players Tab...');
        fetch(`${API_GATEWAY_URL}/players`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch players');
                return response.json();
            })
            .then(players => {
                console.log('Players fetched:', players);
                startProfileRotation(players);
            })
            .catch(error => {
                console.error('Error fetching players:', error);
            });
    }

    // Initialize Players Tab
    document.addEventListener('DOMContentLoaded', () => {
        fetchPlayers();

        const pauseButton = document.getElementById('pause-rotation-btn');
        const resumeButton = document.getElementById('resume-rotation-btn');

        if (pauseButton && resumeButton) {
            pauseButton.addEventListener('click', () => {
                pauseProfileRotation();
                pauseButton.disabled = true;
                resumeButton.disabled = false;
            });

            resumeButton.addEventListener('click', () => {
                resumeProfileRotation();
                pauseButton.disabled = false;
                resumeButton.disabled = true;
            });
        }
    });
})();
