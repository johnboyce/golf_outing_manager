const apiUrl = 'https://4epgafkkhl.execute-api.us-east-1.amazonaws.com'; // Replace with your actual API Gateway URL

// Fetch all players
async function fetchPlayers() {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: 'listPlayers' }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching players: ${response.statusText}`);
        }

        const players = await response.json();
        return players;
    } catch (error) {
        console.error('Error in fetchPlayers:', error);
        return [];
    }
}

// Add a player
async function addPlayer(playerData) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: 'addPlayer', playerData }),
        });

        if (!response.ok) {
            throw new Error(`Error adding player: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error in addPlayer:', error);
    }
}

// Export functions
export { fetchPlayers, addPlayer };
