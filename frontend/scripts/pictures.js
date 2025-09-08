import { showFeedback } from "./sharedFunctions.js";


const picContainer = document.getElementById("picContainer");
document.getElementById("searchInput").addEventListener("input", filterPics);

let picsData = {};

getPics();


let currentPictureId = null;

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



function filterPics() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase().trim();
  const filteredPics = picsData.filter((pic) =>
    Object.values(pic).some(value => typeof value === 'string' && value.toLowerCase().includes(searchInput))
  );
  renderPics(filteredPics);
};


function renderPics(localPics) {
  picContainer.innerHTML = "";
  localPics.forEach((pic) => {
    const timeString = pic.creation_time.replace("-", ":") + " Uhr";
    const dateString = pic.creation_date.split("-").join(".");
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";
    col.innerHTML = `
                <div class="card">
                    <img src="${pic.file_path}" alt="Screenshot" class="screenshot">
                    <div class="card-info">
                        <h3 class="card-title">${pic.title}</h3>
                        <div class="card-meta">
                            <span>${dateString}</span>
                            <span>${timeString}</span>
                        </div>
                        <div class="btn-container d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary picture-direct-button" data-picture="${pic.file_path}">In neuem Tab öffnen</button>
                            <button class="btn btn-sm btn-outline-light picture-link-button" data-picture="${pic.file_path}">Link kopieren</button>
                            <button class="btn btn-sm btn-outline-danger picture-delete-button" data-picture-id="${pic.id}"><span class="material-icons picture-delete-button" data-picture-id="${pic.id}">delete_forever</span></button>
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