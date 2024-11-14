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
  diff: { hasAside: true, minimized: true }
};

// Preload home.html when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const initialPage = window.location.hash.replace('#/', '') || 'home';
  const hasAside = pageConfig[initialPage] || false;
  loadPage(initialPage, hasAside, true);

  // Listen for hash changes to handle navigation
  window.addEventListener('hashchange', handleHashChange);
});

function handleHashChange() {
  const page = window.location.hash.replace('#/', '') || 'home';
  const hasAside = pageConfig[page] || false; // Determine if the page should have .has-aside
  loadPage(page, hasAside);
  
  // Set the correct active link based on the URL hash
  setActiveLinkByHash(page);
}

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

function generateTOC() {
  const mainElement = document.querySelector('main .content');
  const asideNav = document.querySelector('#Index .list-group');
  
  // Clear existing TOC
  asideNav.innerHTML = '';

  // Find all sections within <main>
  const sections = mainElement.querySelectorAll('section[id]');
  sections.forEach(section => {
    const sectionId = section.id;
    const sectionTitle = section.getAttribute('aria-label') || sectionId; // Use data-title or fallback to ID

    // Get the current page from the hash, stripping out the leading '#/' if it exists
    const currentPage = window.location.hash.replace('#/', '').split('/')[0];

    // Create a link for the TOC
    const link = document.createElement('a');
    link.href = `#${sectionId}`;
    link.className = 'list-group-item';
    link.textContent = sectionTitle;

    // Append the link directly to the list group div
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


// Scrollspy

function initScrollspy() {
  new bootstrap.ScrollSpy(document.body, {
    target: '#Index'
  });
}


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


// Password

function checkPassword(event) {
  event.preventDefault();

  const enteredPassword = document.getElementById("password").value;
  const correctPassword = "Test123"; // Replace with your password

  if (enteredPassword === correctPassword) {
    document.getElementById("password-form").style.display = "none"; // Hide form
    document.getElementById("Nav").classList.remove("d-none"); 
    document.getElementById("Main").classList.remove("d-none");
  } else {
    document.getElementById("error").style.display = "block"; // Show error message
    document.getElementById("info").style.display = "none";
  }
}


