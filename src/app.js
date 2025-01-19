const API_GATEWAY_URL = "https://4epgafkkhl.execute-api.us-east-1.amazonaws.com";

let selectedCaptains = {
    teamOneCaptain: null,
    teamTwoCaptain: null
};

let currentTurn = 'team-one'; // Tracks whose turn it is
let allPlayers = []; // Store all players for quick access

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch players from the API
        allPlayers = await fetchPlayersFromAPI();
        console.log('Fetched players:', allPlayers);

        populateCaptainSelectors(allPlayers);

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

        document.getElementById('start-draft-btn').addEventListener('click', () => {
            startDraft(allPlayers);
        });
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

async function fetchPlayersFromAPI() {
    const apiUrl = `${API_GATEWAY_URL}/players`;
    console.log('Fetching players from:', apiUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched players:', data);
    return data;
}

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

    otherOptions.forEach(option => {
        option.disabled = false;
    });

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
    playerElement.classList.add('fade-in'); // Add fade-in animation
    teamList.appendChild(playerElement);

    // Highlight active team
    const teamOneName = document.getElementById('team-one-name');
    const teamTwoName = document.getElementById('team-two-name');
    if (teamId === 'team-one') {
        teamOneName.classList.add('pulse');
        teamTwoName.classList.remove('pulse');
    } else {
        teamTwoName.classList.add('pulse');
        teamOneName.classList.remove('pulse');
    }
}

function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in'; // Fade-in animation
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onmouseover="showPlayerInfo('${player.id}')">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-${currentTurn === 'team-one' ? 'primary' : 'success'}" onclick="addPlayerToTeam('${player.id}')">
                Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
            </button>
        `;
        li.addEventListener('animationend', () => {
            li.classList.remove('fade-in'); // Clean up animation class
        });
        availablePlayersList.appendChild(li);
    });
}

function addPlayerToTeam(playerId) {
    const player = allPlayers.find(p => p.id === playerId);

    // Animate removal from available players
    const availablePlayersList = document.getElementById('available-players');
    const playerElement = availablePlayersList.querySelector(`[data-id="${playerId}"]`);
    if (playerElement) {
        playerElement.classList.add('fade-out'); // Fade-out animation
        playerElement.addEventListener('animationend', () => {
            availablePlayersList.removeChild(playerElement);
        });
    }

    // Assign player to team
    if (currentTurn === 'team-one') {
        assignPlayerToTeam('team-one', player);
    } else {
        assignPlayerToTeam('team-two', player);
    }

    // Update players and switch turn
    allPlayers = allPlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(allPlayers);

    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
}

function showPlayerInfo(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    const playerInfoPanel = document.getElementById('player-info-panel');

    playerInfoPanel.innerHTML = `
        <img src="${player.profileImage}" alt="${player.name}">
        <h5>${player.name} (${player.nickname})</h5>
        <p><strong>Handicap:</strong> ${player.handicap}</p>
        <p><strong>Bio:</strong> ${player.bio}</p>
        <p><strong>Prediction:</strong> ${player.prediction}</p>
    `;
}
