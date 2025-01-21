$(document).ready(() => {
    initializeDraftTab();
});

// Global Variables
let allPlayers = [];
let teamOne = [];
let teamTwo = [];
let currentDraftTurn = 'teamOne';
let draftStarted = false;
let teamOneCaptain = null;
let teamTwoCaptain = null;

// Initialize Draft Tab
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
    $('#start-over-btn').on('click', resetDraft);
    $('#commission-draft-btn').on('click', commissionDraft);
}

// Fetch Players
function fetchPlayersForDraft() {
    $.get(`${API_GATEWAY_URL}/players`)
        .done(players => {
            allPlayers = players;
            populateCaptainSelectors(players);
        })
        .fail(error => console.error('Error fetching players:', error));
}

// Populate Captain Selectors
function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector').html('<option value="">Select Captain</option>');
    const $teamTwoSelector = $('#team-two-captain-selector').html('<option value="">Select Captain</option>');
    const $startDraftButton = $('#start-draft-btn').prop('disabled', true);

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    const validateCaptainSelection = () => {
        teamOneCaptain = players.find(player => player.id === $teamOneSelector.val());
        teamTwoCaptain = players.find(player => player.id === $teamTwoSelector.val());
        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);
}

// Start Draft
function startDraft() {
    draftStarted = true;
    teamOne = [teamOneCaptain];
    teamTwo = [teamTwoCaptain];
    allPlayers = allPlayers.filter(player => player.id !== teamOneCaptain.id && player.id !== teamTwoCaptain.id);

    $('#start-draft-btn').addClass('d-none');
    $('#start-over-btn').removeClass('d-none');
    updateDraftUI();
}

// Update Draft UI
function updateDraftUI() {
    $('#available-players').empty();
    $('#team-one').empty();
    $('#team-two').empty();

    allPlayers.forEach(player => {
        const buttonClass = currentDraftTurn === 'teamOne' ? 'btn-primary' : 'btn-secondary';
        $('#available-players').append(`
            <li class="list-group-item">
                ${player.name} (${player.handicap})
                <button class="btn ${buttonClass}" onclick="assignPlayerToTeam('${player.id}', '${currentDraftTurn}')">
                    Add to ${currentDraftTurn === 'teamOne' ? 'Team One' : 'Team Two'}
                </button>
            </li>
        `);
    });

    $('#team-one-header h3').text(`Team ${teamOneCaptain.nickname}`);
    $('#team-two-header h3').text(`Team ${teamTwoCaptain.nickname}`);
}

// Assign Player to Team
function assignPlayerToTeam(playerId, team) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    if (team === 'teamOne') {
        teamOne.push(player);
        currentDraftTurn = 'teamTwo';
    } else {
        teamTwo.push(player);
        currentDraftTurn = 'teamOne';
    }

    allPlayers = allPlayers.filter(p => p.id !== playerId);
    updateDraftUI();
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

    $('#start-draft-btn').removeClass('d-none');
    $('#start-over-btn').addClass('d-none');
}

// Commission Draft
function commissionDraft() {
    console.log('Committing draft...');
    // Logic for commission
}
