  const sidebar = document.getElementById("sidebarMenu");
  const collapseBtn = document.getElementById("collapseBtn");
  const mobileToggle = document.getElementById("mobileToggle");
  const links = sidebar.querySelectorAll("a");

  // Collapse sidebar (desktop)
  collapseBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // Toggle sidebar (mobile)
  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("is-active");
  });

  // Close sidebar after clicking a link on mobile
  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("is-active");
      }
    });
  });

  // Highlight active link
  function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href === currentPage ||
        (currentPage === "" && href === "dashboard.html")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  highlightActiveLink();