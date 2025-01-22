const COURSES = [
    {
        name: "Bear Trap Dunes",
        description: "A beautiful coastal course with stunning scenery and challenging holes.",
        image: "https://www.beartrapdunes.com/wp-content/uploads/sites/8962/2023/06/home-main-1.jpg"
    },
    {
        name: "War Admiral",
        description: "A legendary course featuring tight fairways and memorable design.",
        image: "https://example.com/war-admiral.jpg"
    },
    {
        name: "Man O War",
        description: "A wide-open course with breathtaking water features.",
        image: "https://example.com/man-o-war.jpg"
    },
    {
        name: "Lighthouse Sound",
        description: "Known for its panoramic views and challenging greens.",
        image: "https://example.com/lighthouse-sound.jpg"
    }
];

// Update the UI with hardcoded course data in the courses tab
function updateCoursesTab() {
    const $coursesContainer = $('#courses-container').empty();

    COURSES.forEach(course => {
        const courseHtml = `
            <div class="course-card">
                <img src="${course.image}" alt="${course.name}" style="width: 100%; height: auto;">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
            </div>
        `;
        $coursesContainer.append(courseHtml);
    });
}
