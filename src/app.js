import { fetchPlayers } from './data.js';

let selectedCaptains = {
    teamOneCaptain: null,
    teamTwoCaptain: null
};

let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access

document.addEventListener('DOMContentLoaded', async () => {
    try {
        allPlayers = await fetchPlayers();
        console.log('Fetched players:', allPlayers);

        populateCaptainSelectors(allPlayers);

        // Event listeners for captain selection
        const teamOneSelector = document.getElementById('team-one-captain');
        const teamTwoSelector = document.getElementById('team-two-captain');

        teamOneSelector.addEventListener('change', () => {
            filterCaptainOptions(teamOneSelector.value, teamTwoSelector);
            validateCaptainSelection();
        });

        teamTwoSelector.addEventListener('change', () => {
            filterCaptainOptions(teamTwoSelector.value, teamOneSelector);
            validateCaptainSelection();
        });

        // Start draft logic
        document.getElementById('start-draft-btn').addEventListener('click', () => {
            startDraft(allPlayers);
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

function filterCaptainOptions(selectedId, otherSelector) {
    const otherOptions = Array.from(otherSelector.options);

    // Reset options for the other selector
    otherOptions.forEach(option => {
        option.disabled = false;
    });

    // Disable the selected captain in the other selector
    if (selectedId) {
        const optionToDisable = otherOptions.find(option => option.value === selectedId);
        if (optionToDisable) {
            optionToDisable.disabled = true;
        }
    }
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
    const playerElement = createPlayerElement(player);
    teamList.appendChild(playerElement);
}

function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = createAvailablePlayerElement(player);
        availablePlayersList.appendChild(li);
    });
}

function createAvailablePlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onmouseover="showPlayerInfo('${player.id}')" />
            <span>${player.name} (${player.handicap})</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="addPlayerToTeam('${player.id}')">
            Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
        </button>
    `;
    li.setAttribute('data-id', player.id);
    return li;
}

function createPlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';
    li.innerHTML = `
        <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2"/>
        <span>${player.name} (${player.handicap})</span>
    `;
    li.setAttribute('data-id', player.id);
    return li;
}

function showPlayerInfo(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    const playerInfoPanel = document.getElementById('player-info-panel');

    playerInfoPanel.innerHTML = `
        <img src="${player.profileImage}" alt="${player.name}" />
        <h5>${player.name} (${player.nickname})</h5>
        <p><strong>Handicap:</strong> ${player.handicap}</p>
        <p><strong>Bio:</strong> ${player.bio}</p>
        <p><strong>Prediction:</strong> ${player.prediction}</p>
    `;
}

window.addPlayerToTeam = (playerId) => {
    const availablePlayersList = document.getElementById('available-players');
    const playerElement = availablePlayersList.querySelector(`[data-id="${playerId}"]`);

    // Remove from available players
    availablePlayersList.removeChild(playerElement);

    // Add to the current team
    const targetTeam = currentTurn;
    const targetList = document.getElementById(targetTeam);
    const player = allPlayers.find(p => p.id === playerId);
    const li = createPlayerElement(player);
    targetList.appendChild(li);

    // Update the last draft selection
    updateLastDraftSelection(player);

    // Switch turn
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
    populateAvailablePlayers(Array.from(availablePlayersList.querySelectorAll('li')).map(li => ({
        id: li.getAttribute('data-id'),
        name: li.querySelector('span').textContent.split(' (')[0],
        handicap: li.querySelector('span').textContent.match(/\(([^)]+)\)/)[1],
        profileImage: li.querySelector('img').src
    })));
};

function updateLastDraftSelection(player) {
    const playerInfoPanel = document.getElementById('player-info-panel');
    playerInfoPanel.innerHTML = `
        <h5>Last Draft Selection</h5>
        <img src="${player.profileImage}" alt="${player.name}" />
        <p><strong>${player.name}</strong> has been added to <strong>${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}</strong>.</p>
    `;
}
