/** @format */

// Preview uploaded image
const profileUpload = document.getElementById("profileUpload");
const previewImg = document.getElementById("previewImg");

profileUpload.addEventListener("change", () => {
  const file = profileUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Simulate Verify Account
const verifyBtn = document.getElementById("verifyAccountBtn");
verifyBtn.addEventListener("click", () => {
  verifyBtn.textContent = "Verified ✔";
  verifyBtn.disabled = true;
  verifyBtn.classList.add("is-success");
});

// Handle form submission
const form = document.getElementById("editProfileForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();

  if (name && email) {
    alert("✅ Profile updated successfully!");
    form.reset();
  } else {
    alert("⚠ Please fill out all required fields.");
  }
});
