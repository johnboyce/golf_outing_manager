$(document).ready(() => {
    initializeFoursomesTab();
});

function initializeFoursomesTab() {
    console.log('Initializing Foursomes Tab...');
    const draftData = StateManager.get('draftData');

    if (!draftData || !draftData.foursomes) {
        displayNoFoursomesMessage();
        return;
    }

    updateFoursomesUI(draftData.foursomes);
}

// Update Foursomes UI
function updateFoursomesUI(foursomes) {
    const $foursomesContainer = $('#foursomes-container').empty();
    if (!foursomes || Object.keys(foursomes).length === 0) return;

    Object.entries(foursomes).forEach(([course, groups]) => {
        const courseHeader = `<h3 class="course-header">${formatCourseName(course)}</h3>`;
        const courseGroup = $('<div class="course-group"></div>').append(courseHeader);

        groups.forEach((group, groupIndex) => {
            const groupContainer = $('<div class="foursome-group"></div>');

            group.cartOne.concat(group.cartTwo).forEach(player => {
                const teamLogo = player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo;

                const playerCard = `
                    <div class="player-card">
                        <img src="${teamLogo}" alt="${player.team}" class="team-logo">
                        <span>${player.name} (${player.handicap})</span>
                    </div>
                `;
                groupContainer.append(playerCard);
            });

            courseGroup.append(groupContainer);
        });

        $foursomesContainer.append(courseGroup);
    });
}


// Display No Foursomes Message
function displayNoFoursomesMessage() {
    $('#foursomes-container').html('<p class="text-muted">No foursomes have been generated yet. Please commission a draft first.</p>');
}

// Format Course Name
function formatCourseName(courseKey) {
    switch (courseKey) {
        case 'bearTrapDunes':
            return 'Bear Trap Dunes';
        case 'warAdmiral':
            return 'War Admiral';
        case 'manOWar':
            return 'Man O\' War';
        case 'lighthouseSound':
            return 'Lighthouse Sound';
        default:
            return courseKey;
    }
}
