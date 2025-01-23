$(document).ready(() => {
    initializeDraftTab();
});

function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();

    $('#start-draft-btn').on('click', startDraft);
}

// Fetch players for populating captain selectors
function fetchPlayersForDraft() {
    console.log('Fetching players for draft...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            console.log('Players fetched:', players);
            StateManager.set('playerProfiles', players); // Store players in StateManager
            populateCaptainSelectors(players);
        })
        .fail(() => {
            console.error('Error fetching players for draft.');
            displayErrorMessage();
        });
}

// Populate captain selectors
function populateCaptainSelectors(players) {
    const $teamOneSelector = $('#team-one-captain-selector');
    const $teamTwoSelector = $('#team-two-captain-selector');
    const $startDraftButton = $('#start-draft-btn');

    // Clear existing options and add default
    $teamOneSelector.empty().append('<option value="">Select Captain</option>');
    $teamTwoSelector.empty().append('<option value="">Select Captain</option>');

    // Populate selectors with player options
    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    // Validate captain selection
    const validateSelection = () => {
        const teamOneCaptain = players.find(p => p.id === $teamOneSelector.val());
        const teamTwoCaptain = players.find(p => p.id === $teamTwoSelector.val());

        StateManager.updateDraftData({
            teamOne: { ...StateManager.get('draftData').teamOne, captain: teamOneCaptain },
            teamTwo: { ...StateManager.get('draftData').teamTwo, captain: teamTwoCaptain },
        });

        // Enable Start Draft button if valid
        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateSelection);
    $teamTwoSelector.on('change', validateSelection);

    $startDraftButton.prop('disabled', true);
}

// Display error message for fetch failure
function displayErrorMessage() {
    $('#draft-tab').html('<p class="text-danger text-center">Failed to load players. Please try again later.</p>');
}

// Start draft process
function startDraft() {
    console.log('Draft started...');
    const draftData = StateManager.get('draftData');

    // Hide selectors and enable next steps
    $('#team-one-captain-selector, #team-two-captain-selector').addClass('d-none');
    $('#start-draft-btn').addClass('d-none');
    $('#draft-turn-indicator').html(`<p class="alert alert-info">It's ${draftData.teamOne.captain.nickname}'s turn to draft!</p>`);

    // Proceed to next step (e.g., player assignment)
    StateManager.updateDraftData({ draftStarted: true });
}
