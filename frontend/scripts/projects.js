import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

async function initApp() {
    const authStatus = await checkAuth();
    const loginStatusContainer = document.getElementById("loginStatusContainer");
    if (!authStatus.success) {
        loginStatusContainer.innerHTML = `<a class="btn btn-info btn-danger shadow" role="button" href="/login.html">Anmelden</a>`;
        return;
    }
    loginStatusContainer.innerHTML = `<a class="btn btn-info btn-danger shadow" id="logoutButton" role="button" href="#">Abmelden</a>`;
    document.getElementById('logoutButton')?.addEventListener('click', logout);
}

initApp();


// desc: Container def
const projectContainer = document.getElementById("projectContainer");
let projectsData = [];

getProjects();

async function getProjects() {
    try {
        const response = await fetch(`/api/projects/all`);
        const data = await response.json();
        const responseFromApi = data
        showFeedback(responseFromApi);
        projectsData = responseFromApi.projects;
        renderProjects(projectsData);
    } catch (error) {
        console.log(errror);
        showFeedback({success: false, message: error.message})
    }
}


function renderProjects(projects) {
    projectContainer.innerHTML = "";
    projects.forEach((project) => {
        const col = document.createElement("div");
        console.log(project.images);
        const parsedImages = JSON.parse(project.images);
        col.className = "col-lg-6 mb-5";
        col.innerHTML = `
                <div class="card bg-dark shadow-sm text-white project-card h-100 w-100">
                    <div id="projectCarousel-${project.project_id}" class="carousel slide">
                        <div class="carousel-indicators">
                            <button type="button" data-bs-target="#projectCarousel-${project.project_id}" data-bs-slide-to="0" class="active"
                                aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#projectCarousel-${project.project_id}" data-bs-slide-to="1"
                                aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#projectCarousel-${project.project_id}" data-bs-slide-to="2"
                                aria-label="Slide 3"></button>
                        </div>
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <img src="${parsedImages[0]}" class="d-block w-100" alt="Projekt Bild 1">
                            </div>
                            <div class="carousel-item">
                                <img src="${parsedImages[1]}" class="d-block w-100" alt="Projekt Bild 2">
                            </div>
                            <div class="carousel-item">
                                <img src="${parsedImages[2]}" class="d-block w-100" alt="Projekt Bild 3">
                            </div>
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel-${project.project_id}"
                            data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Zurück</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel-${project.project_id}"
                            data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Weiter</span>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="row">

                            <h5 class="card-title col" id="previewTitle-${project.project_id}">${project.title}</h5><small
                                class="mb-2 text-end col" id="previewStatus-${project.project_id}">${project.status}</small>
                        </div>
                        <p class="card-text" id="previewDescription-${project.project_id}">${project.description}</p>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-end social-icons gap-2">
                            <a href="" data-readme="${project.readmeLink}" aria-label="ProjectInfo" id="previewProjectInfoLink-${project.project_id}"><i
                                    class="bi bi-info-circle"></i></a>
                            <a href="${project.githubLink}" aria-label="GitHub" id="previewGithubLink-${project.project_id}"><i
                                    class="fab fa-github text-white"></i></a>
                        </div>
                    </div>
                </div>
                `;
                projectContainer.appendChild(col);
    });
}

document.addEventListener("click", function(event) {
    let target = event.target;
    let linkElement = target.closest('a[data-readme]');

    if (linkElement) {
        event.stopPropagation();
        event.preventDefault();
        openReadmeModal(linkElement.getAttribute('data-readme'));
    }
})


async function openReadmeModal(readmeLink) {
    console.log(readmeLink);
  const readmeContentDiv = document.getElementById("readmeContent");
  const readmeModal = document.getElementById("readmeModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  if (!readmeLink) {
    showFeedback({ success: false, message: "Kein Link zur README.md angegeben." });
    return;
  }
  try {
    const response = await fetch(readmeLink);
    console.log(response);
    if (!response.ok) {
      throw new Error("Fehler beim Laden der README.md");
    }
    const readmeContent = await response.text();
    console.log(readmeContent);
    readmeContentDiv.innerHTML = marked.parse(readmeContent);
    readmeModal.classList.add("show");
    modalBackdrop.classList.add("show");
  } catch (error) {
    showFeedback({ success: false, message: "Bitte README Link überprüfen" });
  }
};

document.getElementById("readmeModalCloseBtn").addEventListener("click", () => {
  document.getElementById("readmeModal").classList.remove("show");
  document.getElementById("modalBackdrop").classList.remove("show");
  const readmeContentDiv = document.getElementById("readmeContent");
  readmeContentDiv.innerHTML = "";
});