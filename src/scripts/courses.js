$(document).ready(function () {
    setupCoursesTab();
});

function setupCoursesTab() {
    $(".nav-link[href='#courses-tab']").on("click", function () {
        console.log("Courses tab clicked.");
        var coursesTab = $("#courses-tab");

        // Remove d-none to make sure the tab is visible
        coursesTab.removeClass("d-none");

        if ($("#courses-carousel-inner").children().length === 0) {
            loadCourses();
        }
    });
}

function loadCourses() {
    console.log("Fetching courses from API...");

    $.ajax({
        url: `${API_GATEWAY_URL}/courses`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log("Courses fetched:", data);
            renderCourses(data);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching courses:", error);
            $("#courses-tab").html(`<p class="text-danger">Failed to load courses.</p>`);
        }
    });
}

function renderCourses(courses) {
    const carouselInner = $("#courses-carousel-inner");
    carouselInner.empty(); // Clear existing content

    if (!courses.length) {
        carouselInner.append("<p class='text-muted'>No courses available.</p>");
        return;
    }

    courses.forEach((course, index) => {
        const isActive = index === 0 ? "active" : "";
        const courseItem = `
            <div class="carousel-item ${isActive}">
                <div class="card mx-auto shadow-sm" style="max-width: 80%;">
                    <img src="${course.image}" class="card-img-top" alt="${course.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title"><i class="${course.icon}"></i> ${course.name}</h5>
                        <p class="card-text">${course.description}</p>
                    </div>
                </div>
            </div>
        `;
        carouselInner.append(courseItem);
    });

    // Initialize the Bootstrap carousel
    new bootstrap.Carousel(document.getElementById("coursesCarousel"), {
        interval: 3000, // Auto-slide every 3 seconds
        wrap: true
    });
}
