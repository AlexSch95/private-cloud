import { showFeedback } from "./sharedFunctions.js";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        showFeedback(data);
        if (data.success) {
            localStorage.setItem("jwttoken", data.token);
            showFeedback(data);
            setTimeout(() => {
                window.location.href = "./pictures.html";
            }, 3000);
        } else {
            showFeedback(data);
        }
    } catch (error) {
        console.error("Login-Fehler:", error);
        showFeedback({
            success: false,
            message: error.message || "Verbindungsfehler..."
        });
    }
});

