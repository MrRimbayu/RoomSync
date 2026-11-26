/* =========================================
   JS FOR LIBRARIAN SIDEBAR
   ========================================= */
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');

    // 1. Masukkan HTML Sidebar terus ke dalam <aside id="sidebar">
    if (sidebar) {
        sidebar.innerHTML = `
            <a href="librarian_dashboard.html" class="sidebar-brand">
                <i class="bi bi-door-open-fill text-primary me-2"></i>
                <span>RoomSync</span>
            </a>

            <div class="sidebar-nav">
                <div class="sidebar-label">Librarian Menu</div>
                <nav class="nav flex-column">
                    <a href="librarian_dashboard.html" class="nav-link">
                        <i class="bi bi-speedometer2"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="manage_rooms.html" class="nav-link">
                        <i class="bi bi-building-gear"></i>
                        <span>Manage Rooms</span>
                    </a>
                    <a href="daily_schedule.html" class="nav-link">
                        <i class="bi bi-calendar-check"></i>
                        <span>Daily Schedule</span>
                    </a>
                    <a href="booking_analytics.html" class="nav-link">
                        <i class="bi bi-bar-chart-line"></i>
                        <span>Analytics</span>
                    </a>
                </nav>
            </div>

            <div class="sidebar-footer">
                <a href="../login.html" class="nav-link text-danger" onclick="logoutUser(); return false;">
                    <i class="bi bi-box-arrow-left"></i>
                    <span>Logout</span>
                </a>
            </div>
        `;

        // 2. Aktifkan menu mengikut halaman semasa
        let currentPage = window.location.pathname.split('/').pop();
        if (!currentPage) {
            currentPage = 'librarian_dashboard.html';
        }
        if (currentPage === 'update_room_status.html') {
            currentPage = 'manage_rooms.html';
        }

        sidebar.querySelectorAll('.nav-link').forEach(function (link) {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// 3. Fungsi Logout (Padam sesi & balik ke login)
function logoutUser() {
    sessionStorage.removeItem('roomSyncCurrentUser');
    window.location.href = '../login.html';
}

document.addEventListener('DOMContentLoaded', function () {
    renderSidebar();
});