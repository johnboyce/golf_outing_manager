function updateFoursomesTab() {
    console.log('Updating foursomes tab...');
    const courses = draftData.foursomes;

    if (!courses || !Object.keys(courses).length) {
        console.warn('No foursomes available.');
        return;
    }

    Object.keys(courses).forEach(course => {
        const courseContainer = $(`#${course} .foursome-list`);
        courseContainer.empty();

        courses[course].forEach((player, index) => {
            const playerElement = `
                <div class="foursome-item">
                    <img src="${player.team === 'Team One' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                         alt="${player.team} Logo" 
                         style="width: 50px; height: 50px; margin-right: 10px;">
                    <span>${player.name} (${player.handicap})</span>
                </div>
            `;
            courseContainer.append(playerElement);
        });
    });

    console.log('Foursomes tab updated.');
}
