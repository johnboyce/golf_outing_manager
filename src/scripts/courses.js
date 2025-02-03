$(document).ready(function () {
    setupCoursesTab();
});

function setupCoursesTab() {
    $(".nav-link[href='#courses-tab']").on("click", function () {
        console.log("Courses tab clicked.");
        var coursesTab=$("#courses-tab");

        // Remove d-none to make sure the tab is visible
        coursesTab.removeClass("d-none");

        if (coursesTab.is(":empty")) {
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
    const coursesContainer = $("#courses-tab");
    coursesContainer.empty(); // Clear existing content

    if (!courses.length) {
        coursesContainer.append("<p class='text-muted'>No courses available.</p>");
        return;
    }

    let courseHtml = `<div class="row">`;

    courses.forEach(course => {
        courseHtml += `
            <div class="col-md-4">
                <div class="card shadow-sm">
                    <img src="${course.image}" class="card-img-top" alt="${course.name}">
                    <div class="card-body">
                        <h5 class="card-title"><i class="${course.icon}"></i> ${course.name}</h5>
                        <p class="card-text">${course.description}</p>
                    </div>
                </div>
            </div>
        `;
    });

    courseHtml += `</div>`;
    coursesContainer.append(courseHtml);
}
