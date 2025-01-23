// Players Carousel Initialization
$(document).ready(() => {
    initializePlayersCarousel();
});

function initializePlayersCarousel() {
    console.log('Initializing Players Carousel...');
    fetchPlayersForCarousel();
}

function fetchPlayersForCarousel() {
    console.log('Fetching players for the carousel...');
    $.getJSON(`${API_GATEWAY_URL}/players`)
        .done(players => {
            if (Array.isArray(players)) {
                populatePlayersCarousel(players);
            } else {
                console.error('Unexpected response format:', players);
                displayCarouselError();
            }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error(`Error fetching players: ${textStatus}`, errorThrown);
            displayCarouselError();
        });
}

function populatePlayersCarousel(players) {
    const $carouselInner = $('#carousel-inner');
    $carouselInner.empty();

    players.forEach((player, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const playerSlide = `
            <div class="carousel-item ${activeClass}">
                <div class="text-center">
                    <img src="${player.profileImage}" alt="${player.name}" class="d-block mx-auto rounded-circle" style="width: 150px; height: 150px;">
                    <h5>${player.name} (${player.nickname})</h5>
                    <p class="text-muted">${player.bio}</p>
                    <small class="text-info">${player.prediction}</small>
                </div>
            </div>
        `;
        $carouselInner.append(playerSlide);
    });

    // Start the carousel
    $('#players-carousel').carousel();
}

function displayCarouselError() {
    const $carouselInner = $('#carousel-inner');
    $carouselInner.html('<div class="alert alert-danger">Failed to load player profiles. Please try again later.</div>');
}
