// Call renderCourses when initializing the Courses tab
$(document).ready(() => {
    updateCoursesTab();
});

// Update the UI with hardcoded course data in the courses tab
function updateCoursesTab() {
    renderCourses();
}

function renderCourses() {
    const courses = StateManager.get('courses');
    const $coursesContainer = $('#courses-container').empty();

    courses.forEach(course => {
        const courseHTML = `
            <div class="course-card">
                <img src="${course.image}" alt="${course.name}" class="course-image">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
            </div>
        `;
        $coursesContainer.append(courseHTML);
    });
}

