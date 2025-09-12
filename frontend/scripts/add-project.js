// desc: importiert auth, logout und feedback funktion
import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

async function initApp() {
    const authStatus = await checkAuth();
    const loginStatusContainer = document.getElementById("loginStatusContainer");
    if (!authStatus.success) {
        window.location.href = "/login.html"
        return;
    }
    loginStatusContainer.innerHTML = `<a class="btn btn-info btn-danger shadow" id="logoutButton" role="button" href="#">Abmelden</a>`;
    document.getElementById('logoutButton')?.addEventListener('click', logout);
}

initApp();

// desc: Formularelemente definieren
const inputTitle = document.getElementById("projectTitle");
const inputDescription = document.getElementById("projectDescription");
const inputStatus = document.getElementById("projectStatus");
const inputReadmeLink = document.getElementById("readmeLink");
const inputGitHub = document.getElementById("githubLink");
const inputImage1 = document.getElementById("imageLink1");
const inputImage2 = document.getElementById("imageLink2");
const inputImage3 = document.getElementById("imageLink3");

// desc: Previewelemente definieren
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const previewStatus = document.getElementById("previewStatus");
const previewReadmeLink = document.getElementById("previewProjectInfoLink");
const previewGitHub = document.getElementById("previewGithubLink");
const previewImage1 = document.getElementById("previewImage1");
const previewImage2 = document.getElementById("previewImage2");
const previewImage3 = document.getElementById("previewImage3");

inputTitle.addEventListener("keyup", (event) => {
  previewTitle.innerText = event.target.value;
});

inputDescription.addEventListener("keyup", (event) => {
  previewDescription.innerText = event.target.value;
});

inputStatus.addEventListener("change", (event) => {
  previewStatus.innerHTML = event.target.value;
});

inputGitHub.addEventListener("keyup", (event) => {
  previewGitHub.href = event.target.value;
});

inputReadmeLink.addEventListener("keyup", (event) => {
  previewReadmeLink.dataset.readme = event.target.value;
});

inputImage1.addEventListener("keyup", (event) => {
  previewImage1.src = event.target.value;
});

inputImage2.addEventListener("keyup", (event) => {
  previewImage2.src = event.target.value;
});

inputImage3.addEventListener("keyup", (event) => {
  previewImage3.src = event.target.value;
});

document.getElementById("resetForm").addEventListener("click", (event) => {
  event.preventDefault();
  resetForm();
});


document.getElementById("addProject").addEventListener("click", async (event) => {
  event.preventDefault();
  const projectData = {
    title: inputTitle.value,
    description: inputDescription.value,
    status: inputStatus.value,
    readmeLink: inputReadmeLink.value,
    githubLink: inputGitHub.value,
    images: [
      inputImage1.value,
      inputImage2.value,
      inputImage3.value
    ]
  };
  console.log(JSON.stringify(projectData));
  try {
    const response = await fetch('/api/projects/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) {
      throw new Error('Fehler beim Hinzufügen des Projekts');
    }
    const result = await response.json();
    showFeedback(result);
    if (result.success) {
      resetForm();
    }
  } catch (error) {
    showFeedback({ success: false, message: error.message });
  }
});

function resetForm() {
  inputTitle.value = "";
  inputDescription.value = "";
  inputStatus.value = "In Entwicklung";
  inputReadmeLink.value = "";
  inputGitHub.value = "";
  inputImage1.value = "";
  inputImage2.value = "";
  inputImage3.value = "";
  previewTitle.innerText = "Projekttitel";
  previewDescription.innerText = "Projektbeschreibung";
  previewStatus.value = "In Entwicklung";
  previewImage1.src = "assets/img/placeholder.jpg";
  previewImage2.src = "assets/img/placeholder.jpg";
  previewImage3.src = "assets/img/placeholder.jpg";
  previewReadmeLink.dataset.readme = "";
  previewGitHub.href = "#";
}

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
    showFeedback({ success: false, message: "Bitte README Link überprüfen" });
  }
});

document.getElementById("readmeModalCloseBtn").addEventListener("click", () => {
  document.getElementById("readmeModal").classList.remove("show");
  document.getElementById("modalBackdrop").classList.remove("show");
  const readmeContentDiv = document.getElementById("readmeContent");
  readmeContentDiv.innerHTML = "";
});
