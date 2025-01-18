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

        // Enable Start Draft button only when captains are selected
        document.getElementById('team-one-captain').addEventListener('change', validateCaptainSelection);
        document.getElementById('team-two-captain').addEventListener('change', validateCaptainSelection);

        // Start draft logic
        document.getElementById('start-draft-btn').addEventListener('click', () => {
            startDraft(players);
        });
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

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

function validateCaptainSelection() {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;
    const startButton = document.getElementById('start-draft-btn');

    // Enable Start Draft button only if both captains are selected and not the same
    startButton.disabled = !(teamOneId && teamTwoId && teamOneId !== teamTwoId);
}

function startDraft(players) {
    const teamOneId = document.getElementById('team-one-captain').value;
    const teamTwoId = document.getElementById('team-two-captain').value;

    selectedCaptains.teamOneCaptain = players.find(player => player.id === teamOneId);
    selectedCaptains.teamTwoCaptain = players.find(player => player.id === teamTwoId);

    setupTeams(players);
}

function setupTeams(players) {
    document.getElementById('draft-panels').classList.remove('d-none');

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
}

function assignPlayerToTeam(teamId, player) {
    const teamList = document.getElementById(teamId);
    const playerElement = createDraggablePlayerElement(player);
    teamList.appendChild(playerElement);
}

function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = createDraggablePlayerElement(player);
        availablePlayersList.appendChild(li);
    });
}

function createDraggablePlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${player.name} (Handicap: ${player.handicap})`;
    li.setAttribute('draggable', true);
    li.setAttribute('data-id', player.id);
    li.ondragstart = drag;
    return li;
}

// Handles the drag event
function drag(event) {
    event.dataTransfer.setData('text/plain', event.target.getAttribute('data-id'));
}

// Allows dropping in valid dropzones
function allowDrop(event) {
    event.preventDefault();
}

// Handles the drop event
function drop(event, targetId) {
    event.preventDefault();

    // Get the player ID from the drag event
    const playerId = event.dataTransfer.getData('text/plain');

    // Find the player in the available players list
    const playerElement = document.querySelector(`#available-players [data-id="${playerId}"]`);
    if (playerElement) {
        // Remove player from the available players list
        playerElement.parentNode.removeChild(playerElement);

        // Add player to the target team
        const targetList = document.getElementById(targetId);
        targetList.appendChild(playerElement);

        // Show a notification summarizing the move
        showMoveNotification(playerElement.textContent, targetId);
    }
}

// Displays a UI panel summarizing the move
function showMoveNotification(playerName, targetTeam) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '1050';
    notification.innerHTML = `<strong>${playerName}</strong> has been added to <strong>${targetTeam.replace('-', ' ').toUpperCase()}</strong>!`;

    document.body.appendChild(notification);

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}
