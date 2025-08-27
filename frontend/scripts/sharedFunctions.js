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