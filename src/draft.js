// Initialize Draft Tab
function initializeDraftTab(players) {
    populateCaptainSelectors(players);
    setupDraftTabEventListeners();
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    teamOneSelector.innerHTML = '';
    teamTwoSelector.innerHTML = '';

    players.forEach(player => {
        const optionOne = new Option(player.name, player.id);
        const optionTwo = new Option(player.name, player.id);

        if (player.name === 'John Boyce') {
            optionOne.selected = true;
        }

        if (player.name === 'Jim Boyce') {
            optionTwo.selected = true;
        }

        teamOneSelector.add(optionOne);
        teamTwoSelector.add(optionTwo);
    });

    validateCaptainSelection();
}

// Validate Captain Selection
function validateCaptainSelection() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    const selectedTeamOne = teamOneSelector.value;
    const selectedTeamTwo = teamTwoSelector.value;

    Array.from(teamOneSelector.options).forEach(option => option.disabled = false);
    Array.from(teamTwoSelector.options).forEach(option => option.disabled = false);

    if (selectedTeamOne) {
        const option = Array.from(teamTwoSelector.options).find(opt => opt.value === selectedTeamOne);
        if (option) option.disabled = true;
    }

    if (selectedTeamTwo) {
        const option = Array.from(teamOneSelector.options).find(opt => opt.value === selectedTeamTwo);
        if (option) option.disabled = true;
    }

    const startDraftBtn = document.getElementById('start-draft-btn');
    startDraftBtn.disabled = !(selectedTeamOne && selectedTeamTwo && selectedTeamOne !== selectedTeamTwo);
}

// Start Draft
function startDraft() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');

    selectedCaptains.teamOneCaptain = allPlayers.find(player => player.id === teamOneSelector.value);
    selectedCaptains.teamTwoCaptain = allPlayers.find(player => player.id === teamTwoSelector.value);

    document.getElementById('draft-content').classList.add('d-none');
    document.getElementById('draft-panels').classList.remove('d-none');

    teamOne = [selectedCaptains.teamOneCaptain];
    teamTwo = [selectedCaptains.teamTwoCaptain];

    availablePlayers = allPlayers.filter(player =>
        player.id !== selectedCaptains.teamOneCaptain.id &&
        player.id !== selectedCaptains.teamTwoCaptain.id
    );

    populateAvailablePlayers(availablePlayers);
    updateDraftTurnUI();
}

// Populate Available Players
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-${currentTurn === 'team-one' ? 'primary' : 'success'}" onclick="addPlayerToTeam('${player.id}')">
                Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(li);
    });
}

// Add Player to Team
function addPlayerToTeam(playerId) {
    const player = availablePlayers.find(p => p.id === playerId);

    if (currentTurn === 'team-one') {
        teamOne.push(player);
        document.getElementById('team-one').appendChild(createPlayerElement(player));
    } else {
        teamTwo.push(player);
        document.getElementById('team-two').appendChild(createPlayerElement(player));
    }

    availablePlayers = availablePlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(availablePlayers);

    if (availablePlayers.length === 0) {
        document.getElementById('commission-draft-btn').classList.remove('d-none');
    }

    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
    updateDraftTurnUI();
}

// Update Draft Turn UI
function updateDraftTurnUI() {
    const turnIndicator = document.getElementById('draft-turn-indicator');
    turnIndicator.textContent = currentTurn === 'team-one' ? "Team One's Turn" : "Team Two's Turn";
}

// Create Player Element
function createPlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
    li.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2">
            <span>${player.name} (${player.handicap})</span>
        </div>
    `;
    return li;
}

// Generate Foursomes
function generateFoursomes() {
    const foursomesList = document.getElementById('foursomes-list');
    foursomesList.innerHTML = '';

    const allPlayersInTeams = [...teamOne, ...teamTwo];

    for (let i = 0; i < allPlayersInTeams.length; i += 4) {
        const foursome = allPlayersInTeams.slice(i, i + 4);
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Foursome ${Math.floor(i / 4) + 1}</h5>
                    <ul>
                        ${foursome.map(player => `<li>${player.name}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        foursomesList.appendChild(col);
    }
}

// Event Listeners for Draft Tab
function setupDraftTabEventListeners() {
    const teamOneSelector = document.getElementById('team-one-captain');
    const teamTwoSelector = document.getElementById('team-two-captain');
    const startDraftBtn = document.getElementById('start-draft-btn');
    const commissionDraftBtn = document.getElementById('commission-draft-btn');

    // Validate captains when selections change
    if (teamOneSelector && teamTwoSelector) {
        teamOneSelector.addEventListener('change', validateCaptainSelection);
        teamTwoSelector.addEventListener('change', validateCaptainSelection);
    }

    // Start draft when button is clicked
    if (startDraftBtn) {
        startDraftBtn.addEventListener('click', startDraft);
    }

    // Commission draft when button is clicked
    if (commissionDraftBtn) {
        commissionDraftBtn.addEventListener('click', generateFoursomes);
    }
}


// Event Listeners for Commissioning the Draft
document.getElementById('commission-draft-btn').addEventListener('click', generateFoursomes);
