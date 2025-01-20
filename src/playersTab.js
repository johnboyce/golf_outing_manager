let currentIndex = 0; // Global index for profile rotation
let profileRotationInterval = null; // Interval for rotating profiles
let isProfileRotationPaused = false; // Tracks if profile rotation is paused

// Initialize Players Tab
function initializePlayersTab(players) {
    populatePlayersTab(players);
    setupPlayersTabEventListeners();
    startProfileRotation();
}

// Populate Players Tab
function populatePlayersTab(players) {
    const profileDisplay = document.getElementById('player-profile-display');
    if (!profileDisplay) {
        console.error("Player profile display element not found.");
        return;
    }

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
    if (profileRotationInterval) clearInterval(profileRotationInterval);

    profileRotationInterval = setInterval(() => {
        if (!isProfileRotationPaused) updateProfile();
    }, 6000);

    updateProfile(); // Immediately display the first profile
}

// Update Player Profile
function updateProfile() {
    const profileDisplay = document.getElementById('player-profile-display');

    if (!profileDisplay) {
        console.error("Player profile display element not found in the DOM.");
        return;
    }

    if (!allPlayers || allPlayers.length === 0) {
        console.error("No players available for profile rotation.");
        profileDisplay.innerHTML = `
            <p class="text-muted">No players available to display. Please check the data source.</p>
        `;
        return;
    }

    if (currentIndex >= allPlayers.length) {
        console.warn("Current index exceeds available players. Resetting to 0.");
        currentIndex = 0;
    }

    const player = allPlayers[currentIndex];
    if (!player || typeof player !== 'object') {
        console.error(`Invalid player object at index ${currentIndex}:`, player);
        currentIndex = (currentIndex + 1) % allPlayers.length;
        return;
    }

    profileDisplay.innerHTML = `
        <img src="${player.profileImage || 'default-profile-image.jpg'}" 
             alt="${player.name || 'Unknown Player'}" 
             class="img-fluid rounded mb-3" />
        <h5>${player.name || 'Unknown Player'}</h5>
        <p><strong>Nickname:</strong> ${player.nickname || 'No Nickname'}</p>
        <p><strong>Handicap:</strong> ${player.handicap || 'N/A'}</p>
        <p><strong>Bio:</strong> ${player.bio || 'No bio available.'}</p>
        <p><strong>Prediction:</strong> ${player.prediction || 'No prediction available.'}</p>
    `;

    currentIndex = (currentIndex + 1) % allPlayers.length;
}

// Pause/Resume Rotation Buttons
function setupPlayersTabEventListeners() {
    const pauseRotationBtn = document.getElementById('pause-rotation-btn');
    if (pauseRotationBtn) {
        pauseRotationBtn.addEventListener('click', () => {
            isProfileRotationPaused = true;
            pauseRotationBtn.disabled = true;
            const resumeRotationBtn = document.getElementById('resume-rotation-btn');
            if (resumeRotationBtn) resumeRotationBtn.disabled = false;
        });
    }

    const resumeRotationBtn = document.getElementById('resume-rotation-btn');
    if (resumeRotationBtn) {
        resumeRotationBtn.addEventListener('click', () => {
            isProfileRotationPaused = false;
            resumeRotationBtn.disabled = true;
            const pauseRotationBtn = document.getElementById('pause-rotation-btn');
            if (pauseRotationBtn) pauseRotationBtn.disabled = false;
        });
    }
}
