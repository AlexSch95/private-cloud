// desc: Funktion um Feedback Meldungen einzublenden
export function showFeedback(result) {
  // responseBody dekonstruieren
  const { success, message } = result;
  // Error Alert Elemente Laden
  const errorText = document.getElementById("errorText");
  const errorBox = document.getElementById("errorMessage");
  if (success === true) {
    errorText.textContent = message;
    errorBox.classList.add("alert-success");
  } else if (success === false) {
    errorText.textContent = message;
    errorBox.classList.add("alert-danger");
  }
  errorBox.classList.add("show");
  setTimeout(() => {
    errorBox.classList.remove("show", "alert-danger", "alert-success");
  }, 3000);
}

// desc: Funktion um Authentifizierung zu prüfen und bei Fehler auf die Login Seite zu leiten
export async function checkAuth() {
  try {
    const response = await fetch("/api/check-auth");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Auth-Fehler:", error);
    showFeedback({
      success: false,
      message: "Verbindungsfehler... Bitte erneut anmelden."
    });
    return {
      success: false, message: "Verbindungsfehler... Bitte erneut anmelden."
    }
  }
}

// desc: Logout funktion, Cookie wird im backend gecleart
export async function logout() {
  try {
    const response = await fetch("/api/logout");
    const result = await response.json();
    showFeedback(result);
    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  } catch (error) {
    console.error("Logout-Fehler:", error);
    showFeedback({
      success: false,
      message: "Verbindungsfehler... Abmeldung nicht möglich. Seite wird neu geladen."
    });
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}