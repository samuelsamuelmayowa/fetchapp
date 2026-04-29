/** @format */

const saveBtn = document.getElementById("saveSettings");
const resetBtn = document.getElementById("resetSettings");
const darkModeToggle = document.getElementById("darkModeToggle");

// Dark Mode Toggle
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("is-dark-mode", darkModeToggle.checked);
});

// Save Settings
saveBtn.addEventListener("click", () => {
  const emailNotify = document.getElementById("emailNotify").checked;
  const taskNotify = document.getElementById("taskNotify").checked;
  const language = document.getElementById("languageSelect").value;
  const timezone = document.getElementById("timezoneSelect").value;
  const privacy = document.getElementById("privacySelect").value;
  const darkMode = darkModeToggle.checked;

  const settings = {
    emailNotify,
    taskNotify,
    language,
    timezone,
    privacy,
    darkMode,
  };

  localStorage.setItem("userSettings", JSON.stringify(settings));

  alert("✅ Settings saved successfully!");
});

// Reset Settings
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("userSettings");
  document.getElementById("emailNotify").checked = true;
  document.getElementById("taskNotify").checked = true;
  document.getElementById("languageSelect").value = "English";
  document.getElementById("timezoneSelect").value = "GMT +1 (West Africa Time)";
  document.getElementById("privacySelect").value = "Public";
  darkModeToggle.checked = false;
  document.body.classList.remove("is-dark-mode");
  alert("🔄 Settings reset to default.");
});

// Load Saved Settings
window.addEventListener("DOMContentLoaded", () => {
  const saved = JSON.parse(localStorage.getItem("userSettings"));
  if (saved) {
    document.getElementById("emailNotify").checked = saved.emailNotify;
    document.getElementById("taskNotify").checked = saved.taskNotify;
    document.getElementById("languageSelect").value = saved.language;
    document.getElementById("timezoneSelect").value = saved.timezone;
    document.getElementById("privacySelect").value = saved.privacy;
    darkModeToggle.checked = saved.darkMode;

    if (saved.darkMode) {
      document.body.classList.add("is-dark-mode");
    }
  }
});
