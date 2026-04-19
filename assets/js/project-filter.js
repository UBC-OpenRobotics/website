const dropdownIcon = document.getElementById("dropdownIcon");
// const allProjects = document.getElementById("allProjectsCheckbox");
const legacy = document.getElementById("legacyCheckbox");
const pioneering = document.getElementById("pioneeringCheckbox");
const subproject = document.getElementById("subprojectCheckbox");
const projects = document.querySelectorAll(".project-box");
const filterDropdown = document.getElementById("filterDropdown");
const subprojectDropdown = document.getElementById("subprojectDropdown");


legacy.addEventListener("change", () => {
    const legacyChecked = legacy.checked;
    // const pioneeringChecked = pioneering.checked;
    // allProjects.checked = (legacyChecked && pioneeringChecked);
    if (legacyChecked == false) {
        subproject.checked = legacyChecked;
    }
    subprojectDropdown.classList.toggle('hidden', !legacyChecked);
    filterProjects();
});
pioneering.addEventListener("change", () => {
    const legacyChecked = legacy.checked;
    // const pioneeringChecked = pioneering.checked;
    // allProjects.checked = (legacyChecked && pioneeringChecked);
    filterProjects();
});
subproject.addEventListener("change", () => {
    filterProjects();
})

function displayDropdown() {
    filterDropdown.classList.toggle("hidden");
    if (filterDropdown.classList.contains("hidden")) {
        legacy.checked = false;
        pioneering.checked = false;
        subproject.checked = false;
        subprojectDropdown.classList.add("hidden");
        filterProjects();
    }
}

const pioneeringStatus = ["active"]
const legacyStatus = ["on hold", "completed", "archived"]

function filterProjects() {
    const legacyChecked = legacy.checked;
    const pioneeringChecked = pioneering.checked;
    const subprojectChecked = subproject.checked;

    projects.forEach(project => {
        const status = project.dataset.status.trim();
        const layout = project.dataset.layout.trim();
        if (layout == "project-main") {
            if (!legacyChecked && !pioneeringChecked) {
                project.classList.remove('hidden');
                return
            } else {
                let visible = false;
    
                if (legacyChecked && legacyStatus.includes(status)) {
                    visible = true;
                }
    
                if (pioneeringChecked && pioneeringStatus.includes(status)) {
                    visible = true;
                }
    
                project.classList.toggle("hidden", !visible);
            }
        } else {
            if (subprojectChecked) {
                project.classList.remove('hidden');
            } else {
                project.classList.add('hidden');
            }
        }
    })
}