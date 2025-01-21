// Global Setup
const API_GATEWAY_URL = 'https://4epgafkkhl.execute-api.us-east-1.amazonaws.com';

const TEAM_LOGOS = {
    teamOne: 'https://www.pngkey.com/png/full/946-9467891_golf-ball-on-tee-png.png',
    teamTwo: 'https://svgsilh.com/png-512/2027506-009688.png',
};

const DEFAULT_TAB = 'players';
const DEFAULT_CONTENT_URL = 'playersTab.html';
const DEFAULT_SCRIPT_URL = 'playersTab.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeTabs();

    // Preload necessary tabs
    preloadTabContent('foursomes', 'foursomesTab.html', 'foursomes.js'); // Ensure foursomes DOM is preloaded
    loadTabContent(DEFAULT_TAB, DEFAULT_CONTENT_URL, DEFAULT_SCRIPT_URL);
});

// Initialize Tabs
function initializeTabs() {
    const tabs = [
        { id: 'players-tab', content: 'playersTab.html', script: 'playersTab.js' },
        { id: 'draft-tab', content: 'draftTab.html', script: 'draft.js' },
        { id: 'foursomes-tab', content: 'foursomesTab.html', script: 'foursomes.js' },
        { id: 'courses-tab', content: 'coursesTab.html', script: 'courses.js' },
    ];

    tabs.forEach(tab => {
        const tabElement = document.getElementById(tab.id);
        if (tabElement) {
            tabElement.addEventListener('click', () =>
                loadTabContent(tab.id.replace('-tab', ''), tab.content, tab.script)
            );
        } else {
            console.warn(`Tab element ${tab.id} is missing in the DOM.`);
        }
    });
}

// Preload Specific Tab Content
function preloadTabContent(tabId, contentUrl, scriptUrl) {
    const tabContent = document.getElementById('tabs-content');
    if (!tabContent) {
        console.error('Main tab content container (tabs-content) is missing.');
        return;
    }

    fetch(contentUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to preload ${contentUrl}`);
            return response.text();
        })
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.style.display = 'none'; // Hide the content, but add it to the DOM
            document.body.appendChild(tempDiv);

            // Load the corresponding JavaScript file
            loadScript(scriptUrl);
        })
        .catch(error => console.error(`Error preloading content for ${tabId}:`, error));
}

// Load Tab Content and JavaScript Dynamically
function loadTabContent(tabId, contentUrl, scriptUrl) {
    const tabsContent = document.getElementById('tabs-content');
    if (!tabsContent) {
        console.error('Main tab content container (tabs-content) is missing.');
        return;
    }

    tabsContent.innerHTML = '<div class="text-center">Loading...</div>';

    fetch(contentUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${contentUrl}`);
            return response.text();
        })
        .then(html => {
            tabsContent.innerHTML = html;

            // Load the corresponding JavaScript file
            loadScript(scriptUrl);

            // Ensure specific initialization logic
            if (tabId === 'draft') initializeDraftTab();
        })
        .catch(error => {
            console.error(`Error loading content for ${tabId}:`, error);
            tabsContent.innerHTML = `<div class="text-danger">Error loading content for ${tabId}.</div>`;
        });
}

// Load JavaScript File Dynamically
function loadScript(scriptUrl) {
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
        console.log(`Script ${scriptUrl} already loaded.`);
        return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.onload = () => console.log(`Loaded ${scriptUrl}`);
    script.onerror = () => console.error(`Failed to load ${scriptUrl}`);
    document.body.appendChild(script);
}

// Global Event Listeners
function setupEventListeners() {
    console.log('Setting up global event listeners...');
    // Add any global event listeners if needed
}
