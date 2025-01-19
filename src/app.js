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

        // Enable Start Draft button only when captains are selected
        document.getElementById('team-one-captain').addEventListener('change', validateCaptainSelection);
        document.getElementById('team-two-captain').addEventListener('change', validateCaptainSelection);

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
            <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onclick="showPlayerProfile('${player.id}')"/>
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

function showPlayerProfile(playerId) {
    const player = allPlayers.find(p => p.id === playerId);

    const profilePopup = document.createElement('div');
    profilePopup.className = 'profile-popup';
    profilePopup.innerHTML = `
        <img src="${player.profileImage}" alt="${player.name}" class="profile-image-lg" />
        <h4>${player.name} (${player.nickname})</h4>
        <p><strong>Bio:</strong> ${player.bio}</p>
        <p><strong>Prediction:</strong> ${player.prediction}</p>
    `;

    profilePopup.style.position = 'fixed';
    profilePopup.style.top = '20%';
    profilePopup.style.left = '50%';
    profilePopup.style.transform = 'translate(-50%, -20%)';
    profilePopup.style.zIndex = '1050';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-danger mt-2';
    closeBtn.onclick = () => profilePopup.remove();
    profilePopup.appendChild(closeBtn);

    document.body.appendChild(profilePopup);
}

window.addPlayerToTeam = (playerId) => {
    const availablePlayersList = document.getElementById('available-players');
    const playerElement = availablePlayersList.querySelector(`[data-id="${playerId}"]`);
    const playerName = playerElement.querySelector('span').textContent;

    // Remove from available players
    availablePlayersList.removeChild(playerElement);

    // Add to the current team
    const targetTeam = currentTurn;
    const targetList = document.getElementById(targetTeam);
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = playerName; // Show only the handicap in parentheses
    targetList.appendChild(li);

    // Switch turn
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
    populateAvailablePlayers(Array.from(availablePlayersList.querySelectorAll('li')).map(li => ({
        id: li.getAttribute('data-id'),
        name: li.querySelector('span').textContent.split(' (')[0],
        handicap: li.querySelector('span').textContent.match(/\(([^)]+)\)/)[1],
        profileImage: li.querySelector('img').src
    })));
};
