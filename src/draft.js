// draft.js

document.addEventListener('DOMContentLoaded', () => {
    initializeDraftTab();
});

function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    const startDraftButton = document.getElementById('start-draft-btn');
    const startOverButton = document.getElementById('start-over-btn');
    const commissionDraftButton = document.getElementById('commission-draft-btn');

    if (!startDraftButton || !startOverButton || !commissionDraftButton) {
        console.error("Error: One or more draft buttons are missing in the DOM.");
        return;
    }

    startDraftButton.addEventListener('click', startDraft);
    startOverButton.addEventListener('click', resetDraft);
    commissionDraftButton.addEventListener('click', commissionDraft);

    fetchPlayersForDraft();
}


function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch players');
            }
            return response.json();
        })
        .then(players => {
            console.log('Players fetched:', players);
            if (Array.isArray(players)) {
                StateManager.set('playerProfiles', players);
                populateCaptainSelectors(players);
            } else {
                console.error('Unexpected response format:', players);
                displayErrorMessage();
            }
        })
        .catch(error => {
            console.error('Error fetching players:', error);
            displayErrorMessage();
        });
}

function displayErrorMessage() {
    document.getElementById('available-players').innerHTML = '<p class="text-danger">An error occurred while loading players. Please try again.</p>';
}

function populateCaptainSelectors(players) {
    const teamOneSelector = document.getElementById('team-one-captain-selector');
    const teamTwoSelector = document.getElementById('team-two-captain-selector');
    const startDraftButton = document.getElementById('start-draft-btn');

    teamOneSelector.innerHTML = '<option value="">Select Captain</option>';
    teamTwoSelector.innerHTML = '<option value="">Select Captain</option>';

    players.forEach(player => {
        const option = `<option value="${player.id}" data-logo="${player.teamLogo}">
                            ${player.name} (${player.nickname || 'No nickname'})
                        </option>`;
        teamOneSelector.innerHTML += option;
        teamTwoSelector.innerHTML += option;
    });

    const validateCaptainSelection = () => {
        const teamOneCaptain = players.find(player => player.id === teamOneSelector.value);
        const teamTwoCaptain = players.find(player => player.id === teamTwoSelector.value);

        StateManager.updateDraftData({
            teamOne: { ...StateManager.get('draftData').teamOne, captain: teamOneCaptain },
            teamTwo: { ...StateManager.get('draftData').teamTwo, captain: teamTwoCaptain },
        });

        // Update logos dynamically
        updateTeamLogo(teamOneSelector, 'team-one-header');
        updateTeamLogo(teamTwoSelector, 'team-two-header');

        // Enable start draft button if captains are valid
        startDraftButton.disabled = !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id);
    };

    teamOneSelector.addEventListener('change', validateCaptainSelection);
    teamTwoSelector.addEventListener('change', validateCaptainSelection);

    startDraftButton.disabled = true;
}


function startDraft() {
    console.log('Starting draft...');
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    draftData.teamOne.players = [draftData.teamOne.captain];
    draftData.teamTwo.players = [draftData.teamTwo.captain];

    const availablePlayers = allPlayers.filter(
        player => player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    StateManager.set('playerProfiles', availablePlayers);
    StateManager.updateDraftData({ draftStarted: true });

    // Hide captain selectors and call updateCaptainLogos
    document.getElementById('team-one-captain-selector').classList.add('d-none');
    document.getElementById('team-two-captain-selector').classList.add('d-none');
    updateCaptainLogos();

    // Update the UI for the draft
    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.remove('d-none');
    document.getElementById('commission-draft-btn').classList.add('d-none');

    updateDraftUI();
}


function updateCaptainLogos() {
    const draftData = StateManager.get('draftData');
    const teamOneLogo = draftData.teamOne.captain?.teamLogo || 'https://m.media-amazon.com/images/M/MV5BMTM0MjM3MTIwNl5BMl5BanBnXkFtZTcwMTM2ODYwNA@@._V1_.jpg';
    const teamTwoLogo = draftData.teamTwo.captain?.teamLogo || 'https://thumbs.dreamstime.com/b/asian-chinese-male-golfer-posing-golf-club-isolated-white-background-88322914.jpg';

    document.querySelector('#team-one-header img').src = teamOneLogo;
    document.querySelector('#team-two-header img').src = teamTwoLogo;
}


function updateDraftUI() {
    const draftData = StateManager.get('draftData');
    const availablePlayers = StateManager.get('playerProfiles');

    const availablePlayersList = document.getElementById('available-players');
    const teamOneList = document.getElementById('team-one');
    const teamTwoList = document.getElementById('team-two');

    availablePlayersList.innerHTML = '';
    teamOneList.innerHTML = '';
    teamTwoList.innerHTML = '';

    document.getElementById('team-one-header').querySelector('h3').textContent = `Team ${draftData.teamOne.captain?.nickname || 'One'}`;
    document.getElementById('team-two-header').querySelector('h3').textContent = `Team ${draftData.teamTwo.captain?.nickname || 'Two'}`;

    availablePlayers.forEach(player => {
        const buttonClass = draftData.currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        const listItem = `
        <li class="list-group-item d-flex align-items-center">
            <img src="${player.teamLogo}" alt="Team Logo" style="width: 30px; height: 30px; margin-right: 10px;">
            ${player.name} (${player.handicap})
            <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${draftData.currentDraftTurn}')">
                Add to ${draftData.currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
            </button>
        </li>
    `;
        availablePlayersList.innerHTML += listItem;
    });

    draftData.teamOne.players.forEach(player => {
        teamOneList.innerHTML += `<li class="list-group-item">${player.name} (${player.handicap})</li>`;
    });

    draftData.teamTwo.players.forEach(player => {
        teamTwoList.innerHTML += `<li class="list-group-item">${player.name} (${player.handicap})</li>`;
    });

    const draftTurnIndicator = document.getElementById('draft-turn-indicator');
    if (availablePlayers.length === 0) {
        draftTurnIndicator.innerHTML = '<div class="alert alert-success">All players have been drafted!</div>';
    } else if (draftData.draftStarted) {
        const currentTeamNickname =
            draftData.currentDraftTurn === 'teamOne'
                ? draftData.teamOne.captain?.nickname || 'Team One'
                : draftData.teamTwo.captain?.nickname || 'Team Two';

        draftTurnIndicator.innerHTML = `<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`;
    } else {
        draftTurnIndicator.innerHTML = '';
    }
}

function assignPlayerToTeam(playerId, team) {
    const draftData = StateManager.get('draftData');
    const allPlayers = StateManager.get('playerProfiles');
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);

    if (playerIndex === -1) {
        console.error('Player not found:', playerId);
        return;
    }

    const player = allPlayers.splice(playerIndex, 1)[0];
    draftData[team].players.push(player);

    draftData.currentDraftTurn = team === 'teamOne' ? 'teamTwo' : 'teamOne';

    StateManager.set('playerProfiles', allPlayers);
    StateManager.set('draftData', draftData);

    updateDraftUI();
}

