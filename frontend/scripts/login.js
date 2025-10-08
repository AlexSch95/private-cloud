// desc: importiert auth, logout und feedback funktion
import { showFeedback } from "./sharedFunctions.js";

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
        window.location.href = "/";
      }, 3500);
    } else {
      showFeedback(data);
      document.getElementById("loginUsername").value = "";
      document.getElementById("loginPassword").value = "";
    }
  } catch (error) {
    console.error("Fehler beim Anmelden:", error);
    showFeedback({
      success: false,
      message: "Verbindungsfehler..."
    });
  }
});