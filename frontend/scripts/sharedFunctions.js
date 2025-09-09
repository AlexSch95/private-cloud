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
    document.getElementById("errorMessage").classList.remove("show");
  }, 3000);
}


export async function checkAuth() {
  try {
    const response = await fetch("/api/check-auth");
    const result = await response.json();
    if (!result.success) {
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 5000);
      return false;
    }
    return true
  } catch (error) {
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 5000);
  }
}

export async function logout() {
    try {
      const response = await fetch("/api/logout");
      const data = await response.json();
      showFeedback(data);
      setTimeout(() => {
        window.location.href = './index.html';
      }, 5000);
    } catch (error) {
      console.error("Logout-Fehler:", error);
      showFeedback({
        success: false,
        message: "Verbindungsfehler... Abmeldung nicht möglich."
      });
    }
}