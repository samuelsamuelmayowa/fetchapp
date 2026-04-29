/** @format */

const form = document.getElementById("changePasswordForm");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (newPassword.value !== confirmPassword.value) {
    alert("❌ New password and confirmation do not match!");
    return;
  }

  if (newPassword.value.length < 6) {
    alert("⚠️ Password must be at least 6 characters.");
    return;
  }

  // Simulate success (replace this with backend call later)
  successMessage.style.display = "block";
  form.reset();

  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
});
