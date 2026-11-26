/* =========================================
   JS FOR STUDENT SIDEBAR
   ========================================= */
function renderSidebar() {
    const sidebarContainer = document.getElementById('sidebarContainer');

    // 1. Masukkan HTML Sidebar terus ke dalam <div id="sidebarContainer">
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <aside class="sidebar" id="sidebar">
                <a href="student_dashboard.html" class="sidebar-brand">
                    <i class="bi bi-door-open-fill text-primary me-2"></i>
                    <span>RoomSync</span>
                </a>

                <div class="sidebar-nav">
                    <div class="sidebar-label">Student Menu</div>
                    <nav class="nav flex-column">
                        <a href="student_dashboard.html" class="nav-link">
                            <i class="bi bi-speedometer2"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="room_list.html" class="nav-link">
                            <i class="bi bi-grid-3x3-gap"></i>
                            <span>Browse Rooms</span>
                        </a>
                        <a href="booking_form.html" class="nav-link">
                            <i class="bi bi-calendar-plus"></i>
                            <span>Book a Room</span>
                        </a>
                        <a href="my_bookings.html" class="nav-link">
                            <i class="bi bi-journal-check"></i>
                            <span>My Bookings</span>
                        </a>
                    </nav>
                </div>

                <div class="sidebar-footer">
                    <a href="../login.html" class="nav-link text-danger" onclick="logoutUser(); return false;">
                        <i class="bi bi-box-arrow-left"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </aside>
        `;

        // 2. Aktifkan menu mengikut halaman semasa
        let currentPage = window.location.pathname.split('/').pop();
        if (!currentPage) {
            currentPage = 'student_dashboard.html';
        }
        if (currentPage === 'room_details.html') {
            currentPage = 'room_list.html';
        }
        if (currentPage === 'booking_confirmation.html') {
            currentPage = 'booking_form.html';
        }

        sidebarContainer.querySelectorAll('.nav-link').forEach(function (link) {
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