// desc: importiert auth, logout und feedback funktion
import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

let selectedImages = [];
let selectedTechstack = [];
let project = {
  title: "Projekttitel",
  description: "Projektbeschreibung",
  status: "In Entwicklung",
  readmeLink: "",
  githubLink: "#",
  images: ["/assets/img/placeholder.jpg"],
  techstack: ["Platzhalter"]
};

const miniPreviewContainer = document.getElementById("previewContainer");
const maxiPreviewContainer = document.getElementById("maxiPreviewContainer");

async function initApp() {
  const authStatus = await checkAuth();
  const loginStatusContainer = document.getElementById("loginStatusContainer");
  if (!authStatus.success) {
    window.location.href = "/login.html";
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
  renderPreview();
}

initApp();


// desc: Formularelemente definieren
const inputTitle = document.getElementById("projectTitle");
const inputDescription = document.getElementById("projectDescription");
const inputStatus = document.getElementById("projectStatus");
const inputReadmeLink = document.getElementById("readmeLink");
const inputGitHub = document.getElementById("githubLink");

document.getElementById("newprojectpreviewContainer").addEventListener("change", updatePreview);

async function renderPreview() {
  miniPreviewContainer.innerHTML = `
            <div class="card bg-dark shadow-sm text-white project-card h-100 w-100 rounded-3 project-mini-card" data-projectid="${project.project_id}">
                <!-- Bild oben, nimmt volle Breite ein und bleibt komplett sichtbar -->
                <div class="w-100 mini-card-imagediv">
                    <img 
                        src="${project.images.length > 0 ? project.images[0] : "/assets/img/placeholder.jpg"}" 
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
  let descriptionContent = project.description;
  if (project.readmeLink.length > 0) {
    descriptionContent = await getReadmeContent(project.readmeLink);
  }
  maxiPreviewContainer.innerHTML = `
                <div class="card bg-dark shadow-sm text-white project-card h-100 w-75 rounded-3 mx-auto">
                        <div class="card-header d-flex align-items-center">
                        <button type="button" class="btn btn-link text-white p-0 me-2" style="font-size:1.5rem;" id="backButton">
                            <i class="bi bi-arrow-left"></i>
                        </button>
                        <span class="fw-bold">${project.title}</span>
                    </div>
    ${project.images.length === 1
    ?
    `<div class="carousel-inner" style="width:100%;height:0;padding-bottom:56.25%;position:relative;">
       <img src="${project.images[0]}" class="d-block projectPic" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;display:block;margin:auto;" alt="Projekt Bild 1">
    </div>`
    :
    `<div id="projectCarousel-${project.project_id}" class="carousel slide">
                            <div class="carousel-indicators">
                                ${project.images.map((_, index) => `
                                    <button type="button" data-bs-target="#projectCarousel-${project.project_id}" 
                                        data-bs-slide-to="${index}" 
                                        class="${index === 0 ? "active" : ""}"
                                        aria-current="${index === 0 ? "true" : "false"}"
                                        aria-label="Slide ${index + 1}">
                                    </button>
                                `).join("")}
                            </div>
                            <div class="carousel-inner" style="width:100%;height:0;padding-bottom:56.25%;position:relative;">
                                ${project.images.map((img, index) => `
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
                        <span class="text-white" class="techstack">${project.techstack.map(tech => `<span class="badge btn btn-outline-info me-2 mb-2 rounded-5 shadow p-2">${tech}</span>`).join("")}</span>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-end social-icons gap-2">
                            ${project.githubLink.length > 0 ? `<a href="${project.githubLink}" aria-label="GitHub" id="previewGithubLink-${project.project_id}"><i
                                    class="fab fa-github text-white"></i></a>` : ""}
                        </div>
                    </div>
                </div>
                `;

};

document.getElementById("addImageButton").addEventListener("click", () => {
  const imageLink = document.getElementById("imageLinks").value;
  const picCounter = document.getElementById("picList");
  if (imageLink) {
    selectedImages.push(imageLink);
    document.getElementById("imageLinks").value = "";
    picCounter.innerText = `Hinzugefügte Bilder: ${selectedImages.length}`;
  }
  updatePreview();
});

document.getElementById("addTechButton").addEventListener("click", () => {
  updatePreview();
  const techInput = document.getElementById("techstackInput").value;
  const techDisplay = document.getElementById("techList");
  if (techInput) {
    selectedTechstack.push(techInput);
    document.getElementById("techstackInput").value = "";
    techDisplay.innerHTML = `${project.techstack.map(tech => `<span class="badge btn btn-outline-info me-2 mb-2 rounded-5 shadow p-2">${tech}</span>`).join("")}`;
  }
  updatePreview();
});

function updatePreview() {
  project.title = inputTitle.value;
  project.description = inputDescription.value;
  project.status = inputStatus.value;
  project.readmeLink = inputReadmeLink.value;
  project.githubLink = inputGitHub.value;
  project.images = selectedImages.length > 0 ? selectedImages : ["/assets/img/placeholder.jpg", "/assets/img/placeholder.jpg", "/assets/img/placeholder.jpg"];
  project.techstack = selectedTechstack.length >= 1 ? selectedTechstack : ["Platzhalter1", "Platzhalter2", "Platzhalter3"];
  renderPreview();
}

document.getElementById("addProject").addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch("/api/projects/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(project)
    });
    if (!response.ok) {
      throw new Error("Fehler beim Hinzufügen des Projekts");
    }
    const result = await response.json();
    showFeedback(result);
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Projekts:", error);
    showFeedback({ success: false, message: "Fehler beim Hinzufügen des Projekts" });
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


