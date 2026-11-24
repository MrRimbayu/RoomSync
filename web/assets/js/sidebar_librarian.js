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
    <a href="../login.html" class="nav-link text-danger">
        <i class="bi bi-box-arrow-left"></i>
        <span>Logout</span>
    </a>
</div>

/* =========================================
   JS FOR SIDEBAR
   ========================================= */
document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('sidebarToggle');

    // 1. Fungsi Toggle Sidebar (Kuncup / Kembang)
    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', function () {
            if (window.innerWidth < 992) {
                sidebar.classList.toggle('show');
            } else {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        });
    }

    // 2. Muatkan sidebar_librarian.js ke dalam <aside id="sidebar">
    if (sidebar && sidebar.innerHTML.trim() === '') {
        fetch('sidebar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fail sidebar.html tidak dijumpai');
                }
                return response.text();
            })
            .then(html => {
                sidebar.innerHTML = html;

                // Aktifkan menu mengikut halaman semasa
                let currentPage = window.location.pathname.split('/').pop() || 'librarian_dashboard.html';
                if (currentPage === 'update_room_status.html') {
                    currentPage = 'manage_rooms.html';
                }

                sidebar.querySelectorAll('.nav-link').forEach(link => {
                    if (link.getAttribute('href') === currentPage) {
                        link.classList.add('active');
                    }
                });
            })
            .catch(error => console.error('Sidebar Error:', error));
    }
});
