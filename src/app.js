const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let allPlayers = [];
let availablePlayers = [];
let teamOne = [];
let teamTwo = [];

// On DOM Loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch players from API
        allPlayers = await fetchPlayersFromAPI();
        availablePlayers = [...allPlayers];

        // Initialize Players Tab
        initializePlayersTab(allPlayers);

        // Initialize Draft Tab
        initializeDraftTab(allPlayers);

        // Start polling for draft updates
        startPolling();
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
        return [];
    }
}

// Start Polling for Real-Time Updates
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
    availablePlayers = state.availablePlayers || [];

    updateDraftUI();
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
