import { fetchPlayers } from './data.js';

let selectedCaptains = {
    teamOneCaptain: null,
    teamTwoCaptain: null
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const players = await fetchPlayers();
        console.log('Fetched players:', players);

        populateCaptainSelectors(players);

        document.getElementById('select-captains-btn').addEventListener('click', () => {
            selectCaptains(players);
        });

        document.getElementById('reset-btn').addEventListener('click', resetDraft);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Populates the dropdowns for selecting captains
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    players.forEach(player => {
        const optionOne = new Option(player.name, player.id);
        const optionTwo = new Option(player.name, player.id);

        teamOneSelector.add(optionOne);
        teamTwoSelector.add(optionTwo);
    });
}

// Handles captain selection and team initialization
function selectCaptains(players) {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;

    if (!teamOneId || !teamTwoId || teamOneId === teamTwoId) {
        alert('Please select two different captains.');
        return;
    }

    selectedCaptains.teamOneCaptain = players.find(player => player.id === teamOneId);
    selectedCaptains.teamTwoCaptain = players.find(player => player.id === teamTwoId);

    setupTeams(players);
}

// Sets up teams with captains and displays the team panels
function setupTeams(players) {
    const teamOneName = `Team ${selectedCaptains.teamOneCaptain.nickname}`;
    const teamTwoName = `Team ${selectedCaptains.teamTwoCaptain.nickname}`;

    document.getElementById('team-one-name').textContent = teamOneName;
    document.getElementById('team-two-name').textContent = teamTwoName;

    assignPlayerToTeam('team-one', selectedCaptains.teamOneCaptain);
    assignPlayerToTeam('team-two', selectedCaptains.teamTwoCaptain);

    populateAvailablePlayers(players.filter(player =>
        player.id !== selectedCaptains.teamOneCaptain.id &&
        player.id !== selectedCaptains.teamTwoCaptain.id
    ));

    document.getElementById('draft-results').classList.remove('d-none');
}

// Populates the available players list
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = createDraggablePlayerElement(player);
        availablePlayersList.appendChild(li);
    });
}

// Creates a draggable player element
function createDraggablePlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${player.name} (Handicap: ${player.handicap})`;
    li.setAttribute('draggable', true);
    li.setAttribute('data-id', player.id);
    li.ondragstart = drag;
    return li;
}

// Assigns a player to a team
function assignPlayerToTeam(teamId, player) {
    const teamList = document.getElementById(teamId);
    const playerElement = createDraggablePlayerElement(player);
    teamList.appendChild(playerElement);
}

// Drag-and-Drop Handlers
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
    const availablePlayersList = document.getElementById('available-players');

    // Remove from available players and add to team
    availablePlayersList.removeChild(document.querySelector(`[data-id='${playerLi.getAttribute('data-id')}']`));
    document.getElementById(targetId).appendChild(playerLi);
}

// Resets the draft
function resetDraft() {
    selectedCaptains = { teamOneCaptain: null, teamTwoCaptain: null };

    document.getElementById('team-one').innerHTML = '';
    document.getElementById('team-two').innerHTML = '';
    document.getElementById('available-players').innerHTML = '';
    document.getElementById('team-one-captain').value = '';
    document.getElementById('team-two-captain').value = '';
    document.getElementById('team-one-name').textContent = 'Team One';
    document.getElementById('team-two-name').textContent = 'Team Two';
    document.getElementById('draft-results').classList.add('d-none');
}
