// desc: importiert auth, logout und feedback funktion
import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

const picContainer = document.getElementById("picContainer");
document.getElementById("searchInput").addEventListener("input", filterPics);
document.getElementById('logout')?.addEventListener('click', logout);

let picsData = {};

// desc: initial wird erstmal der Cookie geprüft, je nach Ergebnis werden die Bilder geladen oder nicht
async function initApp() {
  const isAuthed = await checkAuth();
  console.log(isAuthed);
  if (!isAuthed.success) {
    showFeedback(isAuthed);
    console.log("authed false, weiterleitung zur login seite");
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 3000);
    return;
  }
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