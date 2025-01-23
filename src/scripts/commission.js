function commissionDraft() {
    console.log('Commissioning draft...');

    const draftData = StateManager.get('draftData');
    const timestamp = new Date().toISOString();
    const humanReadableName = new Date().toLocaleString();

    // Save draft under timestamp key
    StateManager.set(`drafts.${timestamp}`, { ...draftData, name: humanReadableName });

    console.log('Draft data persisted:', StateManager.get(`drafts.${timestamp}`));

    // Generate Foursomes
    generateFoursomes();

    // Update UI
    $('#start-draft-btn, #start-over-btn').addClass('d-none');
    $('#commission-draft-btn').prop('disabled', true).text('Draft Commissioned');
    $('#foursomes-tab').click();
}

function generateFoursomes() {
    const draftData = StateManager.get('draftData');
    const courses = StateManager.get('courses');
    const teamOne = draftData.teamOne.players;
    const teamTwo = draftData.teamTwo.players;

    const allPlayers = [...teamOne, ...teamTwo];
    const shuffledPlayers = StateManager.shuffleArray(allPlayers);

    const playerMatchTracker = new Map(allPlayers.map(player => [player.id, new Set()]));

    const groups = courses.reduce((acc, course) => {
        acc[course.id] = [];
        return acc;
    }, {});

    // Assign players to foursomes, ensuring variety
    courses.forEach(course => {
        const courseFoursomes = [];
        const remainingPlayers = [...shuffledPlayers];

        while (remainingPlayers.length >= 4) {
            const [cartOne, cartTwo] = createBalancedFoursome(remainingPlayers, playerMatchTracker);

            courseFoursomes.push({
                cartOne,
                cartTwo,
            });
        }

        groups[course.id] = courseFoursomes;
    });

    StateManager.updateDraftData({ foursomes: groups });
    console.log('Foursomes generated:', groups);
}

function createBalancedFoursome(remainingPlayers, playerMatchTracker) {
    const cartOne = [];
    const cartTwo = [];

    for (const cart of [cartOne, cartTwo]) {
        while (cart.length < 2 && remainingPlayers.length > 0) {
            const player = remainingPlayers.shift();
            const teammates = [...playerMatchTracker.get(player.id)];

            const notMatched = remainingPlayers.filter(
                p => !teammates.includes(p.id) && p.team !== player.team
            );

            const nextPlayer =
                notMatched.length > 0
                    ? notMatched[0]
                    : remainingPlayers.find(p => p.team !== player.team) || remainingPlayers[0];

            if (nextPlayer) {
                cart.push(nextPlayer);
                playerMatchTracker.get(player.id).add(nextPlayer.id);
                playerMatchTracker.get(nextPlayer.id).add(player.id);
                remainingPlayers.splice(remainingPlayers.indexOf(nextPlayer), 1);
            }
        }
    }

    return [cartOne, cartTwo];
}

function updateFoursomesTab() {
    const foursomes = StateManager.get('draftData').foursomes;
    const courses = StateManager.get('courses');
    const $foursomesContainer = $('#foursomes-container').empty();

    Object.entries(foursomes).forEach(([courseId, foursomes]) => {
        const course = courses.find(c => c.id === courseId);

        const courseElement = $(`
            <div class="course-foursome">
                <h4>${course.name}</h4>
                <img src="${course.image}" alt="${course.name}" class="img-fluid rounded mb-3">
            </div>
        `);

        foursomes.forEach((foursome, index) => {
            const groupElement = $(`
                <div class="foursome-group">
                    <h5>Foursome ${index + 1}</h5>
                </div>
            `);

            [foursome.cartOne, foursome.cartTwo].forEach((cart, cartIndex) => {
                const cartElement = $(`
                    <div class="cart-group">
                        <h6>Cart ${cartIndex + 1}</h6>
                    </div>
                `);

                cart.forEach(player => {
                    cartElement.append(`
                        <div class="player-entry d-flex align-items-center">
                            <img src="${player.team === 'teamOne' ? TEAM_LOGOS.teamOne : TEAM_LOGOS.teamTwo}" 
                                 alt="${player.team} Logo" 
                                 style="width: 50px; height: 50px; margin-right: 10px;">
                            <span>${player.name} (${player.handicap})</span>
                        </div>
                    `);
                });

                groupElement.append(cartElement);
            });

            courseElement.append(groupElement);
        });

        $foursomesContainer.append(courseElement);
    });

    console.log('Foursomes tab updated.');
}
