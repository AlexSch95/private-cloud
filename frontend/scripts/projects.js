import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

async function initApp() {
    const authStatus = await checkAuth();
    const loginStatusContainer = document.getElementById("loginStatusContainer");
    if (!authStatus.success) {
        loginStatusContainer.innerHTML = `<a class="btn btn-info shadow" role="button" href="/login.html">Anmelden</a>`;
        return;
    }
    loginStatusContainer.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-info shadow dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Verwalten
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/add-project.html">Projekt hinzufügen</a></li>
                <li><a class="dropdown-item" href="/pictures.html">Screenshots verwalten</a></li>
                <li><a class="dropdown-item" id="logoutButton" href="#">Abmelden</a></li>
            </ul>
        </div>`;
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
        showFeedback({ success: false, message: error.message })
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
                                <img src="${parsedImages[0]}" class="d-block w-100 projectPic" alt="Projekt Bild 1">
                            </div>
                            <div class="carousel-item">
                                <img src="${parsedImages[1]}" class="d-block w-100 projectPic" alt="Projekt Bild 2">
                            </div>
                            <div class="carousel-item">
                                <img src="${parsedImages[2]}" class="d-block w-100 projectPic" alt="Projekt Bild 3">
                            </div>
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

// document.addEventListener("click", function (event) {
//     if (event.target.classList.contains("projectPic")) {
//         picLink = event.target.src
        
//     }
// });

document.addEventListener("click", function (event) {
    let target = event.target;
    let linkElement = target.closest('a[data-readme]');

    if (linkElement) {
        event.stopPropagation();
        event.preventDefault();
        openReadmeModal(linkElement.getAttribute('data-readme'));
    }
})


async function openReadmeModal(readmeLink) {
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

document.addEventListener("click", function (event) {
    const fullscreenBtn = event.target.closest('.fullscreenImageBtn');
    if (fullscreenBtn) {
        const projectId = fullscreenBtn.id.split('-')[1];
        const project = projectsData.find(p => p.project_id === parseInt(projectId));
        openCarouselModal(project);
    }
});

function openCarouselModal(project) {
    const modalHtml = `
        <div class="modal fade" id="carouselModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content bg-transparent border-0 h-100 d-flex align-items-center justify-content-center">
                    <div style="max-height: 90vh; max-width: 90vw;">
                        <div id="modalCarousel-${project.project_id}" class="carousel slide">
                            <div class="carousel-indicators">
                                ${JSON.parse(project.images).map((_, index) => `
                                    <button type="button" data-bs-target="#modalCarousel-${project.project_id}" data-bs-slide-to="${index}" 
                                        class="${index === 0 ? 'active' : ''}" aria-label="Slide ${index + 1}"></button>
                                `).join('')}
                            </div>
                            <div class="carousel-inner h-100">
                                <button type="button" class="btn btn-info position-absolute top-0 end-0 m-3" 
                                    style="z-index: 1050;" data-bs-dismiss="modal" aria-label="Close">Schließen</button>
                                ${JSON.parse(project.images).map((img, index) => `
                                    <div class="carousel-item h-100 ${index === 0 ? 'active' : ''}">
                                        <img src="${img}" class="d-block mx-auto h-100" style="object-fit: contain;" alt="Projekt Bild ${index + 1}">
                                    </div>
                                `).join('')}
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
    const existingModal = document.getElementById('carouselModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Füge neues Modal hinzu und zeige es an
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('carouselModal'));
    modal.show();
}