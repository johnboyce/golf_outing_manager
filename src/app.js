import { fetchPlayers, addPlayer } from './data.js';

// Populate player list
async function populatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = ''; // Clear existing content

    const players = await fetchPlayers();
    players.forEach((player) => {
        const playerItem = document.createElement('li');
        playerItem.className = 'list-group-item';
        playerItem.textContent = `${player.name} (Handicap: ${player.handicap})`;
        playerList.appendChild(playerItem);
    });
}

// Handle add player form submission
document.getElementById('add-player-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const playerName = document.getElementById('player-name').value;
    const playerHandicap = document.getElementById('player-handicap').value;

    if (playerName && playerHandicap) {
        await addPlayer({ name: playerName, handicap: parseInt(playerHandicap, 10) });
        await populatePlayerList(); // Refresh player list
    }
});

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    populatePlayerList();
});
