// Global Setup
const API_GATEWAY_URL = 'https://4epgafkkhl.execute-api.us-east-1.amazonaws.com';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeTabs();
});

// Initialize Tabs
function initializeTabs() {
    const playersTab = document.getElementById('players-tab');
    const draftTab = document.getElementById('draft-tab');
    const foursomesTab = document.getElementById('foursomes-tab');
    const coursesTab = document.getElementById('courses-tab');

    if (playersTab) {
        playersTab.addEventListener('click', () => loadTabContent('players', 'playersTab.html'));
    }
    if (draftTab) {
        draftTab.addEventListener('click', () => loadTabContent('draft', 'draftTab.html'));
    }
    if (foursomesTab) {
        foursomesTab.addEventListener('click', () => loadTabContent('foursomes', 'foursomesTab.html'));
    }
    if (coursesTab) {
        coursesTab.addEventListener('click', () => loadTabContent('courses', 'coursesTab.html'));
    }

    // Load default tab
    loadTabContent('players', 'playersTab.html');
}

// Load Tab Content Dynamically
function loadTabContent(tabId, contentUrl) {
    const tabsContent = document.getElementById('tabs-content');
    tabsContent.innerHTML = '<div class="text-center">Loading...</div>';

    fetch(contentUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${contentUrl}`);
            return response.text();
        })
        .then(html => {
            tabsContent.innerHTML = html;

            // Reinitialize scripts for the specific tab
            if (tabId === 'players') initializePlayersTab();
            if (tabId === 'draft') initializeDraftTab();
            if (tabId === 'foursomes') initializeFoursomesTab();
            if (tabId === 'courses') initializeCoursesTab();
        })
        .catch(error => {
            console.error(error);
            tabsContent.innerHTML = `<div class="text-danger">Error loading content for ${tabId}.</div>`;
        });
}

// Event Listeners
function setupEventListeners() {
    console.log('Setting up global event listeners...');
    // Add any global event listeners if needed
}

// Players Tab Initialization
function initializePlayersTab() {
    console.log('Initializing Players Tab...');
    fetchPlayers();
}

// Draft Tab Initialization
function initializeDraftTab() {
    console.log('Initializing Draft Tab...');
    fetchPlayersForDraft();
}

// Foursomes Tab Initialization
function initializeFoursomesTab() {
    console.log('Initializing Foursomes Tab...');
    // Placeholder for foursomes tab initialization
}

// Courses Tab Initialization
function initializeCoursesTab() {
    console.log('Initializing Courses Tab...');
    // Placeholder for courses tab initialization
}

// Fetch Players for Draft
function fetchPlayersForDraft() {
    console.log('Fetching players for draft...');
    fetch(`${API_GATEWAY_URL}/players`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch players for draft');
            return response.json();
        })
        .then(players => {
            console.log('Players fetched for draft:', players);
            initializeDraft(players);
        })
        .catch(error => {
            console.error('Error fetching players for draft:', error);
        });
}
