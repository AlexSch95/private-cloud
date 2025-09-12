import { showFeedback, checkAuth, logout } from "./sharedFunctions.js";

async function initApp() {
    const authStatus = await checkAuth();
    const loginStatusContainer = document.getElementById("loginStatusContainer");
    if (!authStatus.success) {
        loginStatusContainer.innerHTML = `<a class="btn btn-info btn-danger shadow" role="button" href="/login.html">Anmelden</a>`;
        return;
    }
    loginStatusContainer.innerHTML = `<a class="btn btn-info btn-danger shadow" id="logoutButton" role="button" href="#">Abmelden</a>`;
    document.getElementById('logoutButton')?.addEventListener('click', logout);
}

initApp();