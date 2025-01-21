// Global Constants
const API_GATEWAY_URL = 'https://4epgafkkhl.execute-api.us-east-1.amazonaws.com';
const TEAM_LOGOS = {
    teamOne: 'https://www.pngkey.com/png/full/946-9467891_golf-ball-on-tee-png.png',
    teamTwo: 'https://svgsilh.com/png-512/2027506-009688.png',
};

// On DOM Ready
$(document).ready(() => {
    console.log('Initializing application...');
    initializeTabs();
});

// Initialize Tabs
function initializeTabs() {
    console.log('Setting up tab navigation...');
    $('#players-tab').on('click', () => loadTabContent('players', 'playersTab.html', 'playersTab.js'));
    $('#draft-tab').on('click', () => loadTabContent('draft', 'draftTab.html', 'draft.js'));
    $('#foursomes-tab').on('click', () => loadTabContent('foursomes', 'foursomesTab.html', 'foursomes.js'));
    $('#courses-tab').on('click', () => loadTabContent('courses', 'coursesTab.html', 'courses.js'));

    // Load the default tab (Players Tab)
    loadTabContent('players', 'playersTab.html', 'playersTab.js');
}

// Load Tab Content
function loadTabContent(tabId, contentUrl, scriptUrl) {
    const $tabsContent = $('#tabs-content');
    $tabsContent.html('<div class="text-center">Loading...</div>');

    $.get(contentUrl)
        .done(html => {
            $tabsContent.html(html);
            loadTabScript(scriptUrl, tabId);
        })
        .fail(() => {
            $tabsContent.html(`<div class="text-danger">Error loading ${tabId} content. Please try again.</div>`);
        });
}

// Load JavaScript for Tab
function loadTabScript(scriptUrl, tabId) {
    const existingScript = $(`script[src="${scriptUrl}"]`);
    if (existingScript.length > 0) {
        console.log(`Script ${scriptUrl} is already loaded.`);
        invokeTabSpecificFunction(tabId);
        return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.onload = () => {
        console.log(`Loaded ${scriptUrl}`);
        invokeTabSpecificFunction(tabId);
    };
    script.onerror = () => {
        console.error(`Failed to load ${scriptUrl}`);
    };
    document.body.appendChild(script);
}

// Invoke Tab-Specific Initialization
function invokeTabSpecificFunction(tabId) {
    switch (tabId) {
        case 'players':
            if (typeof initializePlayersTab === 'function') initializePlayersTab();
            break;
        case 'draft':
            if (typeof initializeDraftTab === 'function') initializeDraftTab();
            break;
        case 'foursomes':
            if (typeof initializeFoursomesTab === 'function') initializeFoursomesTab();
            break;
        case 'courses':
            if (typeof initializeCoursesTab === 'function') initializeCoursesTab();
            break;
        default:
            console.warn(`No specific initialization found for tab: ${tabId}`);
    }
}
