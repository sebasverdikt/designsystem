// Define a mapping of which pages need .has-aside and .minimized
const pageConfig = {
  home: { hasAside: true, minimized: false },
  color: { hasAside: true, minimized: false },
  type: { hasAside: true, minimized: false },
  brand: { hasAside: true, minimized: false },
  icons: { hasAside: false, minimized: false },
  size: { hasAside: true, minimized: false },
  action: { hasAside: true, minimized: false },
  control: { hasAside: true, minimized: false },
  forms: { hasAside: true, minimized: false },
  cards: { hasAside: true, minimized: false },
  tables: { hasAside: false, minimized: false },
  masonry: { hasAside: false, minimized: false },
  diff: { hasAside: true, minimized: true },
  figma: { hasAside: false, minimized: false },
  code: { hasAside: true, minimized: false },
  downloads: { hasAside: true, minimized: false },
  graphics: { hasAside: false, minimized: false }
};

// Preload home.html when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const initialPage = window.location.hash.replace('#/', '') || 'home';
  const hasAside = pageConfig[initialPage]?.hasAside || false; // specifically access hasAside
  loadPage(initialPage, hasAside, true);

  // Listen for hash changes to handle navigation
  window.addEventListener('hashchange', handleHashChange);
});

function setActiveLinkByHash(page) {
  // Remove .active from all nav-links
  document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');

      // Compare the href of the link to the current page hash
      const linkHref = link.getAttribute('href').replace('#/', '');
      if (linkHref === page) {
          link.classList.add('active');
      }
  });
}


// Scrollspy

function initScrollspy() {
  const targetElement = document.querySelector('#Index');
  if (targetElement) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#Index',
    });
  } else {
    console.warn('ScrollSpy target element not found');
  }
}


// Figspec

function initializeFigspecViewer(fileKey, nodeId, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Container not found: ${containerSelector}`);
    return;
  }

  // Clear previous content
  container.innerHTML = '';

  // Create and append the Figspec viewer
  const figspecViewer = document.createElement('figspec-file-viewer');
  figspecViewer.style.width = '100%';
  figspecViewer.style.height = '500px';
  figspecViewer.setAttribute('file-key', fileKey);
  figspecViewer.setAttribute('node-id', nodeId);
  container.appendChild(figspecViewer);
}

// Example usage:
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.hash.replace('#/', '') || 'home';
  if (page === 'action') {
    initializeFigspecViewer(
      'yHZMKQ2mWAg9cOtrgO6PE4/%C2%B7-B2B-%7C-DS-%7C-v2.2-%7C-Component-Library?page-id=8%3A21',  // Replace with your file key
      '56:261',        // Replace with your node ID
      'div.figspec'        // Container selector
    );
  }
});


// Aside

function loadPage(page, hasAside, isInitialLoad = false) {
  fetch(`${page}.html`)
    .then(response => response.text())
    .then(data => {
      const mainElement = document.querySelector('main');
      const mainContent = document.querySelector('main .content');

      // Load the content inside <main>
      mainContent.innerHTML = data;

      // Check the configuration for the current page
      const pageSettings = pageConfig[page] || { hasAside: false, minimized: false };

      // Toggle .has-aside class on <main> based on hasAside
      if (hasAside) {
        mainElement.classList.add('has-aside');
      } else {
        mainElement.classList.remove('has-aside');
      }

      // Apply or remove .minimized class based on configuration
      const wrapper = document.querySelector('.wrapper');
      if (pageSettings.minimized) {
        wrapper.classList.add('minimized');
      } else {
        wrapper.classList.remove('minimized');
      }

      // Delay Figspec initialization slightly to ensure DOM is updated
      if (page === 'action') {
        setTimeout(() => {
          initializeFigspecViewer(
            'yHZMKQ2mWAg9cOtrgO6PE4?page-id=8%3A21', // Replace with your file key
            '56:261', // Replace with your node ID
            'div.figspec' // Container selector
          );
        }, 100); // Small delay to wait for DOM update
      }

      // Generate Table of Contents
      generateTOC();

      // Reinitialize Scrollspy or other dynamic features
      initScrollspy();

      // If it's the initial load, set the active state based on the URL hash
      if (isInitialLoad) {
        const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeLink) setActiveLink(activeLink);
      }
    })
    .then(() => {
      var iso = new Isotope('.grid', {
        percentPosition: true,
        sortBy : 'random',
        masonry: {
        // use outer width of grid-sizer for columnWidth
          columnWidth: '.grid-sizer'
        }
      });
    })
    .catch(error => console.error('Error loading page:', error));
}


// Table of Contents

function generateTOC() {
  const mainElement = document.querySelector('main .content');
  const asideNav = document.querySelector('#Index .list-group');
  
  // Clear existing TOC
  asideNav.innerHTML = '';

  // Find all sections and titles within <main>
  const sections = mainElement.querySelectorAll('section[id], h2[id], h2.section-title, h3.sub-section');
  sections.forEach(item => {
    const itemId = item.id || item.getAttribute('aria-label');
    const isSection = item.tagName.toLowerCase() === 'section' || (item.tagName.toLowerCase() === 'h3' && item.classList.contains('sub-section'));;
    const itemTitle = item.getAttribute('aria-label') || itemId; // Use aria-label or fallback to ID

    // Create a link or title for the TOC
    const link = document.createElement('a');
    link.href = `#${itemId}`;
    link.className = 'list-group-item';

    // Set link style and text based on whether it's a section or an h2 title
    if (isSection) {
      link.textContent = itemTitle;
    } else {
      link.textContent = `${itemTitle}`; // Prefix title for differentiation
      link.classList.add('title-item', 'font-serif', 'fw-medium', 'text-primary', 'ps-2'); // Add class for styling (optional)
    }

    // Append the link or title directly to the list group div
    asideNav.appendChild(link);
  });
}

document.addEventListener('click', function (e) {
  // Check if the clicked element is a TOC link
  if (e.target.classList.contains('list-group-item')) {
      e.preventDefault();

      const sectionId = e.target.getAttribute('href').substring(1); // Get the section ID
      const section = document.getElementById(sectionId);

      if (section) {
          // Scroll to the section smoothly
          section.scrollIntoView({ behavior: 'smooth' });

          // Update the URL hash without triggering the SPA hashchange
          history.replaceState(null, null, `#${sectionId}`);
      }
  }
});


// Dropdown -> Select

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (event) {
    // Check if the clicked element is a dropdown item
    if (event.target.matches(".dropdown-menu li a")) {
      event.preventDefault(); // Prevent the default "#" link behavior

      var selText = event.target.textContent;

      // Find the closest dropdown and update the button text
      event.target.closest(".dropdown").querySelector(".btn-select").innerHTML = selText;

      // Optional: Store the value in the hidden input
      document.getElementById("selVal").value = selText;
    }
  });
});


// Minimize Sidebar

// Get elements
const minimizeButton = document.querySelector('.btn-sa[aria-label="Minimize"]');
const wrapper = document.querySelector('.wrapper');
const sidebarNav = document.querySelector('.sidebar');
const navLinks = sidebarNav.querySelectorAll('.nav-item > a.nav-link');

// Add .minimized class on clicking the minimize button
minimizeButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    wrapper.classList.toggle('minimized');
});

// Remove .minimized class on clicking any nav link
navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        wrapper.classList.remove('minimized');
    });
});






