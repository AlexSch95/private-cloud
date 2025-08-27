import { showFeedback } from "./sharedFunctions.js";
const picContainer = document.getElementById("picContainer");
getPics();

async function getPics() {
    try {
        let localPics = {};
        const response = await fetch("http://localhost:3000/api/pictures/all");
        const data = await response.json();
        const responseFromApi = data;
        showFeedback(responseFromApi);
        renderPics(responseFromApi.pictures)
    } catch (error) {
        console.log(error);
        showFeedback({success: false, message: error.message});
    }
}

function renderPics(localPics) {
    picContainer.innerHTML = "";
    localPics.forEach(pic => {
        const col = document.createElement("div");
        col.className = "card p-3"
        col.innerHTML = `
            <a href="${pic.pic_path}">
            <img class="img-fluid" src="${pic.pic_path}">
            </a>
        `;
        picContainer.appendChild(col);
    });
    console.log("pics loaded");
}