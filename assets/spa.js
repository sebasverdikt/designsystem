// Page Configuration
const pageConfig = {
  home: { hasAside: true },
  color: { hasAside: true },
  type: { hasAside: true },
  brand: { hasAside: true },
  icons: {},
  size: { hasAside: true },
  action: { hasAside: true },
  control: { hasAside: true },
  forms: { hasAside: true },
  cards: { hasAside: true },
  tables: {},
  masonry: { isotope: true },
  diff: { hasAside: true, minimized: true },
  figma: {},
  code: { hasAside: true },
  downloads: { hasAside: true },
  graphics: { isotope: true },
  onboarding: { hasAside: true, onboarding: true },
  tourtips: { hasAside: true, tourGuide: true }
};

// Utility to safely query DOM elements
const query = (selector, context = document) => context.querySelector(selector);
const queryAll = (selector, context = document) => [...context.querySelectorAll(selector)];

// Initialize SPA
document.addEventListener("DOMContentLoaded", () => {
  const initialPage = getPageFromHash() || "home";
  loadPage(initialPage, true);

  window.addEventListener("hashchange", () => {
    const page = getPageFromHash() || "home";
    loadPage(page);
    setActiveLinkByHash(page); // Update the active navigation link
  });
});

// Get page from URL hash
function getPageFromHash() {
  return window.location.hash.replace("#/", "");
}

// Load page content and configure layout
async function loadPage(page = false) {
  try {
    const response = await fetch(`${page}.html`);
    const data = await response.text();
    const mainContent = query("main .content");
    mainContent.innerHTML = data;

    const pageSettings = pageConfig[page] || {};
    updateLayout(pageSettings);

    if (pageSettings.hasAside) {
      generateTOC();
      initScrollspy();
    }
    if (pageSettings.isotope) initIsotope();
    if (pageSettings.tourGuide) initTourGuide();
    if (pageSettings.onboarding) initOnboarding();

  } catch (error) {
    console.error("Error loading page:", error);
  }
}

// Update layout based on page settings
function updateLayout({ hasAside = false, minimized = false }) {
  query("main").classList.toggle("has-aside", hasAside);
  query(".wrapper").classList.toggle("minimized", minimized);
}

// Highlight active navigation link
function setActiveLinkByHash(page) {
  // Remove .active from all nav-links
  queryAll('.sidebar .nav-item > .nav-link').forEach(link => {
      link.classList.remove('active');

      // Compare the href of the link to the current page hash
      const linkHref = link.getAttribute('href').replace('#/', '');
      if (linkHref === page) {
          link.classList.add('active');
      }
  });
}

// Generate Table of Contents
function generateTOC() {
  const asideNav = query("#Index .list-group");
  if (!asideNav) return;

  asideNav.innerHTML = ""; // Clear existing TOC
  queryAll("main .content section[id], h2[id], h2.section-title, h3.sub-section").forEach((item) => {
    const itemId = item.id || item.getAttribute("aria-label");
    const itemTitle = item.getAttribute("aria-label") || itemId;

    const link = document.createElement("a");
    link.href = `#${itemId}`;
    link.className = "list-group-item";
    link.textContent = itemTitle;

    if (item.tagName.toLowerCase() === "h2" || item.classList.contains("section-title")) {
      link.classList.add("title-item", "font-serif", "fw-medium", "text-primary", "ps-2");
    }

    asideNav.appendChild(link);
  });
}

// Initialize Scrollspy
function initScrollspy() {
  const targetElement = query("#Index");
  if (targetElement) {
    new bootstrap.ScrollSpy(document.body, { target: "#Index" });
  }
}

// Initialize Isotope
function initIsotope() {
  new Isotope(".grid", {
    percentPosition: true,
    sortBy: "random",
    masonry: {
      columnWidth: ".grid-sizer",
    },
  });
}

// Initialize TourGuide
async function initTourGuide() {
  const page = getPageFromHash();

  try {
    const response = await fetch(`assets/json/${page}-tour.json`);
    const data = await response.json();

    // Destructure steps and any options
    const { options = {}, steps = [] } = data;

    const tourGuide = new tourguide.TourGuideClient({
      ...options // Spread JSON options directly (only if options exist in JSON)
    });

    if (options.dialogClass) {
      const dialogClasses = options.dialogClass.split(" ");
      const targetElement = document.querySelector(".some-target");
      if (targetElement) {
        dialogClasses.forEach((className) => targetElement.classList.add(className));
      }
    }    

    if (steps.length > 0) {
      tourGuide.addSteps(steps);
      tourGuide.start();
    } else {
      console.warn("No steps available for this tour.");
    }
  } catch (error) {
    console.warn("No tour guide available for this page:", error);
  }
}

// Initialize Help Tour
/* const helpButton = query('.btn-sa[aria-label="Help"]'); 
if (helpButton) { 
  helpButton.addEventListener("click", (event) => { 
    event.preventDefault();
    initTourGuide('general'); // Pass a specific identifier for the Help tour
  });
} */

// Initialize Onboarding
function initOnboarding() {
  document.addEventListener('keydown', (event) => {
    const activeModal = document.querySelector('.modal.show'); // Adjust if your active modal has a specific class
    if (!activeModal) return; // Ensure a modal is active
    const prevButton = activeModal.querySelector('.prv');
    const nextButton = activeModal.querySelector('.nxt');
    switch (event.key) {
        case 'ArrowLeft': // Left arrow key
            if (prevButton) prevButton.click();
            break;
        case 'ArrowRight': // Right arrow key
            if (nextButton) nextButton.click();
            break;
    }
  })
};

// Smooth scrolling for TOC links
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("list-group-item")) {
    event.preventDefault();

    const sectionId = event.target.getAttribute("href").substring(1);
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, null, `#${sectionId}`);
    }
  }
});

// Dropdown functionality
document.body.addEventListener("click", (event) => {
  if (event.target.matches(".dropdown-menu li a")) {
    event.preventDefault();

    const selText = event.target.textContent;
    query(".btn-select", event.target.closest(".dropdown")).innerHTML = selText;

    const hiddenInput = query("#selVal");
    if (hiddenInput) hiddenInput.value = selText;
  }
});

// Minimize sidebar
const minimizeButton = query('.btn-sa[aria-label="Minimize"]');
if (minimizeButton) {
  minimizeButton.addEventListener("click", (event) => {
    event.preventDefault();
    query(".wrapper").classList.toggle("minimized");
  });
}

// Sidebar navigation restores expanded state
queryAll(".sidebar .nav-item > a.nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    query(".wrapper").classList.remove("minimized");
  });
});
