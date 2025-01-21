$(document).ready(() => {
    initializeFoursomesTab();
});

function initializeFoursomesTab() {
    console.log('Initializing Foursomes Tab...');

    if (savedFoursomes.length === 0) {
        console.warn('No foursomes available. Please commission the draft.');
        $('#foursomes-container').html('<p>No foursomes have been created yet. Commission the draft to see foursomes.</p>');
    } else {
        updateFoursomesTab();
    }
}

// Update Foursomes Tab with Data
function updateFoursomesTab() {
    const $foursomesContainer = $('#foursomes-container');
    $foursomesContainer.empty();

    savedFoursomes.forEach((group, index) => {
        const groupElement = $('<div class="foursome-group"></div>');

        const header = $('<h4></h4>').text(`Foursome ${index + 1}`);
        groupElement.append(header);

        group.forEach(player => {
            const playerElement = $(`
                <div class="foursome-player">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                         alt="${player.team} Logo" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `);
            groupElement.append(playerElement);
        });

        $foursomesContainer.append(groupElement);
    });

    console.log('Foursomes updated in the UI:', savedFoursomes);
}
