/* 
- Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
- Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// =========================================
// RoomSync Global Scripts (Shared Across Pages)
// =========================================

// Default test student users when no backend database is used [Ref: login.html, register.html]
const DEFAULT_ROOMSYNC_USERS = [
    {
        user_id: "2026119161",
        full_name: "Student User",
        email: "2026119161@student.uitm.edu.my",
        password: "123456",
        role: "Student"
    },
    {
        user_id: "S12345",
        full_name: "Ahmad Daniel",
        email: "S12345@staff.uitm.edu.my",
        password: "123456",
        role: "Librarian"
    }
];

// [Ref: register.html] Setup student registration validation, duplicate check & localStorage save
function setupRegisterPage() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const userIdRaw = document.getElementById("userId").value.trim();
        const userId = parseInt(userIdRaw, 10);
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const roleEl = document.getElementById("role");
        const role = roleEl && roleEl.value ? roleEl.value.trim() : "Student";
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const errorAlert = document.getElementById("errorAlert");
        const errorText = document.getElementById("errorText");
        const successAlert = document.getElementById("successAlert");
        const successText = document.getElementById("successText");

        // [Ref: register.html] Hide previous alert messages
        if (errorAlert) errorAlert.classList.add("d-none");
        if (successAlert) successAlert.classList.add("d-none");

        // [Ref: register.html] Validate password confirmation match
        if (password !== confirmPassword) {
            if (errorText) errorText.textContent = "Passwords do not match.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        // [Ref: register.html] Retrieve existing registered users and merge with default accounts
        const registeredUsers = JSON.parse(localStorage.getItem("roomSyncUsers") || "[]");
        const allUsers = [...DEFAULT_ROOMSYNC_USERS, ...registeredUsers];

        // [Ref: register.html] Prevent duplicate Student ID or Email
        const isDuplicateId = allUsers.some((u) => parseInt(u.user_id, 10) === userId);
        const isDuplicateEmail = allUsers.some((u) => String(u.email).toLowerCase() === email);

        if (isDuplicateId) {
            if (errorText) errorText.textContent = "Student ID is already registered. Please use a different ID.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        if (isDuplicateEmail) {
            if (errorText) errorText.textContent = "Email address is already registered.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        // [Ref: register.html -> login.html] Save new student account into localStorage
        const newUser = {
            user_id: String(userId),
            full_name: fullName,
            email: email,
            password: password,
            role: role
        };

        registeredUsers.push(newUser);
        localStorage.setItem("roomSyncUsers", JSON.stringify(registeredUsers));

        if (successText) {
            successText.textContent = "Registration successful! Redirecting to login page...";
        }
        if (successAlert) successAlert.classList.remove("d-none");
        registerForm.reset();
        if (roleEl) roleEl.value = "Student";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
}

// [Ref: login.html] Setup login page session redirect and student form authentication
function setupLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.action = "student/student_dashboard.html";

    // [Ref: login.html] Redirect immediately if an active student session already exists
    const activeUser = JSON.parse(sessionStorage.getItem("roomSyncCurrentUser") || "null");
    if (activeUser && activeUser.user_id) {
        window.location.href = "student/student_dashboard.html";
        return;
    }

    // [Ref: login.html] Validate Student ID and password against default & registered localStorage users
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const userIdInput = document.getElementById("userId").value.trim();
        const password = document.getElementById("password").value;
        const errorAlert = document.getElementById("errorAlert");
        const errorText = document.getElementById("errorText");

        const registeredUsers = JSON.parse(localStorage.getItem("roomSyncUsers") || "[]");
        const allUsers = [...DEFAULT_ROOMSYNC_USERS, ...registeredUsers];

        const foundUser = allUsers.find(
            (u) => String(u.user_id).trim() === userIdInput && u.password === password
        );

        if (!foundUser) {
            if (errorText) errorText.textContent = "Invalid Student ID or password.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        if (errorAlert) errorAlert.classList.add("d-none");

        // [Ref: login.html -> booking_form.html] Save active student session into sessionStorage
        sessionStorage.setItem("roomSyncCurrentUser", JSON.stringify({
            user_id: foundUser.user_id,
            full_name: foundUser.full_name,
            email: foundUser.email,
            role: "Student"
        }));

        window.location.href = "student/student_dashboard.html";
    });
}

// [Ref: booking_form.html, booking_confirmation.html, my_bookings.html] 1. Format 24-hour integer to 12-hour string
function formatTime12Hour(hour24) {
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, "0")}:00 ${period}`;
}

// [Ref: my_bookings.html] Parse 12-hour time string (e.g., "02:00 PM") into hour and minute parts
function parse12HourTo24(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "AM") {
        if (hour === 12) hour = 0;
    } else if (period === "PM") {
        if (hour !== 12) hour += 12;
    }

    return { hour, minute };
}

// [Ref: my_bookings.html] Parse date string in DD/MM/YYYY or YYYY-MM-DD format into Date parts
function parseDateParts(dateStr) {
    if (!dateStr) return null;
    const trimmed = dateStr.trim();

    if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        if (parts.length === 3) {
            return {
                day: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                year: parseInt(parts[2], 10)
            };
        }
    } else if (trimmed.includes("-")) {
        const parts = trimmed.split("-");
        if (parts.length === 3) {
            return {
                year: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                day: parseInt(parts[2], 10)
            };
        }
    }
    return null;
}

// [Ref: my_bookings.html] Check whether booking end date & time have already passed
function isBookingExpired(booking) {
    const dateDisplay = booking.bookingDate || booking.date;
    const dateParts = parseDateParts(booking.rawDate || dateDisplay);
    const timeParts = parse12HourTo24(booking.endTime);

    if (!dateParts || !timeParts) return false;

    const endDateTime = new Date(
        dateParts.year,
        dateParts.month - 1,
        dateParts.day,
        timeParts.hour,
        timeParts.minute,
        0
    );

    return new Date() >= endDateTime;
}

// [Ref: my_bookings.html] Return Bootstrap badge HTML according to booking status
function getStatusBadgeHtml(statusText) {
    if (statusText === "Cancelled") {
        return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill">Cancelled</span>';
    }
    if (statusText === "Completed") {
        return '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill">Completed</span>';
    }
    return '<span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">Approved</span>';
}

// [Ref: booking_form.html, my_bookings.html] Update Remaining Weekly Quota indicator (6.0 hrs weekly limit)
function updateWeeklyQuotaDisplay() {
    const quotaEl = document.getElementById("remainingQuotaText");
    if (!quotaEl) return;

    const totalWeeklyQuota = 6.0;
    const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];

    const usedHours = savedBookings.reduce((sum, booking) => {
        const status = booking.bookingStatus || "Approved";
        if (status === "Cancelled") return sum;
        const hrs = parseFloat(booking.duration) || 0;
        return sum + hrs;
    }, 0);

    const remainingHours = Math.max(0, totalWeeklyQuota - usedHours);
    quotaEl.textContent = `${remainingHours.toFixed(1)} / ${totalWeeklyQuota.toFixed(1)} hrs`;
}

// [Ref: booking_confirmation.html] 2. Load booking confirmation details from URL params or localStorage fallback
function loadBookingConfirmation() {
    const roomNameEl = document.getElementById("room_name");
    if (!roomNameEl) return;

    const params = new URLSearchParams(window.location.search);

    // [Ref: booking_confirmation.html] Fallback to latest saved booking in localStorage if needed
    const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
    const latestBooking = savedBookings.length > 0 ? savedBookings[savedBookings.length - 1] : null;

    // [Ref: booking_confirmation.html] Room details lookup
    const roomData = {
        "Discussion Room A": { location: "Library, Level 2 (East Wing)", capacity: "6 Students" },
        "Discussion Room B": { location: "Library, Level 2 (West Wing)", capacity: "8 Students" },
        "Group Study Pod 1": { location: "Library, Level 1 (Quiet Zone)", capacity: "4 Students" },
        "Presentation Lab 1": { location: "Library, Level 3 (Media Zone)", capacity: "12 Students" },
        "Computer & Multimedia Room": { location: "Library, Level 3 (Digital Hub)", capacity: "20 Students" },
        "Library Mini Auditorium": { location: "Library, Ground Floor", capacity: "30 Students" }
    };

    const selectedRoom = (params.get("roomName") || (latestBooking && latestBooking.roomName) || "Discussion Room A").trim();
    const info = roomData[selectedRoom] || { location: "Library, Level 2", capacity: "6 Students" };

    roomNameEl.textContent = selectedRoom;

    const roomLocationEl = document.getElementById("room_location");
    const roomCapacityEl = document.getElementById("room_capacity");
    if (roomLocationEl) roomLocationEl.textContent = info.location;
    if (roomCapacityEl) roomCapacityEl.textContent = info.capacity;

    // [Ref: booking_confirmation.html] Student booking details
    const bookingDateRaw = params.get("bookingDate") || (latestBooking && latestBooking.rawDate) || (latestBooking && latestBooking.bookingDate) || "-";
    const paxRaw = params.get("pax") || (latestBooking && latestBooking.pax) || "";
    const purposeRaw = params.get("purpose") || (latestBooking && latestBooking.purpose) || "-";

    const bookingDateEl = document.getElementById("booking_date");
    const paxEl = document.getElementById("pax") || document.getElementById("students");
    const purposeEl = document.getElementById("purpose");

    if (bookingDateEl) bookingDateEl.textContent = bookingDateRaw.trim() || "-";
    if (paxEl) paxEl.textContent = paxRaw.toString().trim() !== "" ? `${paxRaw.toString().trim()} Students` : "-";
    if (purposeEl) purposeEl.textContent = purposeRaw.toString().trim() || "-";

    // [Ref: booking_confirmation.html] Format start time and calculate end time from duration
    const startTimeRaw = params.get("startTime") || (latestBooking && latestBooking.rawStartTime) || "";
    const durationRaw = params.get("duration") || (latestBooking && latestBooking.duration) || "0";
    const duration = parseInt(durationRaw, 10);

    const startTimeEl = document.getElementById("start_time");
    const endTimeEl = document.getElementById("end_time");

    if (startTimeRaw) {
        const startHour = parseInt(startTimeRaw.split(":")[0], 10);
        if (!isNaN(startHour)) {
            if (startTimeEl) startTimeEl.textContent = formatTime12Hour(startHour);
            if (endTimeEl) {
                endTimeEl.textContent = duration > 0 ? formatTime12Hour(startHour + duration) : "-";
            }
        }
    }
}

// [Ref: booking_form.html] 2b. Populate logged-in user info & sync room summary card
function setupBookingFormUI() {
    const roomSelect = document.getElementById("roomSelect") || document.getElementById("roomName");
    if (!roomSelect) return;

    // [Ref: booking_form.html] Populate student name, ID, and topbar role badge from sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem("roomSyncCurrentUser") || "null");
    const studentNameEl = document.getElementById("studentName");
    const studentIdEl = document.getElementById("studentId");
    const topbarBadgeEl = document.getElementById("topbarUserBadge");

    if (studentNameEl) {
        studentNameEl.value = currentUser && currentUser.full_name ? currentUser.full_name : "";
    }
    if (studentIdEl) {
        studentIdEl.value = currentUser && currentUser.user_id ? currentUser.user_id : "";
    }
    if (topbarBadgeEl) {
        const roleLabel = currentUser && currentUser.role ? currentUser.role : "Student";
        topbarBadgeEl.innerHTML = `<i class="bi bi-person-circle me-1"></i> ${roleLabel}`;
    }

    // [Ref: booking_form.html] Room metadata for right-column summary card & pax max limit
    const roomDetailsMap = {
        "Discussion Room A": { location: "Level 2, East Wing", capacity: 6 },
        "Discussion Room B": { location: "Level 2, East Wing", capacity: 8 },
        "Group Study Pod 1": { location: "Level 1, Quiet Zone", capacity: 4 },
        "Presentation Lab 1": { location: "Level 3, Media Zone", capacity: 12 },
        "Computer & Multimedia Room": { location: "Level 3, Digital Hub", capacity: 20 },
        "Library Mini Auditorium": { location: "Level 3, Main Hall", capacity: 30 }
    };

    const summaryTitle = document.getElementById("summaryRoomTitle");
    const summaryMeta = document.getElementById("summaryRoomMeta");
    const paxInput = document.getElementById("pax");

    function updateRoomSummary() {
        const selectedRoom = roomSelect.value;
        const info = roomDetailsMap[selectedRoom];

        if (summaryTitle && selectedRoom) {
            summaryTitle.textContent = selectedRoom;
        }
        if (summaryMeta && info) {
            summaryMeta.innerHTML = `<i class="bi bi-geo-alt me-1"></i>${info.location} &bull; Max ${info.capacity} Students`;
        }
        if (paxInput && info) {
            paxInput.max = info.capacity;
        }
    }

    roomSelect.addEventListener("change", updateRoomSummary);
    updateRoomSummary();
}

// [Ref: booking_form.html] 3. Capture booking form data and save to localStorage
function setupBookingForm() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    form.addEventListener("submit", function () {
        const roomSelectEl = document.getElementById("roomSelect") || document.getElementById("roomName");
        const roomName = roomSelectEl ? roomSelectEl.value : "";
        const bookingDate = document.getElementById("bookingDate").value;
        const startTimeRaw = document.getElementById("startTime").value;
        const duration = parseInt(document.getElementById("duration").value || "1", 10);
        const pax = document.getElementById("pax").value;
        const purpose = document.getElementById("purpose").value;
        const bookingStatusEl = document.getElementById("bookingStatus");
        const bookingStatus = bookingStatusEl ? bookingStatusEl.value : "Approved";

        // [Ref: booking_form.html] Calculate formatted start and end time
        const startHour = parseInt(startTimeRaw.split(":")[0], 10);
        const endHour = startHour + duration;

        const startTimeFormatted = formatTime12Hour(startHour);
        const endTimeFormatted = formatTime12Hour(endHour);

        // [Ref: booking_form.html] Format date from YYYY-MM-DD to DD/MM/YYYY
        const dateParts = bookingDate.split("-");
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : bookingDate;

        // [Ref: booking_form.html -> my_bookings.html] New booking object saved to localStorage
        const newBooking = {
            roomName: roomName,
            bookingDate: formattedDate,
            rawDate: bookingDate,
            startTime: startTimeFormatted,
            rawStartTime: startTimeRaw,
            duration: duration,
            endTime: endTimeFormatted,
            pax: pax,
            purpose: purpose,
            bookingStatus: bookingStatus
        };

        let bookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
        bookings.push(newBooking);
        localStorage.setItem("roomSyncBookings", JSON.stringify(bookings));
    });
}

// [Ref: my_bookings.html] 4. Load booking history rows dynamically into #bookingTableBody
function loadMyBookings() {
    const tableBody = document.getElementById("bookingTableBody");
    if (!tableBody) return;

    // [Ref: my_bookings.html] Default sample bookings seeded once into localStorage if not initialized yet
    const defaultBookings = [
        {
            roomName: "Discussion Room A",
            bookingDate: "20/11/2026",
            rawDate: "2026-11-20",
            startTime: "10:00 AM",
            rawStartTime: "10:00",
            duration: 2,
            endTime: "12:00 PM",
            pax: 5,
            purpose: "Group Discussion",
            bookingStatus: "Approved"
        },
        {
            roomName: "Discussion Room B",
            bookingDate: "22/11/2026",
            rawDate: "2026-11-22",
            startTime: "02:00 PM",
            rawStartTime: "14:00",
            duration: 2,
            endTime: "04:00 PM",
            pax: 6,
            purpose: "Group Assignment",
            bookingStatus: "Approved"
        }
    ];

    if (localStorage.getItem("roomSyncBookings") === null) {
        localStorage.setItem("roomSyncBookings", JSON.stringify(defaultBookings));
    }

    // [Ref: my_bookings.html] Retrieve bookings and auto-mark expired approved bookings as Completed
    let savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
    let savedUpdated = false;

    savedBookings = savedBookings.map((b) => {
        const item = { ...b };
        if ((item.bookingStatus || "Approved") === "Approved" && isBookingExpired(item)) {
            item.bookingStatus = "Completed";
            savedUpdated = true;
        }
        return item;
    });

    if (savedUpdated) {
        localStorage.setItem("roomSyncBookings", JSON.stringify(savedBookings));
    }

    tableBody.innerHTML = "";

    // [Ref: my_bookings.html] Render table rows (9 columns)
    savedBookings.forEach((b, index) => {
        const roomName = b.roomName || "-";
        const bookingDateDisplay = b.bookingDate || b.date || "-";
        const bookingDateParam = b.rawDate || "2026-11-20";
        const startTime = b.startTime || "-";
        const startTimeParam = b.rawStartTime || "10:00";
        const durationParam = b.duration || 2;
        const endTime = b.endTime || "-";
        const paxDisplay = b.pax !== undefined && b.pax !== "" ? b.pax : "-";
        const paxParam = b.pax !== undefined && b.pax !== "" ? b.pax : "";
        const purpose = b.purpose || "-";
        const statusText = b.bookingStatus || "Approved";

        const isFinalStatus = statusText === "Cancelled" || statusText === "Completed";
        const cancelBtnHtml = isFinalStatus
            ? `<button type="button" class="btn btn-sm btn-secondary" disabled>${statusText === "Cancelled" ? "Cancelled" : "Cancel"}</button>`
            : `<button type="button" class="btn btn-sm btn-outline-danger" onclick="cancelBooking(this, ${index})">Cancel</button>`;

        const deleteBtnHtml = `<button type="button" class="btn btn-sm btn-outline-dark" onclick="deleteBooking(${index})" title="Delete from localStorage">Delete</button>`;

        const urlParam = `roomName=${encodeURIComponent(roomName)}&bookingDate=${encodeURIComponent(bookingDateParam)}&startTime=${encodeURIComponent(startTimeParam)}&duration=${encodeURIComponent(durationParam)}&pax=${encodeURIComponent(paxParam)}&purpose=${encodeURIComponent(purpose)}`;

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <a href="booking_confirmation.html?${urlParam}" class="fw-semibold text-decoration-none text-primary">
                        ${roomName}
                    </a>
                </td>
                <td>${bookingDateDisplay}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
                <td>${paxDisplay}</td>
                <td>${purpose}</td>
                <td class="booking-status">
                    ${getStatusBadgeHtml(statusText)}
                </td>
                <td class="text-end">
                    <div class="d-inline-flex gap-1">
                        ${cancelBtnHtml}
                        ${deleteBtnHtml}
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    updateWeeklyQuotaDisplay();
}

// [Ref: my_bookings.html] 5. Cancel a booking row and persist status in localStorage
function cancelBooking(button, savedIndex) {
    if (confirm("Are you sure you want to cancel this room booking?")) {
        const row = button.closest("tr");

        const statusCell = row.querySelector(".booking-status");
        if (statusCell) {
            statusCell.innerHTML = getStatusBadgeHtml("Cancelled");
        }

        if (savedIndex >= 0) {
            const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
            if (savedBookings[savedIndex]) {
                savedBookings[savedIndex].bookingStatus = "Cancelled";
                localStorage.setItem("roomSyncBookings", JSON.stringify(savedBookings));
            }
        }

        button.textContent = "Cancelled";
        button.classList.remove("btn-outline-danger");
        button.classList.add("btn-secondary");
        button.disabled = true;

        updateWeeklyQuotaDisplay();
    }
}

// [Ref: my_bookings.html] 6. Delete a saved booking from localStorage and refresh table & quota
function deleteBooking(savedIndex) {
    if (savedIndex < 0) return;

    if (confirm("Are you sure you want to delete this booking from local storage?")) {
        const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
        savedBookings.splice(savedIndex, 1);
        localStorage.setItem("roomSyncBookings", JSON.stringify(savedBookings));
        loadMyBookings();
    }
}

// [Ref: register.html, login.html, booking_form.html, booking_confirmation.html, my_bookings.html, components.js] 7. Global initialization
document.addEventListener("DOMContentLoaded", () => {
    setupRegisterPage();
    setupLoginPage();
    loadBookingConfirmation();
    setupBookingFormUI();
    setupBookingForm();
    loadMyBookings();
    updateWeeklyQuotaDisplay();

    // [Ref: components.js & student pages] Toggle sidebar for desktop and mobile views
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");
    const toggleBtn = document.getElementById("sidebarToggle");

    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener("click", function () {
            if (window.innerWidth < 992) {
                sidebar.classList.toggle("show");
            } else {
                sidebar.classList.toggle("collapsed");
                mainContent.classList.toggle("expanded");
            }
        });
    }
});