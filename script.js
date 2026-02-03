// Minimal interactions: smooth scroll w/ navbar offset, collapse mobile nav on click,
// dynamic year, and simple client-side form validation (demo).

(() => {
  "use strict";

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Helpers
  const navbar = document.getElementById("mainNavbar");
  const getNavHeight = () => (navbar ? navbar.offsetHeight : 0);

  // Smooth scroll with offset for sticky navbar
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - getNavHeight() + 8;
      window.scrollTo({ top, behavior: "smooth" });

      // Collapse navbar on mobile after navigation
      const navLinks = document.getElementById("navLinks");
      if (navLinks && navLinks.classList.contains("show") && window.bootstrap?.Collapse) {
        window.bootstrap.Collapse.getOrCreateInstance(navLinks).hide();
      }
    });
  });

  // Demo CV download button (replace href in HTML with actual file path, then remove alert)
  const cvBtn = document.getElementById("downloadCvBtn");
  if (cvBtn) {
    cvBtn.addEventListener("click", (e) => {
      // If you keep href="#", prevent jump
      e.preventDefault();
      alert("Add your CV file (e.g., /assets/Aminu-Gambo-CV.pdf) and update the Download CV link.");
    });
  }

  // Contact form validation (demo only — no backend)
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = /** @type {HTMLInputElement|null} */ (document.getElementById("name"));