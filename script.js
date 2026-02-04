// Minimal interactions: smooth scroll w/ navbar offset, collapse mobile nav on click,
// dynamic year, and contact form submission (serverless-friendly).

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

  // CV download button (only blocks if href is missing or '#')
  const cvBtn = document.getElementById("downloadCvBtn");
  if (cvBtn) {
    cvBtn.addEventListener("click", (e) => {
      const href = cvBtn.getAttribute("href") || "";
      if (!href || href === "#") {
        e.preventDefault();
        alert("Add your CV file or URL and update the Download CV link.");
      }
    });
  }

  // -----------------------------
  // Contact form backend logic
  // -----------------------------
  // GitHub Pages can't run server-side code. Use a serverless endpoint.
  // Recommended: Formspree.
  // Add your endpoint to the form in index.html:
  //   data-endpoint="https://formspree.io/f/xxxxxx"

  const form = /** @type {HTMLFormElement|null} */ (document.getElementById("contactForm"));
  if (!form) return;

  const nameEl = /** @type {HTMLInputElement|null} */ (document.getElementById("name"));
  const emailEl = /** @type {HTMLInputElement|null} */ (document.getElementById("email"));
  const subjectEl = /** @type {HTMLInputElement|null} */ (document.getElementById("subject"));
  const messageEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById("message"));
  const hintEl = document.getElementById("formHint");

  if (!nameEl || !emailEl || !messageEl) return;

  const setHint = (message, type = "muted") => {
    if (!hintEl) return;
    hintEl.textContent = message;
    hintEl.classList.remove("text-muted", "text-success", "text-danger");
    if (type === "success") hintEl.classList.add("text-success");
    else if (type === "error") hintEl.classList.add("text-danger");
    else hintEl.classList.add("text-muted");
  };

  const validate = () => {
    [nameEl, emailEl, messageEl].forEach((el) => el.classList.remove("is-invalid"));

    const nameOk = nameEl.value.trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
    const messageOk = messageEl.value.trim().length >= 10;

    if (!nameOk) nameEl.classList.add("is-invalid");
    if (!emailOk) emailEl.classList.add("is-invalid");
    if (!messageOk) messageEl.classList.add("is-invalid");

    return nameOk && emailOk && messageOk;
  };

  const setSubmitting = (isSubmitting) => {
    const btn = form.querySelector('button[type="submit"]');
    if (!(btn instanceof HTMLButtonElement)) return;

    btn.disabled = isSubmitting;
    btn.dataset.originalText ||= btn.innerHTML;
    btn.innerHTML = isSubmitting
      ? 'Sending… <span class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>'
      : btn.dataset.originalText;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) {
      setHint("Please fix the highlighted fields and try again.", "error");
      return;
    }

    const endpoint = form.getAttribute("data-endpoint") || "";
    if (!endpoint) {
      setHint("Missing endpoint. Add your Formspree endpoint to the form (data-endpoint).", "error");
      return;
    }

    setSubmitting(true);
    setHint("Sending your message…", "muted");

    const payload = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      subject: subjectEl ? subjectEl.value.trim() : "",
      message: messageEl.value.trim(),
      source: window.location.href,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let details = "";
        try {
          const data = await res.json();
          details = data?.errors?.[0]?.message ? ` (${data.errors[0].message})` : "";
        } catch {
          // ignore
        }
        throw new Error(`Request failed${details}`);
      }

      setHint("Message sent successfully. I’ll get back to you soon.", "success");
      form.reset();
    } catch (err) {
      setHint("Couldn’t send right now. Please try again or email me directly.", "error");
      console.error("Contact form submission error:", err);
    } finally {
      setSubmitting(false);
    }
  });
})();