$(document).ready(() => {
    initializeFoursomesTab();
});

// Initialize Foursomes Tab
function initializeFoursomesTab() {
    console.log('Initializing Foursomes Tab...');
    // Ensure the content is ready when this tab is clicked.
}

// Update Foursomes Tab with Data
function updateFoursomesTab(foursomes) {
    const $foursomesContainer = $('#foursomes-container').html('');
    foursomes.forEach((group, index) => {
        const $groupDiv = $('<div class="foursome-group mb-3"></div>');

        const header = `<h4>Foursome ${index + 1}</h4>`;
        $groupDiv.append(header);

        group.forEach(player => {
            const playerHtml = `
                <div class="foursome-player d-flex align-items-center">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                         alt="${player.team} Logo" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `;
            $groupDiv.append(playerHtml);
        });

        $foursomesContainer.append($groupDiv);
    });

    console.log('Foursomes updated:', foursomes);
}
