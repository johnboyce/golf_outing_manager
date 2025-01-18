import { fetchPlayers } from './data.js';

let currentTurn = 'team-one';

document.addEventListener('DOMContentLoaded', async () => {
    const players = await fetchPlayers();
    setupTeams(players);
    populateAvailablePlayers(players);

    document.getElementById('mock-draft-btn').addEventListener('click', () => {
        startMockDraft(players);
    });

    document.getElementById('reset-btn').addEventListener('click', resetDraft);
});

function setupTeams(players) {
    const teamOneCaptain = players.find(player => player.nickname === 'Jawn');
    const teamTwoCaptain = players.find(player => player.nickname === 'Duck');

    assignPlayerToTeam('team-one', teamOneCaptain);
    assignPlayerToTeam('team-two', teamTwoCaptain);

    document.getElementById('team-one-name').textContent = `Team ${teamOneCaptain.nickname}`;
    document.getElementById('team-two-name').textContent = `Team ${teamTwoCaptain.nickname}`;
}

function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        if (player.nickname !== 'Jawn' && player.nickname !== 'Duck') {
            const li = createDraggablePlayerElement(player);
            availablePlayersList.appendChild(li);
        }
    });
}

function createDraggablePlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${player.name} (Handicap: ${player.handicap})`;
    li.setAttribute('draggable', true);
    li.setAttribute('data-id', player.id);
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-handicap', player.handicap);
    li.setAttribute('data-nickname', player.nickname);
    li.ondragstart = drag;
    return li;
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.outerHTML);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event, targetId) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const playerElement = document.createElement('div');
    playerElement.innerHTML = data;
    const playerLi = playerElement.firstElementChild;

    if (targetId === currentTurn) {
        document.getElementById(targetId).appendChild(playerLi);
        switchTurn();
    }
}

function switchTurn() {
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
    document.getElementById('draft-turn').textContent = currentTurn === 'team-one' ? "Team One's Turn" : "Team Two's Turn";
}

function resetDraft() {
    document.getElementById('team-one').innerHTML = '';
    document.getElementById('team-two').innerHTML = '';
    document.getElementById('available-players').innerHTML = '';
    document.getElementById('draft-turn').textContent = "Team One's Turn";
    currentTurn = 'team-one';
}
