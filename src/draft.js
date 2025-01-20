document.addEventListener('DOMContentLoaded', initializeDraftTab);

// Global Variables for Draft
let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentDraftTurn = 'teamOne';
let draftStarted = false;
let teamOneCaptain = null;
let teamTwoCaptain = null;
const teamLogos = {
    teamOne: 'https://www.pngkey.com/png/full/946-9467891_golf-ball-on-tee-png.png',
    teamTwo: 'https://svgsilh.com/png-512/2027506-009688.png',
};

// Initialize Draft Tab
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    const startDraftButton = document.getElementById('start-draft-btn');
    const startOverButton = document.getElementById('start-over-btn');
    const commissionDraftButton = document.getElementById('commission-draft-btn');

    if (startDraftButton) startDraftButton.addEventListener('click', startDraft);
    if (startOverButton) startOverButton.addEventListener('click', resetDraft);
    if (commissionDraftButton) commissionDraftButton.addEventListener('click', commissionDraft);
}

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch players');
            return response.json();
        })
        .then(players => {
            console.log('Players fetched for draft:', players);
            allPlayers = players;
            populateCaptainSelectors(players);
        })
        .catch(error => console.error('Error fetching players for draft:', error));
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain-selector');
    const teamTwoSelector = document.getElementById('team-two-captain-selector');
    const startDraftButton = document.getElementById('start-draft-btn');

    teamOneSelector.innerHTML = '<option value="">Select Captain</option>';
    teamTwoSelector.innerHTML = '<option value="">Select Captain</option>';

    players.forEach(player => {
        const optionOne = document.createElement('option');
        const optionTwo = document.createElement('option');
        optionOne.value = player.id;
        optionOne.textContent = `${player.name} (${player.nickname || 'No nickname'})`;
        optionTwo.value = player.id;
        optionTwo.textContent = `${player.name} (${player.nickname || 'No nickname'})`;

        teamOneSelector.appendChild(optionOne);
        teamTwoSelector.appendChild(optionTwo);
    });

    const validateCaptainSelection = () => {
        teamOneCaptain = players.find(player => player.id === teamOneSelector.value);
        teamTwoCaptain = players.find(player => player.id === teamTwoSelector.value);
        startDraftButton.disabled = !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id);
    };

    teamOneSelector.addEventListener('change', validateCaptainSelection);
    teamTwoSelector.addEventListener('change', validateCaptainSelection);
    startDraftButton.disabled = true;
}

// Start Draft
function startDraft() {
    console.log('Draft started!');
    draftStarted = true;

    if (!teamOneCaptain || !teamTwoCaptain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    teamOne = [teamOneCaptain];
    teamTwo = [teamTwoCaptain];

    allPlayers = allPlayers.filter(player => player.id !== teamOneCaptain.id && player.id !== teamTwoCaptain.id);

    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.remove('d-none');
    document.getElementById('commission-draft-btn').classList.add('d-none');

    updateDraftUI();
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);
    if (playerIndex === -1) return console.error('Player not found:', playerId);

    const player = allPlayers.splice(playerIndex, 1)[0];

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    updateDraftUI();

    if (teamOne.length + teamTwo.length === allPlayers.length + 2) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }
}

// Reset Draft
function resetDraft() {
    console.log('Resetting draft...');
    draftStarted = false;
    allPlayers = [...teamOne, ...teamTwo, ...allPlayers];
    teamOne = [];
    teamTwo = [];
    teamOneCaptain = null;
    teamTwoCaptain = null;

    populateCaptainSelectors(allPlayers);

    document.getElementById('start-draft-btn').disabled = true;
    document.getElementById('start-draft-btn').classList.remove('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');
    document.getElementById('commission-draft-btn').classList.add('d-none');

    document.getElementById('draft-turn-indicator').innerHTML = '';
}

// Update Draft UI
function updateDraftUI() {
    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');
    const draftTurnIndicator = document.getElementById('draft-turn-indicator');

    availablePlayersList.innerHTML = '';
    teamOneList.innerHTML = '';
    teamTwoList.innerHTML = '';

    allPlayers.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            ${player.name} (${player.handicap})
            <button class="btn btn-sm btn-${currentDraftTurn === 'teamOne' ? 'primary' : 'secondary'}" 
                onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(listItem);
    });

    teamOne.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamOneList.appendChild(listItem);
    });

    teamTwo.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${player.name} (${player.handicap})`;
        teamTwoList.appendChild(listItem);
    });

    if (draftStarted) {
        const currentTeamNickname =
            currentDraftTurn === 'teamOne'
                ? teamOneCaptain?.nickname || 'Team One'
                : teamTwoCaptain?.nickname || 'Team Two';

        draftTurnIndicator.innerHTML = `<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`;
    } else {
        draftTurnIndicator.innerHTML = '';
    }
}

// Commission Draft
function commissionDraft() {
    console.log('Committing draft and creating foursomes...');

    const foursomes = [];
    const totalPlayers = Math.max(teamOne.length, teamTwo.length);

    for (let i = 0; i < totalPlayers; i++) {
        const group = [];
        if (teamOne[i]) group.push({ ...teamOne[i], team: 'Team One' });
        if (teamTwo[i]) group.push({ ...teamTwo[i], team: 'Team Two' });
        foursomes.push(group);
    }

    updateFoursomesTab(foursomes);
}

// Update Foursomes Tab
function updateFoursomesTab(foursomes) {
    const foursomesContainer = document.getElementById('foursomes-container');
    foursomesContainer.innerHTML = '';

    foursomes.forEach((group, index) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'foursome-group';

        const header = document.createElement('h4');
        header.textContent = `Foursome ${index + 1}`;
        groupElement.appendChild(header);

        group.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'foursome-player';
            playerElement.innerHTML = `
                <img src="${player.team === 'Team One' ? teamLogos.teamOne : teamLogos.teamTwo}" 
                    alt="${player.team} Logo" 
                    style="width: 50px; height: 50px; margin-right: 10px;">
                <span>${player.name} (${player.handicap})</span>
            `;
            groupElement.appendChild(playerElement);
        });

        foursomesContainer.appendChild(groupElement);
    });

    console.log('Foursomes created:', foursomes);
}
