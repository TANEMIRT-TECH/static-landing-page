// ============================================
// TANEMIRT-TECH — Application form
// Phone formatting (intl-tel-input) + submission
// to a Google Sheet via a Google Apps Script web app.
// ============================================

// Paste the URL you get from Apps Script → Deploy → Web app (ends in /exec).
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3TYhngYmnO6-hwYC-ScI8C9KgPwsBxcZTWEBnQZPII3wn6_f8rbC_DbGQnZRlxesfJA/exec";

document.addEventListener("DOMContentLoaded", () => {
  initApplicationForm();
});


function initApplicationForm() {
  const form = document.getElementById("apply-form");
  const submitBtn = document.getElementById("apply-submit");
  const statusEl = document.getElementById("apply-status");
  if (!form || !submitBtn || !statusEl) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("app-email").value.trim();
    const phoneRaw = document.getElementById("phone").value.trim();
    const accountType = document.getElementById("account-type").value.trim();
    const notes = document.getElementById("notes").value.trim();

    setStatus("", null);

    if (!firstName || !lastName || !email) {
      setStatus("Please fill in your first name, last name, and email.", "error");
      return;
    }

    const phone = phoneRaw;

    if (SHEET_SCRIPT_URL.includes("YOUR_DEPLOYMENT_ID")) {
      setStatus(
        "Form isn't connected to Google Sheets yet — set SHEET_SCRIPT_URL in application.js.",
        "error"
      );
      return;
    }

    const payload = {
      formType: "tanemirt-application",
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      accountType: accountType,
      notes: notes,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    fetch(SHEET_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.result === "success") {
          setStatus("Application received! Check your inbox for next steps.", "success");
          form.reset();
        } else {
          throw new Error("Unexpected response from server");
        }
      })
      .catch(() => {
        setStatus("Something went wrong. Please try again or email us directly.", "error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit application";
      });
  });

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-success");
    if (type === "error") statusEl.classList.add("is-error");
    if (type === "success") statusEl.classList.add("is-success");
  }
}
