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

    // Drag start event
    li.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', player.id);
    });

    return li;
}

// Allow drop zones to accept dropped items
function allowDrop(event) {
    event.preventDefault();
}

// Handle the drop event
function drop(event, targetId) {
    event.preventDefault();

    const playerId = event.dataTransfer.getData('text/plain');
    const availablePlayersList = document.getElementById('available-players');
    const playerElement = availablePlayersList.querySelector(`[data-id="${playerId}"]`);

    if (playerElement) {
        // Remove from available players and add to the target team
        playerElement.parentNode.removeChild(playerElement);

        const targetList = document.getElementById(targetId);
        targetList.appendChild(playerElement);

        showMoveNotification(playerElement.textContent, targetId);
    }
}

// Displays a notification summarizing the move
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
