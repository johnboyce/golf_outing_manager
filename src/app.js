import { fetchPlayers } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    const players = await fetchPlayers();
    populateTeams(players);
    populatePlayerList(players);

    document.getElementById('mock-draft-btn').addEventListener('click', () => {
        startMockDraft(players);
    });

    document.getElementById('reset-btn').addEventListener('click', resetDraft);
});

function populateTeams(players) {
    const teamJawnSelect = document.getElementById('team-jawn-captain');
    const teamDuckSelect = document.getElementById('team-duck-captain');
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (Handicap: ${player.handicap})`;
        teamJawnSelect.appendChild(option.cloneNode(true));
        teamDuckSelect.appendChild(option.cloneNode(true));
    });
}

function populatePlayerList(players) {
    const playerList = document.getElementById('player-list');
    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${player.name} (Handicap: ${player.handicap})`;
        playerList.appendChild(li);
    });
}

function startMockDraft(players) {
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const teamJawn = [];
    const teamDuck = [];

    shuffledPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
            teamJawn.push(player);
        } else {
            teamDuck.push(player);
        }
    });

    updateTeamLists(teamJawn, teamDuck);
}

function updateTeamLists(teamJawn, teamDuck) {
    const teamJawnList = document.getElementById('team-jawn');
    const teamDuckList = document.getElementById('team-duck');

    teamJawnList.innerHTML = '';
    teamDuckList.innerHTML = '';

    teamJawn.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${player.name} (Handicap: ${player.handicap})`;
        teamJawnList.appendChild(li);
    });

    teamDuck.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${player.name} (Handicap: ${player.handicap})`;
        teamDuckList.appendChild(li);
    });
}

function resetDraft() {
    document.getElementById('team-jawn').innerHTML = '';
    document.getElementById('team-duck').innerHTML = '';
}
