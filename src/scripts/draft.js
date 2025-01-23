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

    $teamOneSelector.empty().append('<option value="">Select Captain</option>');
    $teamTwoSelector.empty().append('<option value="">Select Captain</option>');

    players.forEach(player => {
        const option = `<option value="${player.id}">${player.name} (${player.nickname || 'No nickname'})</option>`;
        $teamOneSelector.append(option);
        $teamTwoSelector.append(option);
    });

    const validateCaptainSelection = () => {
        const teamOneCaptain = players.find(player => player.id === $teamOneSelector.val());
        const teamTwoCaptain = players.find(player => player.id === $teamTwoSelector.val());

        StateManager.updateDraftData({
            teamOne: { ...StateManager.get('draftData').teamOne, captain: teamOneCaptain },
            teamTwo: { ...StateManager.get('draftData').teamTwo, captain: teamTwoCaptain },
        });

        updateCaptainLogos(teamOneCaptain, teamTwoCaptain);

        $startDraftButton.prop('disabled', !(teamOneCaptain && teamTwoCaptain && teamOneCaptain.id !== teamTwoCaptain.id));
    };

    $teamOneSelector.on('change', validateCaptainSelection);
    $teamTwoSelector.on('change', validateCaptainSelection);

    $startDraftButton.prop('disabled', true);
}

function updateCaptainLogos(teamOneCaptain, teamTwoCaptain) {
    const $teamOneLogoContainer = $('#team-one-logo');
    const $teamTwoLogoContainer = $('#team-two-logo');
    const $teamOneLogo = $('#team-one-captain-logo');
    const $teamTwoLogo = $('#team-two-captain-logo');

    if (teamOneCaptain?.teamLogo) {
        $teamOneLogo.attr('src', teamOneCaptain.teamLogo).fadeIn();
        $teamOneLogoContainer.removeClass('d-none');
    } else {
        $teamOneLogoContainer.addClass('d-none');
    }

    if (teamTwoCaptain?.teamLogo) {
        $teamTwoLogo.attr('src', teamTwoCaptain.teamLogo).fadeIn();
        $teamTwoLogoContainer.removeClass('d-none');
    } else {
        $teamTwoLogoContainer.addClass('d-none');
    }
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
