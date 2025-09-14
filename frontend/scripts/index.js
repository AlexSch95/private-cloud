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