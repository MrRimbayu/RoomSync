// =========================================
// RoomSync Reusable Components (Sidebar & Auth)
// =========================================

function renderSidebar() {
    const sidebarContainer = document.getElementById("sidebarContainer");
    if (!sidebarContainer) return;

    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf("/") + 1);
    const isLibrarian = path.includes("/librarian/");

    // Determine menu items based on folder (student vs librarian)
    const brandLink = isLibrarian ? "librarian_dashboard.html" : "student_dashboard.html";
    const menuLabel = isLibrarian ? "Librarian Menu" : "Student Menu";

    const menuItems = isLibrarian
        ? [
              { href: "librarian_dashboard.html", icon: "bi-speedometer2", label: "Dashboard" },
              { href: "manage_rooms.html", icon: "bi-building-gear", label: "Manage Rooms" },
              { href: "daily_schedule.html", icon: "bi-calendar-check", label: "Daily Schedule" },
              { href: "booking_analytics.html", icon: "bi-bar-chart-line", label: "Analytics" }
          ]
        : [
              { href: "student_dashboard.html", icon: "bi-speedometer2", label: "Dashboard" },
              { href: "room_list.html", icon: "bi-grid-3x3-gap", label: "Browse Rooms" },
              { href: "booking_form.html", icon: "bi-calendar-plus", label: "Book a Room" },
              { href: "my_bookings.html", icon: "bi-journal-check", label: "My Bookings" }
          ];

    const navLinksHTML = menuItems
        .map((item) => {
            const activeClass = currentPage === item.href ? " active" : "";
            return `
                <a class="nav-link${activeClass}" href="${item.href}">
                    <i class="bi ${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `;
        })
        .join("");

    sidebarContainer.innerHTML = `
        <aside class="sidebar" id="sidebar">
            <a href="${brandLink}" class="sidebar-brand">
                <i class="bi bi-door-open-fill text-primary me-2"></i>
                <span>RoomSync</span>
            </a>

            <div class="sidebar-nav">
                <div class="sidebar-label">${menuLabel}</div>
                <nav class="nav flex-column">
                    ${navLinksHTML}
                </nav>
            </div>

            <div class="sidebar-footer">
                <a href="#" class="btn btn-outline-danger btn-sm w-100" onclick="logoutUser(); return false;">
                    <i class="bi bi-box-arrow-right me-1"></i> Logout
                </a>
            </div>
        </aside>
    `;
}

// Global Logout Function
function logoutUser() {
    sessionStorage.removeItem("roomSyncCurrentUser");
    const isInSubfolder =
        window.location.pathname.includes("/student/") ||
        window.location.pathname.includes("/librarian/");
    window.location.href = isInSubfolder ? "../login.html" : "login.html";
}

// Render sidebar immediately so script.js toggle button can attach to #sidebar
document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
});