function resetDraft() {
    console.log('Resetting draft...');
    StateManager.reset();
    populateCaptainSelectors(StateManager.get('playerProfiles'));

    document.getElementById('team-one-captain-selector').classList.remove('d-none');
    document.getElementById('team-two-captain-selector').classList.remove('d-none');
    document.getElementById('start-draft-btn').disabled = true;
    document.getElementById('start-draft-btn').classList.remove('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');
    document.getElementById('commission-draft-btn').classList.add('d-none');
    document.getElementById('draft-turn-indicator').innerHTML = '';

    updateDraftUI();
}

function commissionDraft() {
    console.log('Commissioning draft...');
    generateFoursomes();
    updateFoursomesTab();
    document.getElementById('start-draft-btn').classList.add('d-none');
    document.getElementById('start-over-btn').classList.add('d-none');
    document.getElementById('commission-draft-btn').disabled = true;
    document.getElementById('commission-draft-btn').textContent = 'Draft Commissioned';
}

function generateFoursomes() {
    const allPlayers = [
        ...StateManager.get('draftData').teamOne.players,
        ...StateManager.get('draftData').teamTwo.players,
    ];
    const shuffledPlayers = StateManager.shuffleArray(allPlayers);

    const groups = {
        bearTrapDunes: [],
        warAdmiral: [],
        manOWar: [],
        lighthouseSound: [],
    };

    const playersPerGame = Math.ceil(allPlayers.length / 4);

    Object.keys(groups).forEach((course, index) => {
        groups[course] = shuffledPlayers.slice(index * playersPerGame, (index + 1) * playersPerGame).map((player, i) => ({
            ...player,
            group: i + 1,
        }));
    });

    StateManager.updateDraftData({ foursomes: groups });
}

function updateFoursomesTab(foursomes) {
    const $foursomesContainer = $('#foursomes-container').html('');

    if (!foursomes || !Object.keys(foursomes).length) {
        $foursomesContainer.html('<p class="text-danger">No foursomes have been created yet. Please commission the draft first.</p>');
        return;
    }

    Object.keys(foursomes).forEach(courseName => {
        const courseFoursomes = foursomes[courseName];
        const courseSection = $('<div class="course-section mb-4"></div>');

        const courseHeader = `<h4>${courseName}</h4>`;
        courseSection.append(courseHeader);

        courseFoursomes.forEach((group, groupIndex) => {
            const groupElement = $('<div class="foursome-group mb-3"></div>');

            const header = `<h5>Foursome ${groupIndex + 1}</h5>`;
            groupElement.append(header);

            group.forEach(player => {
                const playerElement = `
        <div class="foursome-player d-flex align-items-center">
            <img src="${player.teamLogo}" alt="${player.team} Logo" style="width: 50px; height: 50px; margin-right: 10px;">
            <span>${player.name} (${player.handicap})</span>
        </div>
    `;
                groupElement.innerHTML += playerElement;
            });


            courseSection.append(groupElement);
        });

        $foursomesContainer.append(courseSection);
    });

    console.log('Foursomes updated:', foursomes);
}
