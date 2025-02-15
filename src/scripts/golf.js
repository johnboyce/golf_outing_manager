$(document).ready(() => {
    initializeGolfUI();
});

// Initialize Golf UI Controls
function initializeGolfUI() {
    console.log('Initializing Golf UI...');

    // Tab Navigation
    setupTabNavigation();

    // Responsive Menu (if applicable)
    setupResponsiveMenu();

    // Additional Enhancements
    enhanceUI();
}

// Tab Navigation Logic
function setupTabNavigation() {
    console.log('Setting up tab navigation...');

    // Handle tab clicks
    $('.nav-link').on('click', function (e) {
        e.preventDefault();
        const targetTab = $(this).attr('href');

        // Show the clicked tab
        $('.tab-pane').removeClass('show active');
        $(targetTab).addClass('show active');

        // Update active link
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        // Load courses when the "Courses" tab is clicked
        if (targetTab === '#courses-tab') {
            loadCourses();
        }
        // Load latest draft when "Draft" tab is clicked
        if (targetTab === '#drafts-tab') {
            console.log("Draft tab clicked. Checking for latest draft...");
            // ✅ Show the Draft UI (if hidden)
            $('#draft-section').removeClass('d-none');
            const draftData = StateManager.get("draftData");
            if (draftData) {
                console.log("Existing draft data found. Updating UI...");
                updateDraftUI();  // ✅ Update UI if draft is already stored
                updateDraftTabUI();
            } else {
                console.log("No draft data found. Fetching latest draft...");
                // loadLatestDraft();  // ✅ Fetch latest draft from API
            }
        }

        // ✅ Load the latest foursomes when the "Foursomes" tab is clicked
        // ✅ Load Foursome UI only if needed
        if (targetTab === '#foursomes-tab') {
            console.log("Foursome tab clicked.");

            // ✅ Ensure the Foursomes section is visible
            if ($("#foursomes-section").hasClass("d-none")) {
                console.log("Making Foursomes UI visible...");
                updateDraftTabUI();
                $("#foursomes-section").removeClass("d-none");
            }
            const draftData = StateManager.get("draftData");

            if (draftData && draftData.foursomes) {
                console.log("Updating Foursome UI with existing draft data...");
                updateFoursomesUI(draftData.foursomes);
            } else {
                console.log("No draft found, fetching latest draft...");
                fetchLatestDraft(() => {
                    const updatedDraft = StateManager.get("draftData");
                    if (updatedDraft?.foursomes) {
                        updateFoursomesUI(updatedDraft.foursomes);
                    }
                });
            }
        }

    });

    // Load the default tab (Players Tab)
    const defaultTab = '#players-tab';
    $(`.nav-link[href="${defaultTab}"]`).addClass('active');
    $(defaultTab).addClass('show active');
}

// Responsive Menu Setup (Optional)
function  setupResponsiveMenu() {
    console.log('Setting up responsive menu...');

    // Toggle menu visibility for smaller screens
    $('#menu-toggle').on('click', function () {
        $('#menu').toggleClass('d-none');
    });
}

// Additional UI Enhancements
function enhanceUI() {
    console.log('Enhancing UI...');

    // Example: Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 600);
        }
    });

    // Example: Sticky header (optional)
    const header = $('header');
    if (header.length) {
        $(window).on('scroll', function () {
            if ($(this).scrollTop() > 50) {
                header.addClass('sticky');
            } else {
                header.removeClass('sticky');
            }
        });
    }
}
