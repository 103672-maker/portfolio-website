
// Theme preference: start in dark mode and remember the visitor's choice.
const themeToggle = document.getElementById("theme-toggle");
const themeStorageKey = "portfolio-theme";

function applyTheme(theme) {
    const isDarkMode = theme === "dark";
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDarkMode));
}

let savedTheme = "dark";
try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
        savedTheme = storedTheme;
    }
} catch {
    // The theme still works when storage is unavailable, including some file previews.
}
applyTheme(savedTheme);

themeToggle.addEventListener("click", function () {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
    try {
        localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
        // Saving is optional; do not interrupt the current visit.
    }
});

// Find the mobile menu button and navigation
const menuToggle = document.getElementById("menu-toggle");
const primaryNav = document.getElementById("primary-nav");
const mobileLayout = window.matchMedia("(max-width: 900px)");

// Close the menu and update its accessibility state
function closeMenu() {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
}

// Open or close the menu when the button is clicked
menuToggle.addEventListener("click", function () {
    const isOpen = primaryNav.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close the menu after a navigation link is selected
const navigationLinks = primaryNav.querySelectorAll("a");

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        const wasMobile = mobileLayout.matches;
        closeMenu();
        if (wasMobile) {
            const target = document.getElementById(link.hash.slice(1));
            if (target) {
                target.focus({ preventScroll: true });
            }
        }
    });
});

// Reset the menu when switching between mobile and desktop layouts
mobileLayout.addEventListener("change", function () {
    const focusedLinkWillBeHidden =
        mobileLayout.matches && primaryNav.contains(document.activeElement);
    closeMenu();
    if (focusedLinkWillBeHidden) {
        menuToggle.focus();
    }
});

// Allow keyboard users to close the menu with Escape
document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        mobileLayout.matches &&
        !document.querySelector("dialog[open]") &&
        primaryNav.classList.contains("is-open")
    ) {
        closeMenu();
        menuToggle.focus();
    }
});

// Keep the current section highlighted without changing the scroll position.
const navigationSections = Array.from(navigationLinks)
    .map(function (link) {
        return { link, section: document.getElementById(link.hash.slice(1)) };
    })
    .filter(function (item) { return item.section; });

function updateActiveNavigation() {
    const activationLine = Math.min(200, Math.max(120, window.innerHeight * 0.26));
    const positionedSections = navigationSections.map(function (item) {
        return { ...item, top: item.section.getBoundingClientRect().top };
    }).sort(function (first, second) { return first.top - second.top; });

    let activeSection = positionedSections[0];
    positionedSections.forEach(function (item) {
        if (item.top <= activationLine) activeSection = item;
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        activeSection = positionedSections[positionedSections.length - 1];
    }

    navigationSections.forEach(function (item) {
        const isActive = activeSection && item.link === activeSection.link;
        item.link.classList.toggle("is-active", Boolean(isActive));
        if (isActive) {
            item.link.setAttribute("aria-current", "location");
        } else {
            item.link.removeAttribute("aria-current");
        }
    });
}

let navigationFramePending = false;
function scheduleNavigationUpdate() {
    if (navigationFramePending) return;
    navigationFramePending = true;
    window.requestAnimationFrame(function () {
        navigationFramePending = false;
        updateActiveNavigation();
    });
}

window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
updateActiveNavigation();

// Find the filter buttons, project cards and status text
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const filterStatus = document.getElementById("filter-status");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedCategory = button.dataset.filter;
        let visibleCount = 0;

        // Show matching cards and hide the others
        projectCards.forEach(function (card) {
            const shouldShow =
                selectedCategory === "all" ||
                card.dataset.category === selectedCategory;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        // Mark only the selected button as pressed
        filterButtons.forEach(function (filterButton) {
            filterButton.setAttribute(
                "aria-pressed",
                String(filterButton === button)
            );
        });

        // Announce how many cards are visible
        const cardLabel =
            visibleCount === 1 ? "project card" : "project cards";

        filterStatus.textContent =
            `Showing ${visibleCount} ${cardLabel}.`;
        scheduleNavigationUpdate();
    });
});

// Open the dialog connected to each project button
const projectDetailButtons =
    document.querySelectorAll(".project-details-button");

projectDetailButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const dialogId = button.dataset.dialog;
        const targetDialog = document.getElementById(dialogId);

        if (targetDialog && typeof targetDialog.showModal === "function") {
            targetDialog.showModal();
        }
    });
});

// Close the dialog containing the selected Close button
const dialogCloseButtons =
    document.querySelectorAll(".dialog-close");

dialogCloseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const parentDialog = button.closest("dialog");

        if (parentDialog) parentDialog.close();
    });
});

// Find the contact form and its fields
const contactForm = document.getElementById("contact-form");
const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactMessage = document.getElementById("contact-message");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", function (event) {
    // Keep this demo from submitting or reloading the page
    event.preventDefault();
    formStatus.textContent = "";

    // Remove spaces from the beginning and end
    contactName.value = contactName.value.trim();
    contactEmail.value = contactEmail.value.trim();

    // Reject an empty name, including spaces-only input
    contactName.setCustomValidity(
        contactName.value ? "" : "Please enter your name."
    );

    // Require at least 10 characters after trimming outer spaces
    const messageLength = contactMessage.value.trim().length;

    contactMessage.setCustomValidity(
        messageLength >= 10
            ? ""
            : "Please enter a message with at least 10 characters."
    );

    // Check required fields, email format and custom rules
    if (!contactForm.reportValidity()) {
        return;
    }

    formStatus.textContent =
        "Your entries are valid. No message has been sent. " +
        "Please use the email link above to contact me.";
});

// Clear old errors and results when the user edits a field
[contactName, contactEmail, contactMessage].forEach(function (field) {
    field.addEventListener("input", function () {
        field.setCustomValidity("");
        formStatus.textContent = "";
    });
});
