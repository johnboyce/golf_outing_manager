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
        playersTab.addEventListener('click', () => loadTabContent('players', 'playersTab.html', 'playersTab.js'));
    }
    if (draftTab) {
        draftTab.addEventListener('click', () => loadTabContent('draft', 'draftTab.html', 'draft.js'));
    }
    if (foursomesTab) {
        foursomesTab.addEventListener('click', () => loadTabContent('foursomes', 'foursomesTab.html', 'foursomes.js'));
    }
    if (coursesTab) {
        coursesTab.addEventListener('click', () => loadTabContent('courses', 'coursesTab.html', 'courses.js'));
    }

    // Load default tab
    loadTabContent('players', 'playersTab.html', 'playersTab.js');
}

// Load Tab Content and JavaScript Dynamically
function loadTabContent(tabId, contentUrl, scriptUrl) {
    const tabsContent = document.getElementById('tabs-content');
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
            // Ensure the required elements are ready for the draft tab
            if (tabId === 'draft') initializeDraftTab();
        })
        .catch(error => {
            console.error(error);
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
