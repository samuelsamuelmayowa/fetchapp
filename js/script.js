 // navbar menu start //
  document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.navbar-burger');
    const menu = document.getElementById('mainNavbar');

    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  
    // Profile dropdown toggle
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    profileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      profileDropdown.classList.toggle('is-active');
    });

    // Optional: close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!profileDropdown.contains(event.target) && profileDropdown.classList.contains('is-active')) {
        profileDropdown.classList.remove('is-active');
      }
    });
  });
//   navbar menu end //

    // back arrow start //
 function goBack() {
   if (window.history.length > 1) {
     // Go back to the previous page in history
     window.history.back();
   } else {
     // If no history, go to homepage
     window.location.href = "index.html"; // change to your homepage
   }
 }

  // back arrow ended //

  // dashboard point claim //

 let totalPoints = 0;

 const pointsDisplay = document.getElementById("points");
 const earningsDisplay = document.getElementById("earnings");

 document.querySelectorAll(".claim-btn").forEach((button) => {
   button.addEventListener("click", () => {
     const points = parseInt(button.dataset.points);
     totalPoints += points;

     const earnings = totalPoints / 10000;

     pointsDisplay.textContent = totalPoints.toLocaleString();
     earningsDisplay.textContent = `$${earnings.toFixed(2)}`;

     // Optionally disable button after claiming
     button.classList.add("is-light");
     button.textContent = "Claimed";
     button.disabled = true;
   });
 });

// dashboard point claim end //

  function toggleReferral() {
    const section = document.getElementById("referralSection");
    section.style.display = section.style.display === "none" ? "block" : "none";
  }

  function copyReferralCode() {
    const input = document.getElementById("referralCode");
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    const msg = document.getElementById("copyMsg");
    msg.style.display = "block";
    setTimeout(() => (msg.style.display = "none"), 2000);
  }


 
 // login input start //

 document.addEventListener("DOMContentLoaded", () => {
   const roleSelection = document.getElementById("roleSelection");
   const earnerLogin = document.getElementById("earnerLogin");
   const creatorLogin = document.getElementById("creatorLogin");

   document.getElementById("loginAsEarner").addEventListener("click", () => {
     roleSelection.classList.add("hidden");
     earnerLogin.classList.remove("hidden");
   });

   document.getElementById("loginAsCreator").addEventListener("click", () => {
     roleSelection.classList.add("hidden");
     creatorLogin.classList.remove("hidden");
   });
 });

 
// login input end

 // sign up start form //
const roleSelection = document.getElementById("roleSelection");
const earnerForm = document.getElementById("earnerForm");
const creatorForm = document.getElementById("creatorForm");

const signAsEarner = document.getElementById("signAsEarner");
const signAsCreator = document.getElementById("signAsCreator");

const backBtn1 = document.getElementById("backBtn1");
const backBtn2 = document.getElementById("backBtn2");
const backBtn3 = document.getElementById("backBtn3");

// Show earner form
signAsEarner.addEventListener("click", () => {
  roleSelection.classList.add("hidden");
  earnerForm.classList.remove("hidden");
});

// Show creator form
signAsCreator.addEventListener("click", () => {
  roleSelection.classList.add("hidden");
  creatorForm.classList.remove("hidden");
});

// Back button logic
backBtn1.addEventListener("click", () => {
  // If pressed on first screen just reload
  window.location.reload();
});

backBtn2.addEventListener("click", () => {
  earnerForm.classList.add("hidden");
  roleSelection.classList.remove("hidden");
});

backBtn3.addEventListener("click", () => {
  creatorForm.classList.add("hidden");
  roleSelection.classList.remove("hidden");
});

// sign up end form //


  document.addEventListener("DOMContentLoaded", () => {
    const quantityInput = document.getElementById("quantity");
    const platformSelect = document.getElementById("platform");
    const taskTypeSelect = document.getElementById("taskType");
    const totalPayment = document.getElementById("totalPayment");
    const paymentMethod = document.getElementById("paymentMethod");
    const paymentDetails = document.getElementById("paymentDetails");

    // Pricing rules
    const pricing = {
      youtube: { view: 0.1, subscriber: 0.1, follower: 0 },
      facebook: { view: 0.08, follower: 0.1, subscriber: 0 },
      tiktok: { view: 0.05, follower: 0.1, subscriber: 0 },
      instagram: { view: 0.05, follower: 0.1, subscriber: 0 },
      x: { view: 0.05, follower: 0, subscriber: 0 },
    };

    function calculatePayment() {
      const platform = platformSelect.value;
      const taskType = taskTypeSelect.value;
      const quantity = parseInt(quantityInput.value) || 0;

      const rate = pricing[platform][taskType] || 0;
      const total = rate * quantity;

      totalPayment.textContent = `$${total.toFixed(2)}`;
      return total;
    }

    quantityInput.addEventListener("input", calculatePayment);
    platformSelect.addEventListener("change", calculatePayment);
    taskTypeSelect.addEventListener("change", calculatePayment);

    // Handle Payment Method
    paymentMethod.addEventListener("change", () => {
      paymentDetails.classList.remove("is-hidden");
      const method = paymentMethod.value;

      if (method === "card") {
        paymentDetails.innerHTML = `
        <h3 class="title is-5">Card Payment</h3>
        <input type="text" class="input mb-2" placeholder="Card Number">
        <input type="text" class="input mb-2" placeholder="Expiry Date (MM/YY)">
        <input type="text" class="input mb-2" placeholder="CVV">
      `;
      } else if (method === "bank") {
        const bankDetails =
          "Bank: ABC Bank\nAccount Number: 123456789\nAccount Name: TaskPlatform Ltd";
        paymentDetails.innerHTML = `
        <h3 class="title is-5">Bank Transfer</h3>
        <p><strong>${bankDetails.replace(/\n/g, "<br>")}</strong></p>
        <button class="button is-small is-link copy-btn" onclick="copyToClipboard(\`${bankDetails}\`)">Copy Details</button>
      `;
      } else if (method === "crypto") {
        const wallet = "0xABC123456789XYZ987654321";
        paymentDetails.innerHTML = `
        <h3 class="title is-5">Crypto Payment</h3>
        <p><strong>Wallet Address: ${wallet}</strong></p>
        <button class="button is-small is-link copy-btn" onclick="copyToClipboard('${wallet}')">Copy Wallet</button>
      `;
      }
    });
  });

  // Copy to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  }
