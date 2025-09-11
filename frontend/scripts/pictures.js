// desc: importiert auth, logout und feedback funktion
import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

const picContainer = document.getElementById("picContainer");
const filterContainer = document.getElementById("filterContainer");
document.getElementById('logout')?.addEventListener('click', logout);

let picsData = {};

// desc: initial wird erstmal der Cookie geprüft, je nach Ergebnis werden die Bilder geladen oder der Login angezeigt
async function initApp() {
  const authStatus = await checkAuth();
  console.log(authStatus);
  if (!authStatus.success) {
    showFeedback(authStatus);
    initLogin();
    return;
  }
  renderFilter();
  getPics();
}

initApp();

// desc: Hilfsvariable für Löschvorgang
let currentPictureId = null;

// desc: Modal für Löschbestätigung
function showCustomConfirm(pictureId) {
  currentPictureId = pictureId;
  document.getElementById('customConfirm').style.display = 'block';
}

document.getElementById('confirmYes').addEventListener('click', function () {
  deletePic(currentPictureId);
  document.getElementById('customConfirm').style.display = 'none';
});

document.getElementById('confirmNo').addEventListener('click', function () {
  console.log("Löschen abgebrochen");
  showFeedback({
    success: false,
    message: "Löschen abgebrochen"
  });
  document.getElementById('customConfirm').style.display = 'none';
});

// desc: lädt alle vorhandenen Bilder aus der DB
async function getPics() {
  try {
    const response = await fetch(`/api/pictures/all`);
    const data = await response.json();
    const responseFromApi = data;
    showFeedback(responseFromApi);
    picsData = responseFromApi.pictures;
    console.log(picsData);
    renderPics(picsData);
  } catch (error) {
    console.log(error);
    showFeedback({ success: false, message: error.message });
  }
}

//desc: Löschfunktion für Bilder nach bestätigung des Modals
async function deletePic(pictureId) {
  console.log(pictureId);
  try {
    const response = await fetch(`/api/pictures/delete/${pictureId}`, {
      method: "DELETE"
    });
    const data = await response.json();
    const responseFromApi = data;
    showFeedback(responseFromApi);
    currentPictureId = null;
    setTimeout(() => {
      getPics();
    }, 3000);
  } catch (error) {
    console.log(error);
    showFeedback({ success: false, message: error.message });
  }
}

//desc: Filterfunktion der Anzeige
function filterPics() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase().trim();
  const filteredPics = picsData.filter((pic) =>
    Object.values(pic).some(value => typeof value === 'string' && value.toLowerCase().includes(searchInput))
  );
  renderPics(filteredPics);
};

// desc: Zeigt die Filterkomponente an
function renderFilter() {
  filterContainer.innerHTML = `
          <div class="row justify-content-end mb-3">
            <div class="col-auto">
                <input type="text" class="form-control" placeholder="Suchen..." id="searchInput">
            </div>
          </div>
  `;
  document.getElementById("searchInput").addEventListener("input", filterPics);
}

//desc: Renderfunktion für das Array der Bildobjekte
function renderPics(localPics) {
  picContainer.innerHTML = "";
  localPics.forEach((pic) => {
    const timeString = pic.creation_time.replace("-", ":") + " Uhr";
    const dateString = pic.creation_date.split("-").join(".");
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";
    col.innerHTML = `
                <div class="card-container">
                    <img src="${pic.file_path}" alt="Screenshot" class="card-image">
                    <div class="card-overlay">
                        <h3 class="card-title">${pic.title}</h3>
                        <div class="card-meta">
                            <div>${dateString}</div>
                            <div>${timeString}</div>
                        </div>
                        <div class="card-buttons">
                            <button class="btn-action picture-direct-button" title="In neuem Tab öffnen" data-picture="${pic.file_path}">
                                <i class="bi bi-box-arrow-up-right"></i>
                            </button>
                            <button class="btn-action picture-link-button" title="Link kopieren" data-picture="${pic.file_path}">
                                <i class="bi bi-link-45deg"></i>
                            </button>
                            <button class="btn-action btn-delete picture-delete-button" title="Bild löschen" data-picture-id="${pic.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
        `;
    picContainer.appendChild(col);
  });
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("picture-direct-button")) {
      const pictureUrl = e.target.getAttribute("data-picture");
      window.open(pictureUrl, "_blank");
    } else if (e.target.classList.contains("picture-link-button")) {
      const pictureUrl = e.target.getAttribute("data-picture");
      navigator.clipboard.writeText(pictureUrl);
      showFeedback({
        success: true,
        message: "Der Link wurde in die Zwischenablage kopiert"
      })
    } else if (e.target.classList.contains("picture-delete-button")) {
      const pictureId = e.target.getAttribute("data-picture-id");
      showCustomConfirm(pictureId);
    }
  });
}

// desc: Zeigt das Loginfenster, wird immer aufgerufen, wenn Cookie nicht stimmt/vorhanden ist
function initLogin() {
  filterContainer.innerHTML = "";
  picContainer.innerHTML = `
              <div class="row justify-content-center">
                <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
                    <div class="shadow-sm">
                        <div class="card-body p-2">
                            <form id="loginForm" method="#">
                                <div class="mb-3">
                                    <input id="loginUsername" class="form-control form-control-lg" type="text"
                                        name="username" placeholder="Benutzername" required>
                                </div>
                                <div class="mb-4">
                                    <input id="loginPassword" class="form-control form-control-lg" type="password"
                                        name="password" placeholder="Passwort" required>
                                </div>
                                <div class="d-grid mb-3">
                                    <button class="btn btn-dark btn-lg" type="submit">
                                        Anmelden
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      showFeedback(data);
      if (data.success) {
        showFeedback(data);
        setTimeout(() => {
          initApp();
        }, 3500);
      } else {
        showFeedback(data);
        document.getElementById("loginUsername").value = "";
        document.getElementById("loginPassword").value = "";
      }
    } catch (error) {
      console.error("Login-Fehler:", error);
      showFeedback({
        success: false,
        message: error.message || "Verbindungsfehler..."
      });
    }
  });
}