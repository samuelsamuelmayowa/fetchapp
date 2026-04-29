 const form = document.getElementById('forgotPasswordForm');
    const email = document.getElementById('email');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      if (!email.value.includes('@')) {
        alert("⚠️ Please enter a valid email address.");
        return;
      }

      // Simulated email send (replace with backend logic later)
      successMessage.style.display = 'block';
      form.reset();

      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);
    });