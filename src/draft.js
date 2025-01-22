$(document).ready(() => {
    initializeDraftTab();
});

// Global Variables for Draft
let allPlayers = [];
let draftData = {
    teamOne: {
        captain: null,
        name: 'Team One',
        players: [],
    },
    teamTwo: {
        captain: null,
        name: 'Team Two',
        players: [],
    },
    foursomes: {
        bearTrapDunes: [],
        warAdmiral: [],
        manOWar: [],
        lighthouseSound: [],
    },
};
let currentDraftTurn = 'teamOne';
let draftStarted = false;


// Initialize Draft Tab
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
    $('#start-over-btn').on('click', resetDraft);
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for Draft Tab...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(response => {
            console.log("Fetching players for draft:" + response);
            // Ensure response is an array
            if (Array.isArray(response)) {
                allPlayers = response;
                populateCaptainSelectors(response);
            } else {
                console.error('Unexpected API response format:', response);
                displayErrorMessage();
            }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error(`Error fetching players: ${textStatus}`, errorThrown);
            displayErrorMessage();
        });
}

// Display Error Message
function displayErrorMessage() {
    const $availablePlayers = $('#available-players');
    $availablePlayers.html('<p class="text-danger">An error occurred while loading players for the draft. Please try again later.</p>');
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector');
    const $teamTwoSelector = $('#team-two-captain-selector');
    const $startDraftButton = $('#start-draft-btn');

    $teamOneSelector.empty().append('<option value="">Select Captain</option>');
    $teamTwoSelector.empty().append('<option value="">Select Captain</option>');

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    function validateCaptainSelection() {
        draftData.teamOne.captain = players.find(player => player.id === $teamOneSelector.val());
        draftData.teamTwo.captain = players.find(player => player.id === $teamTwoSelector.val());

        draftData.teamOne.name = draftData.teamOne.captain ? `Team ${draftData.teamOne.captain.nickname}` : 'Team One';
        draftData.teamTwo.name = draftData.teamTwo.captain ? `Team ${draftData.teamTwo.captain.nickname}` : 'Team Two';

        $startDraftButton.prop('disabled', !(draftData.teamOne.captain && draftData.teamTwo.captain && draftData.teamOne.captain.id !== draftData.teamTwo.captain.id));
    }

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);
    $startDraftButton.prop('disabled', true);
}


function startDraft() {
    console.log('Starting draft...');
    draftStarted = true;

    if (!draftData.teamOne.captain || !draftData.teamTwo.captain) {
        console.error('Captains not selected. Cannot start draft.');
        return;
    }

    draftData.teamOne.players = [draftData.teamOne.captain];
    draftData.teamTwo.players = [draftData.teamTwo.captain];

    allPlayers = allPlayers.filter(player =>
        player.id !== draftData.teamOne.captain.id && player.id !== draftData.teamTwo.captain.id
    );

    $('#start-draft-btn').addClass('d-none');
    $('#start-over-btn').removeClass('d-none');
    $('#commission-draft-btn').addClass('d-none');

    updateDraftUI();
}


// Update Draft UI
function updateDraftUI() {
    const $availablePlayersList = $('#available-players').empty();
    const $teamOneList = $('#team-one').empty();
    const $teamTwoList = $('#team-two').empty();

    const $teamOneHeader = $('#team-one-header h3').text(`Team ${teamOneCaptain.nickname}`);
    const $teamTwoHeader = $('#team-two-header h3').text(`Team ${teamTwoCaptain.nickname}`);

    // Additional operations on the headers (if needed)
    $teamOneHeader.css('color', 'blue');
    $teamTwoHeader.css('color', 'red');

    allPlayers.forEach(player => {
        const buttonClass = currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        const listItem = `
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                    Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            </li>
        `;
        $availablePlayersList.append(listItem);
    });

    teamOne.forEach(player => {
        $teamOneList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    teamTwo.forEach(player => {
        $teamTwoList.append(`<li class="list-group-item">${player.name} (${player.handicap})</li>`);
    });

    if (draftStarted) {
        const currentTeamNickname =
            currentDraftTurn === 'teamOne'
                ? teamOneCaptain?.nickname || 'Team One'
                : teamTwoCaptain?.nickname || 'Team Two';

        $('#draft-turn-indicator').html(`<div class="alert alert-info">It's ${currentTeamNickname}'s turn to draft!</div>`);
    } else {
        $('#draft-turn-indicator').html('');
    }
}

function assignPlayerToTeam(playerId, team) {
    const playerIndex = allPlayers.findIndex(player => player.id === playerId);
    if (playerIndex === -1) return console.error('Player not found:', playerId);

    const player = allPlayers.splice(playerIndex, 1)[0];

    if (team === 'teamOne') {
        draftData.teamOne.players.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        draftData.teamTwo.players.push(player);
        currentDraftTurn = 'teamOne';
    }

    updateDraftUI();

    if (draftData.teamOne.players.length + draftData.teamTwo.players.length === allPlayers.length + 2) {
        $('#commission-draft-btn').removeClass('d-none');
    }
}


// Reset Draft
function resetDraft() {
    draftStarted = false;
    allPlayers = [...teamOne, ...teamTwo, ...allPlayers];
    teamOne = [];
    teamTwo = [];
    teamOneCaptain = null;
    teamTwoCaptain = null;
    populateCaptainSelectors(allPlayers);

    $('#start-draft-btn').removeClass('d-none').prop('disabled', true);
    $('#start-over-btn').addClass('d-none');
    $('#commission-draft-btn').addClass('d-none');
    $('#draft-turn-indicator').html('');
}

// Commission Draft
function commissionDraft() {
    console.log('Commissioning draft...');
    generateFoursomes();
    updateFoursomesTab();
    $('#start-draft-btn, #start-over-btn').addClass('d-none');
    $('#commission-draft-btn').prop('disabled', true).text('Draft Commissioned');
}



// Update Foursomes Tab
function updateFoursomesTab(foursomes) {
    const $foursomesContainer = $('#foursomes-container').html('');

    foursomes.forEach((group, index) => {
        const groupElement = $('<div class="foursome-group mb-3"></div>');

        groupElement.append(`<h4>Foursome ${index + 1}</h4>`);

        group.forEach(player => {
            const playerHtml = `
                <div class="foursome-player d-flex align-items-center">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                         alt="${player.team} Logo" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `;
            groupElement.append(playerHtml);
        });

        $foursomesContainer.append(groupElement);
    });

    console.log('Foursomes updated:', foursomes);
}

function generateFoursomes() {
    console.log('Generating foursomes...');
    const allPlayers = [...draftData.teamOne.players, ...draftData.teamTwo.players];
    const shuffledPlayers = shuffleArray(allPlayers);

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

    draftData.foursomes = groups;

    console.log('Foursomes generated:', draftData.foursomes);
}

// Utility to shuffle an array
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

