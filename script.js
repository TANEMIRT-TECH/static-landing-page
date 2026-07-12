// ============================================
// TANEMIRT-TECH — Interactions
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileNav();
  initNavIndicator();
  initScrollSpy();
  initRevealOnScroll();
  initBackToTop();
  initFaqAccordion();
  initTechSwitcher();
  initCurrentYear();
  initForms();
  initExpandPanels();
  initPortfolioPreviews();
  forceLandOnHero();
});

/* ---------- Land on the hero on a fresh visit, not wherever the URL
   hash / scroll restoration happens to point. Runs before anything
   else can shift layout (like lazy content loading in) so the very
   first frame the user sees is always the top of the page. ---------- */
function forceLandOnHero() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  // Only reset when the user didn't intentionally land on a specific
  // section, e.g. from an external link like "yoursite.com#contact".
  // A same-page click already gets its own smooth scroll, so this only
  // affects the very first paint of a fresh page load.
  window.scrollTo(0, 0);
}

/* ---------- Sticky header shadow on scroll ---------- */
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Mobile nav (slide-in panel + backdrop) ---------- */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const backdrop = document.getElementById("mobile-nav-backdrop");
  if (!toggle || !mobileNav || !backdrop) return;

  function openMenu() {
    mobileNav.classList.add("is-open");
    backdrop.classList.add("is-visible");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mobileNav.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    mobileNav.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  backdrop.addEventListener("click", closeMenu);
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // If the viewport grows past the mobile breakpoint while the menu is
  // open (e.g. rotating a tablet), close it so it can't get stuck open.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && mobileNav.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

/* ---------- Desktop nav: sliding active indicator ---------- */
function initNavIndicator() {
  const nav = document.getElementById("primary-nav");
  const indicator = document.getElementById("nav-indicator");
  if (!nav || !indicator) return;

  const links = Array.from(nav.querySelectorAll("a[data-nav]"));

  function moveIndicator(link) {
    if (!link) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft - 6}px)`;
  }

  function setActive(link) {
    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    moveIndicator(link);
  }

  links.forEach((link) => {
    link.addEventListener("click", () => setActive(link));
  });

  // Keep in sync with scroll-spy, which toggles .active on its own.
  const observer = new MutationObserver(() => {
    const activeLink = nav.querySelector("a.active");
    if (activeLink) moveIndicator(activeLink);
  });
  links.forEach((link) => observer.observe(link, { attributes: true, attributeFilter: ["class"] }));

  window.addEventListener("resize", () => {
    moveIndicator(nav.querySelector("a.active") || links[0]);
  });

  requestAnimationFrame(() => moveIndicator(nav.querySelector("a.active") || links[0]));
}

/* ---------- Highlight active nav link based on section in view ---------- */
function initScrollSpy() {
  const navLinks = document.querySelectorAll("#primary-nav a[data-nav]");
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("active"));
          const activeLink = document.querySelector(
            `#primary-nav a[data-nav="${entry.target.id}"]`
          );
          if (activeLink) activeLink.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Fade/slide sections (and staggered grids) in on scroll ---------- */
function initRevealOnScroll() {
  const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 500);
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Only one FAQ item open at a time ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
}

/* ---------- Technology category switcher (sliding indicator) ---------- */
function initTechSwitcher() {
  const tabsWrap = document.getElementById("tech-tabs");
  const indicator = document.getElementById("tech-tab-indicator");
  const tabs = Array.from(document.querySelectorAll(".tech-tab"));
  const panels = document.querySelectorAll(".tech-panel");

  if (!tabs.length || !panels.length) return;

  function moveIndicator(tab) {
    if (!indicator || !tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
  }

  function activate(tab) {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    const targetId = `panel-${tab.dataset.techTab}`;
    panels.forEach((panel) => {
      const isTarget = panel.id === targetId;
      panel.classList.toggle("is-active", isTarget);
      panel.hidden = !isTarget;
    });

    moveIndicator(tab);
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));

  if (tabsWrap && indicator) {
    window.addEventListener("resize", () => {
      moveIndicator(tabsWrap.querySelector(".tech-tab.is-active"));
    });

    requestAnimationFrame(() => {
      moveIndicator(tabsWrap.querySelector(".tech-tab.is-active") || tabs[0]);
    });
  }
}

/* ---------- Footer current year ---------- */
function initCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------- Contact & application forms ---------- */
function initForms() {
  const contactForm = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");

  if (contactForm && formNote) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      formNote.textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
      contactForm.reset();
    });
  }

  const applyForm = document.getElementById("apply-form");
  const applyNote = document.getElementById("apply-note");

  if (applyForm && applyNote) {
    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyNote.textContent = "Application received! Check your inbox for next steps.";
      applyForm.reset();
    });
  }
}

/* ---------- Expanding service panels (touch support) ---------- */
function initExpandPanels() {
  const panels = document.querySelectorAll(".expand-panel");
  if (!panels.length) return;

  panels.forEach((panel) => {
    panel.addEventListener("click", (e) => {
      if (window.matchMedia("(hover: hover)").matches) return;

      if (!panel.classList.contains("is-active")) {
        e.preventDefault();
        panels.forEach((p) => p.classList.remove("is-active"));
        panel.classList.add("is-active");
      }
    });
  });
}

/* ---------- Portfolio: lazy-load live previews only once scrolled
   into view. This is also what stops the page from jumping straight
   to the portfolio section on a fresh load — nothing in there loads,
   grabs focus, or shifts layout until the user actually scrolls down
   to it themselves. ---------- */
function initPortfolioPreviews() {
  const thumbs = document.querySelectorAll(".portfolio-thumb");
  if (!thumbs.length) return;

  function activate(thumb) {
    const scaler = thumb.querySelector(".iframe-scaler");
    const frame = scaler ? scaler.querySelector("iframe[data-src]") : null;
    if (!frame) return;

    frame.src = frame.dataset.src;
    frame.removeAttribute("data-src");

    const timeout = setTimeout(() => {
      // Blocked by X-Frame-Options / took too long — keep the static
      // screenshot behind it visible instead of an empty frame.
      scaler.style.display = "none";
    }, 5000);

    frame.addEventListener("load", () => {
      clearTimeout(timeout);
      scaler.classList.add("is-loaded");
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "300px 0px", threshold: 0 }
  );

  thumbs.forEach((thumb) => observer.observe(thumb));
}
