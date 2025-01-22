function updateFoursomesTab() {
    const foursomes = StateManager.get('draftData').foursomes;

    Object.keys(foursomes).forEach(course => {
        const courseContainer = $(`#${course} .foursome-list`);
        courseContainer.empty();

        foursomes[course].forEach(player => {
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
}
