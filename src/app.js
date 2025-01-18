import { fetchPlayers } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const players = await fetchPlayers();
        console.log('Fetched players:', players); // Debug log
        setupTeams(players);
        populateAvailablePlayers(players);

        // Event listener for the mock draft button
        document.getElementById('mock-draft-btn').addEventListener('click', () => {
            startMockDraft(players);
        });

        // Event listener for the reset button
        document.getElementById('reset-btn').addEventListener('click', resetDraft);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Sets up the initial team captains and names
function setupTeams(players) {
    const teamOneCaptain = players.find(player => player.nickname === 'Jawn');
    const teamTwoCaptain = players.find(player => player.nickname === 'Duck');

    assignPlayerToTeam('team-one', teamOneCaptain);
    assignPlayerToTeam('team-two', teamTwoCaptain);

    document.getElementById('team-one-name').textContent = `Team ${teamOneCaptain.nickname}`;
    document.getElementById('team-two-name').textContent = `Team ${teamTwoCaptain.nickname}`;
}

// Populates the list of available players
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = ''; // Clear existing players

    players.forEach(player => {
        if (player.nickname !== 'Jawn' && player.nickname !== 'Duck') {
            const li = createDraggablePlayerElement(player);
            availablePlayersList.appendChild(li);
        }
    });
}

// Creates a draggable list item for a player
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

// Assigns a player to a team
function assignPlayerToTeam(teamId, player) {
    const teamList = document.getElementById(teamId);
    const playerElement = createDraggablePlayerElement(player);
    teamList.appendChild(playerElement);
}

// Drag and drop event handlers
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

    const targetList = document.getElementById(targetId);
    if (targetId.startsWith('team')) {
        targetList.appendChild(playerLi);
        switchTurn();
    } else {
        document.getElementById('available-players').appendChild(playerLi);
    }
}

// Handles turn switching between teams
let currentTurn = 'team-one';
function switchTurn() {
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
    document.getElementById('draft-turn').textContent = currentTurn === 'team-one' ? "Team One's Turn" : "Team Two's Turn";
}

// Resets the draft
function resetDraft() {
    document.getElementById('team-one').innerHTML = '';
    document.getElementById('team-two').innerHTML = '';
    document.getElementById('available-players').innerHTML = '';
    document.getElementById('draft-turn').textContent = "Team One's Turn";
    currentTurn = 'team-one';
}
