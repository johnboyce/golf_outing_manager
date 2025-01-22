export const fetchPlayers = async () => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/players`);
        console.log(response);
        if (!response.ok) {
            throw new Error(`Failed to fetch players: ${response.statusText}`);
        }

        const players = await response.json();
        return players.map(player => ({
            id: player.id,
            name: player.name,
            handicap: player.handicap,
            nickname: player.nickname,
            bio: player.bio,
            prediction: player.prediction
        }));
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
};

export const addPlayer = async (playerData) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerData)
        });

        if (!response.ok) {
            throw new Error(`Failed to add player: ${response.statusText}`);
        }

        const response2 = await response.json();
        console.log(response2);
        return ;
    } catch (error) {
        console.error('Error adding player:', error);
        throw error;
    }
};

export const getPlayer = async (playerId) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/players/${playerId}`);
        console.log(response);
        if (!response.ok) {
            throw new Error(`Failed to fetch player: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching player:', error);
        throw error;
    }
};
