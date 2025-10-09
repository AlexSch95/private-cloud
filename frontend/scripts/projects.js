import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

async function initApp() {
  const authStatus = await checkAuth();
  const loginStatusContainer = document.getElementById("loginStatusContainer");
  if (!authStatus.success) {
    loginStatusContainer.innerHTML = "<a class='btn btn-info shadow' role='button' href='/login.html'>Anmelden</a>";
    return;
  }
  loginStatusContainer.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-info shadow dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Verwalten
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/add-project.html">Projekt hinzufügen</a></li>
                <li><a class="dropdown-item" id="logoutButton" href="#">Abmelden</a></li>
            </ul>
        </div>`;
  document.getElementById("logoutButton")?.addEventListener("click", logout);
}

initApp();


// desc: Container def
const projectContainer = document.getElementById("projectContainer");
const maximizedProjectContainer = document.getElementById("maximizedProjectContainer");
let projectsData = [];

getProjects();

async function getProjects() {
  try {
    const response = await fetch("/api/projects/all");
    const data = await response.json();
    const responseFromApi = data;
    projectsData = responseFromApi.projects;
    renderProjects(projectsData);
  } catch (error) {
    console.error("Fehler beim Laden der Projekte:", error);
    showFeedback({ success: false, message: "Fehler beim Laden der Projekte" });
  }
}


function renderProjects(projects) {
  projectContainer.innerHTML = "";
  projects.forEach((project) => {
    const col = document.createElement("div");
    const parsedImages = JSON.parse(project.images);
    col.className = "col-lg-6 mb-5";
    col.innerHTML = `
            <div class="card bg-dark shadow-sm text-white project-card h-100 w-100 rounded-3 project-mini-card" data-projectid="${project.project_id}">
                <!-- Bild oben, nimmt volle Breite ein und bleibt komplett sichtbar -->
                <div class="w-100 mini-card-imagediv">
                    <img 
                        src="${parsedImages[0]}" 
                        class="projectPic"
                        alt="Projekt Bild"
                    >
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="row">
                        <h4 class="col mb-4" id="previewTitle-${project.project_id}">${project.title}</h4>
                    </div>
                    <p class="card-text" id="previewDescription-${project.project_id}">${project.description}</p>
                </div>
            </div>
        `;
    projectContainer.appendChild(col);
  });
}

projectContainer.addEventListener("click", function (event) {
  let target = event.target;
  let card = target.closest(".project-mini-card");
  let dataProjectId = card.dataset.projectid;

  if (dataProjectId) {
    event.stopPropagation();
    event.preventDefault();
    const projectId = dataProjectId;
    const project = projectsData.find(p => p.project_id === parseInt(projectId));
    projectMaximize(project);
  }
});

async function getReadmeContent(readmeLink) {
  try {
    const response = await fetch(readmeLink);
    if (!response.ok) {
      throw new Error("Fehler beim Laden der README.md");
    }
    const readmeContent = await response.text();
    return marked.parse(readmeContent);
  } catch (error) {
    console.error("Fehler beim Laden der README.md:", error);
    showFeedback({ success: false, message: "Fehler beim Laden der README.md" });
  }
}

async function projectMaximize(project) {
  projectContainer.innerHTML = "";
  const parsedImages = JSON.parse(project.images);
  const technologies = JSON.parse(project.techstack);
  let descriptionContent = project.description;
  if (project.readmeLink.length > 0) {
    descriptionContent = await getReadmeContent(project.readmeLink);
  }
  maximizedProjectContainer.innerHTML = `
                <div class="card bg-dark shadow-sm text-white project-card h-100 w-75 rounded-3 mx-auto">
                        <div class="card-header d-flex align-items-center">
                        <button type="button" class="btn btn-link text-white p-0 me-2" style="font-size:1.5rem;" id="backButton">
                            <i class="bi bi-arrow-left"></i>
                        </button>
                        <span class="fw-bold">${project.title}</span>
                    </div>
    ${parsedImages.length === 1
    ?
    `<div class="carousel-inner" style="width:100%;height:0;padding-bottom:56.25%;position:relative;">
       <img src="${parsedImages[0]}" class="d-block projectPic" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;display:block;margin:auto;" alt="Projekt Bild 1">
    </div>`
    :
    `<div id="projectCarousel-${project.project_id}" class="carousel slide">
                            <div class="carousel-indicators">
                                ${parsedImages.map((_, index) => `
                                    <button type="button" data-bs-target="#projectCarousel-${project.project_id}" 
                                        data-bs-slide-to="${index}" 
                                        class="${index === 0 ? "active" : ""}"
                                        aria-current="${index === 0 ? "true" : "false"}"
                                        aria-label="Slide ${index + 1}">
                                    </button>
                                `).join("")}
                            </div>
                            <div class="carousel-inner" style="width:100%;height:0;padding-bottom:56.25%;position:relative;">
                                ${parsedImages.map((img, index) => `
                                    <div class="carousel-item ${index === 0 ? "active" : ""}" style="position:absolute;top:0;left:0;width:100%;height:100%;">
                                        <img src="${img}" class="d-block projectPic" style="width:100%;height:100%;object-fit:contain;display:block;margin:auto;position:absolute;top:0;left:0;" alt="Projekt Bild ${index + 1}">
                                    </div>
                                `).join("")}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel-${project.project_id}"
                                data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Zurück</span>
                            </button>
                            <button class="carousel-control-center position-absolute top-50 start-50 translate-middle border-0 bg-transparent text-white fs-3 fullscreenImageBtn"
                                type="button" id="fullscreenBtn-${project.project_id}">
                                <i class="bi bi-fullscreen shadow"></i>
                                <span class="visually-hidden">Vollbild</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel-${project.project_id}"
                                data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Weiter</span>
                            </button>
                        </div>`}
                    <div class="card-body d-flex flex-column">
                        <div class="row">

                            <h4 class="col mb-4" id="previewTitle-${project.project_id}">${project.title}</h4><small
                                class="mb-2 text-end col" id="previewStatus-${project.project_id}">${project.status}</small>
                        </div>
                        <p class="card-text" id="previewDescription-${project.project_id}">${descriptionContent}</p>
                        <hr>
                        <p class="card-text">Technologien:</p>
                        <span class="text-white" class="techstack">${technologies.map(tech => `<span class="badge btn btn-outline-info me-2 mb-2 rounded-5 shadow p-2">${tech}</span>`).join("")}</span>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-end social-icons gap-2">
                            ${project.githubLink.length > 0 ? `<a href="${project.githubLink}" aria-label="GitHub" id="previewGithubLink-${project.project_id}"><i
                                    class="fab fa-github text-white"></i></a>` : ""}
                        </div>
                    </div>
                </div>
                `;
  document.getElementById("backButton").addEventListener("click", function () {
    maximizedProjectContainer.innerHTML = "";
    getProjects();
  });
}


document.addEventListener("click", function (event) {
  const fullscreenBtn = event.target.closest(".fullscreenImageBtn");
  if (fullscreenBtn) {
    const projectId = fullscreenBtn.id.split("-")[1];
    const project = projectsData.find(p => p.project_id === parseInt(projectId));
    openCarouselModal(project);
  }
});

function openCarouselModal(project) {
  const modalHtml = `
        <div class="modal fade" id="carouselModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content border-0 h-100 d-flex align-items-center justify-content-center" style="background-color: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);">
                    <div style="width: 80vw; height: 80vh;">
                        <div id="modalCarousel-${project.project_id}" class="carousel slide h-100">
                            <div class="carousel-indicators">
                                ${JSON.parse(project.images).map((_, index) => `
                                    <button type="button" data-bs-target="#modalCarousel-${project.project_id}" data-bs-slide-to="${index}" 
                                        class="${index === 0 ? "active" : ""}" aria-label="Slide ${index + 1}"></button>
                                `).join("")}
                            </div>
                            <div class="carousel-inner h-100">
                                <button type="button" class="btn btn-carousel-modal position-absolute top-0 start-50 translate-middle-x mt-3" 
                                    style="z-index: 1050;" data-bs-dismiss="modal" aria-label="Close">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                                ${JSON.parse(project.images).map((img, index) => `
                                    <div class="carousel-item h-100 ${index === 0 ? "active" : ""}">
                                        <div class="d-flex align-items-center justify-content-center h-100">
                                            <img src="${img}" style="max-width: 80vw; max-height: 80vh; width: auto; height: auto; object-fit: contain;" alt="Projekt Bild ${index + 1}">
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#modalCarousel-${project.project_id}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Zurück</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#modalCarousel-${project.project_id}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Weiter</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Entferne existierendes Modal falls vorhanden
  const existingModal = document.getElementById("carouselModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Füge neues Modal hinzu und zeige es an
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const modal = new bootstrap.Modal(document.getElementById("carouselModal"));
  modal.show();
}