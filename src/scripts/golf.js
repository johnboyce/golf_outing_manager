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
