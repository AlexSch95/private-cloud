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
  images: ["/assets/img/placeholder.jpg", "/assets/img/placeholder.jpg", "/assets/img/placeholder.jpg"],
  techstack: ["Platzhalter1", "Platzhalter2", "Platzhalter3"]
};

const previewContainer = document.getElementById("previewContainer");

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
                <li><a class="dropdown-item" href="/pictures.html">Screenshots verwalten</a></li>
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

function renderPreview() {
  previewContainer.innerHTML = `
                <div class="card bg-dark shadow-sm text-white project-card h-100 w-100 rounded-3">
                    <div id="projectCarousel" class="carousel slide">
                        <div class="carousel-indicators">
                            ${project.images.map((_, index) => `
                                <button type="button" data-bs-target="#projectCarousel" 
                                    data-bs-slide-to="${index}" 
                                    class="${index === 0 ? "active" : ""}"
                                    aria-current="${index === 0 ? "true" : "false"}"
                                    aria-label="Slide ${index + 1}">
                                </button>
                            `).join("")}
                        </div>
                        <div class="carousel-inner">
                            ${project.images.map((img, index) => `
                                <div class="carousel-item ${index === 0 ? "active" : ""}">
                                    <img src="${img}" class="d-block w-100 projectPic" alt="Projekt Bild ${index + 1}">
                                </div>
                            `).join("")}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel"
                            data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Zurück</span>
                        </button>
                        <button class="carousel-control-center position-absolute top-50 start-50 translate-middle border-0 bg-transparent text-white fs-3 fullscreenImageBtn"
                            type="button" id="fullscreenBtn">
                            <i class="bi bi-fullscreen shadow"></i>
                            <span class="visually-hidden">Vollbild</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel"
                            data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Weiter</span>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="row">

                            <h4 class="col mb-4" id="previewTitle">${project.title}</h4><small
                                class="mb-2 text-end col" id="previewStatus">${project.status}</small>
                        </div>
                        <p class="card-text" id="previewDescription">${project.description}</p>
                        <hr>
                        <p class="card-text">Technologien:</p>
                        <span class="text-white" class="techstack">${project.techstack.map(tech => `<span class="badge btn btn-outline-info me-2 mb-2 rounded-5 shadow p-2">${tech}</span>`).join("")}</span>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-end social-icons gap-2">
                            <a data-readme="${project.readmeLink}" aria-label="ProjectInfo" id="previewProjectInfoLink"><i
                                    class="bi bi-info-circle"></i></a>
                            <a href="${project.githubLink}" aria-label="GitHub" id="previewGithubLink"><i
                                    class="fab fa-github text-white"></i></a>
                        </div>
                    </div>
                </div>
                `;
  readmeModalRegister();
}

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
  project.techstack = selectedTechstack.length > 0 ? selectedTechstack : ["Platzhalter1", "Platzhalter2", "Platzhalter3"];
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

function readmeModalRegister() {
  document.getElementById("previewProjectInfoLink").addEventListener("click", async () => {
    const readmeLink = document.getElementById("previewProjectInfoLink").dataset.readme;
    const readmeContentDiv = document.getElementById("readmeContent");
    if (!readmeLink) {
      showFeedback({ success: false, message: "Kein Link zur README.md angegeben." });
      return;
    }
    try {
      const response = await fetch(readmeLink);
      if (!response.ok) {
        throw new Error("Fehler beim Laden der README.md");
      }
      const readmeContent = await response.text();
      readmeContentDiv.innerHTML = marked.parse(readmeContent);
      const readmeModal = document.getElementById("readmeModal");
      const modalBackdrop = document.getElementById("modalBackdrop");
      readmeModal.classList.add("show");
      modalBackdrop.classList.add("show");
    } catch (error) {
      console.error("Fehler beim Laden der README.md:", error);
      showFeedback({ success: false, message: "Bitte README Link überprüfen" });
    }
  });
}

document.getElementById("readmeModalCloseBtn").addEventListener("click", () => {
  document.getElementById("readmeModal").classList.remove("show");
  document.getElementById("modalBackdrop").classList.remove("show");
  const readmeContentDiv = document.getElementById("readmeContent");
  readmeContentDiv.innerHTML = "";
});
