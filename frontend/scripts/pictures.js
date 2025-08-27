import { showFeedback } from "./sharedFunctions.js";
const picContainer = document.getElementById("picContainer");
getPics();

async function getPics() {
  try {
    const response = await fetch("http://backend:3000/api/pictures/all");
    const data = await response.json();
    const responseFromApi = data;
    showFeedback(responseFromApi);
    renderPics(responseFromApi.pictures);
  } catch (error) {
    console.log(error);
    showFeedback({ success: false, message: error.message });
  }
}

function renderPics(localPics) {
  picContainer.innerHTML = "";
  localPics.forEach((pic) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";
    col.innerHTML = `
                <div class="card">
                    <img src="${pic.pic_path}" alt="Screenshot" class="screenshot">
                    <div class="card-info">
                        <h3 class="card-title">Kein Titel</h3>
                        <p class="card-description">Keine Beschreibung vorhanden</p>
                        <div class="card-meta">
                            <span>15.08.2000</span>
                            <span>1920x1080</span>
                        </div>
                        <div class="btn-container">
                            <button class="btn btn-sm btn-primary picture-direct-button" data-picture="http://localhost:5500/frontend/${pic.pic_path}">Öffnen</button>
                            <button class="btn btn-sm btn-outline-light picture-link-button" data-picture="http://localhost:5500/frontend/${pic.pic_path}">Link kopieren</button>
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
    }
  });
}
