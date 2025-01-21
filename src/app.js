// Global Setup
const API_GATEWAY_URL = 'https://4epgafkkhl.execute-api.us-east-1.amazonaws.com';
const TEAM_LOGOS = {
    teamOne: 'https://www.pngkey.com/png/full/946-9467891_golf-ball-on-tee-png.png',
    teamTwo: 'https://svgsilh.com/png-512/2027506-009688.png',
};

$(document).ready(() => {
    initializeTabs();
});

// Initialize Tabs
function initializeTabs() {
    $('#players-tab').on('click', () => loadTabContent('players', 'playersTab.html', 'playersTab.js'));
    $('#draft-tab').on('click', () => loadTabContent('draft', 'draftTab.html', 'draft.js'));
    $('#foursomes-tab').on('click', () => loadTabContent('foursomes', 'foursomesTab.html', 'foursomes.js'));
    $('#courses-tab').on('click', () => loadTabContent('courses', 'coursesTab.html', 'courses.js'));

    // Load default tab
    loadTabContent('players', 'playersTab.html', 'playersTab.js');
}

// Load Tab Content and JavaScript Dynamically
function loadTabContent(tabId, contentUrl, scriptUrl) {
    $('#tabs-content').html('<div class="text-center">Loading...</div>');
    $.get(contentUrl)
        .done(html => {
            $('#tabs-content').html(html);
            $.getScript(scriptUrl);
        })
        .fail(() => {
            $('#tabs-content').html(`<div class="text-danger">Error loading content for ${tabId}.</div>`);
        });
}
