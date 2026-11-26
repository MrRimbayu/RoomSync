/* 
- Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
- Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// =========================================
// RoomSync Global Scripts (Shared Across Pages)
// =========================================

// Default test student & librarian users when no backend database is used [Ref: login.html, register.html]
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
        password: "lib123",
        role: "Librarian"
    }
];

//[Ref: register.html] Setup register page form validation and save new user to localStorage
function setupRegisterPage() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    // Run this code when the user clicks the Create Account button
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Stop the page from refreshing automatically

        // Get all input values from the registration form
        const userId = document.getElementById("userId").value.trim();
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        
        const facultyEl = document.getElementById("faculty");
        let faculty = "";
        if (facultyEl) {
            faculty = facultyEl.value.trim();
        }

        const roleEl = document.getElementById("role");
        let role = "Student";
        if (roleEl && roleEl.value) {
            role = roleEl.value.trim();
        }

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Get error and success alert boxes
        const errorAlert = document.getElementById("errorAlert");
        const errorText = document.getElementById("errorText");
        const successAlert = document.getElementById("successAlert");
        const successText = document.getElementById("successText");

        // Hide old alert messages before checking again
        if (errorAlert) errorAlert.classList.add("d-none");
        if (successAlert) successAlert.classList.add("d-none");

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            if (errorText) errorText.textContent = "Passwords do not match.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        // Load existing registered users and combine with default test accounts
        const registeredUsers = JSON.parse(localStorage.getItem("roomSyncUsers") || "[]");
        const allUsers = [...DEFAULT_ROOMSYNC_USERS, ...registeredUsers];

        // Check if the ID or Email is already taken
        const isDuplicateId = allUsers.some(
            (u) => String(u.user_id).trim().toLowerCase() === userId.toLowerCase()
        );
        const isDuplicateEmail = allUsers.some(
            (u) => String(u.email).trim().toLowerCase() === email
        );

        // Show error message if ID already exists
        if (isDuplicateId) {
            if (errorText) errorText.textContent = "Student / Staff ID is already registered.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        // Show error message if Email already exists
        if (isDuplicateEmail) {
            if (errorText) errorText.textContent = "Email address is already registered.";
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        // Create a new user object with the form details
        const newUser = {
            user_id: userId,
            full_name: fullName,
            email: email,
            faculty: faculty,
            password: password,
            role: role
        };

        // Add new user to the list and save it into localStorage
        registeredUsers.push(newUser);
        localStorage.setItem("roomSyncUsers", JSON.stringify(registeredUsers));

        // Show green success message and clear the form
        if (successText) {
            successText.textContent = "Registration successful! Redirecting to login page...";
        }
        if (successAlert) successAlert.classList.remove("d-none");
        registerForm.reset();

        // Wait 1.5 seconds, then go to the login page
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
}

// [Ref: login.html] Update form action based on selected role dropdown
function updateLoginDestination() {
    const loginForm = document.getElementById("loginForm");
    const userRoleEl = document.getElementById("userRole");
    if (!loginForm || !userRoleEl) return;

    if (userRoleEl.value === "librarian") {
        loginForm.action = "librarian/librarian_dashboard.html";
    } else {
        loginForm.action = "student/student_dashboard.html";
    }
}

// [Ref: login.html] Setup login page session redirect and role-based authentication
function setupLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const userRoleEl = document.getElementById("userRole");
    updateLoginDestination();

    // [Ref: login.html] Redirect immediately if an active session already exists
    const activeUser = JSON.parse(sessionStorage.getItem("roomSyncCurrentUser") || "null");
    if (activeUser && activeUser.user_id) {
        if (String(activeUser.role).toLowerCase() === "librarian") {
            window.location.href = "librarian/librarian_dashboard.html";
        } else {
            window.location.href = "student/student_dashboard.html";
        }
        return;
    }

    // [Ref: login.html] Validate ID, password, and role against default & registered users
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedRole = userRoleEl ? userRoleEl.value.toLowerCase() : "student";
        const userIdInput = document.getElementById("userId").value.trim();
        const password = document.getElementById("password").value;
        const errorAlert = document.getElementById("errorAlert");
        const errorText = document.getElementById("errorText");

        const registeredUsers = JSON.parse(localStorage.getItem("roomSyncUsers") || "[]");
        const allUsers = [...DEFAULT_ROOMSYNC_USERS, ...registeredUsers];

        const foundUser = allUsers.find((u) => {
            const matchId = String(u.user_id).trim().toLowerCase() === userIdInput.toLowerCase();
            const matchPass = u.password === password;
            const matchRole = String(u.role).toLowerCase() === selectedRole;
            return matchId && matchPass && matchRole;
        });

        if (!foundUser) {
            if (errorText) {
                errorText.textContent = "Invalid ID, password, or selected role.";
            }
            if (errorAlert) errorAlert.classList.remove("d-none");
            return;
        }

        if (errorAlert) errorAlert.classList.add("d-none");

        // [Ref: login.html] Save active user session into sessionStorage
        sessionStorage.setItem("roomSyncCurrentUser", JSON.stringify({
            user_id: foundUser.user_id,
            full_name: foundUser.full_name,
            email: foundUser.email,
            role: foundUser.role
        }));

        if (selectedRole === "librarian") {
            window.location.href = "librarian/librarian_dashboard.html";
        } else {
            window.location.href = "student/student_dashboard.html";
        }
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

    // [Ref: booking_confirmation.html] Room details lookup (synced with room_list.html)
    const roomData = {
        "Discussion Room A": { location: "Library, Level 2 (East Wing)", capacity: "6 Students" },
        "Presentation Lab 1": { location: "Library, Level 3 (Media Zone)", capacity: "12 Students" },
        "Group Study Pod 1": { location: "Library, Level 1 (Quiet Zone)", capacity: "4 Students" },
        "Discussion Room B": { location: "Library, Level 2 (West Wing)", capacity: "8 Students" },
        "Computer & Multimedia Room": { location: "Library, Level 3 (Digital Hub)", capacity: "20 Students" }
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

// Helper: Normalize booking date to YYYY-MM-DD for accurate slot comparison
function normalizeBookingDateToISO(booking) {
    if (booking.rawDate && booking.rawDate.includes("-")) {
        return booking.rawDate.trim();
    }
    const parts = parseDateParts(booking.bookingDate || booking.date || "");
    if (!parts) return "";
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

// Helper: Get occupied start hours for a room & date
function getOccupiedHoursForRoomAndDate(roomName, dateISO) {
    const occupied = new Set();
    if (!roomName || !dateISO) return occupied;

    const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
    savedBookings.forEach((b) => {
        const status = b.bookingStatus || "Approved";
        if (status === "Cancelled") return;
        if ((b.roomName || "").trim() !== roomName.trim()) return;
        if (normalizeBookingDateToISO(b) !== dateISO.trim()) return;

        let startH = null;
        if (b.rawStartTime && b.rawStartTime.includes(":")) {
            startH = parseInt(b.rawStartTime.split(":")[0], 10);
        } else if (b.startTime) {
            const parsed = parse12HourTo24(b.startTime);
            if (parsed) startH = parsed.hour;
        }

        const dur = parseInt(b.duration, 10) || 1;
        if (startH !== null && !isNaN(startH)) {
            for (let h = startH; h < startH + dur; h++) {
                occupied.add(h);
            }
        }
    });

    return occupied;
}

// [Ref: booking_form.html] 2b. Populate logged-in user info, sync room dropdown with room_list, sync summary card, handle Back routing, lock preselected room & disable taken timeslots
function setupBookingFormUI() {
    // Auto-detect study space <select> regardless of its HTML id attribute
    let roomSelect = document.getElementById("roomSelect") || document.getElementById("roomName");
    if (!roomSelect) {
        roomSelect = Array.from(document.querySelectorAll("select")).find((sel) =>
            Array.from(sel.options).some(
                (opt) => opt.text.includes("Discussion Room A") || opt.text.includes("Library Mini Auditorium")
            )
        );
    }
    // Exit early if not on booking_form.html (e.g., update_room_status.html also has #roomSelect)
    if (!roomSelect || document.getElementById("updateStatusForm")) return;

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

    // [Ref: booking_form.html] Room metadata synced 100% with room_list.html & room_details.html
    const roomDetailsMap = {
        "Discussion Room A": { id: "1", location: "Level 2, East Wing", capacity: 6, status: "Available" },
        "Presentation Lab 1": { id: "2", location: "Level 3, Media Zone", capacity: 12, status: "Available" },
        "Group Study Pod 1": { id: "3", location: "Level 1, Quiet Zone", capacity: 4, status: "Available" },
        "Discussion Room B": { id: "4", location: "Level 2, West Wing", capacity: 8, status: "Occupied" },
        "Computer & Multimedia Room": { id: "5", location: "Level 3, Digital Hub", capacity: 20, status: "Maintenance" }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedRoom = urlParams.get("roomName");
    const fromSource = urlParams.get("from");
    const roomIdParam = urlParams.get("room_id");

    // 0. Replace hardcoded options (e.g. Library Mini Auditorium) with the exact 5 synced rooms
    const currentSelection = preselectedRoom || roomSelect.value;
    roomSelect.innerHTML = "";
    Object.keys(roomDetailsMap).forEach((roomName) => {
        const info = roomDetailsMap[roomName];
        const opt = document.createElement("option");
        opt.value = roomName;
        if (info.status === "Maintenance") {
            opt.textContent = `${roomName} (${info.capacity} Students - Maintenance)`;
            opt.disabled = true;
        } else {
            opt.textContent = `${roomName} (${info.capacity} Students)`;
        }
        roomSelect.appendChild(opt);
    });

    if (currentSelection && roomDetailsMap[currentSelection] && roomDetailsMap[currentSelection].status !== "Maintenance") {
        roomSelect.value = currentSelection;
    } else {
        roomSelect.value = "Discussion Room A";
    }

    // 1. Dynamic Back button destination (room_list vs selected room's room_details)
    const backLinks = document.querySelectorAll('a[href*="room_details.html"], a[href*="room_list.html"], #backToRoomBtn');
    backLinks.forEach((link) => {
        if (link.closest("#sidebar") || link.closest("#sidebarContainer")) return;
        if (fromSource === "room_list") {
            link.href = "room_list.html";
            if (link.textContent.toLowerCase().includes("back")) {
                link.innerHTML = '<i class="bi bi-arrow-left me-1"></i> Back to Browse Rooms';
            }
        } else if (fromSource === "room_details") {
            const matchedInfo = preselectedRoom ? roomDetailsMap[preselectedRoom] : null;
            const targetId = roomIdParam || (matchedInfo && matchedInfo.id) || "1";
            link.href = `room_details.html?room_id=${encodeURIComponent(targetId)}`;
            if (link.textContent.toLowerCase().includes("back")) {
                link.innerHTML = `<i class="bi bi-arrow-left me-1"></i> Back to ${preselectedRoom || "Room Details"}`;
            }
        }
    });

    // 2. Auto-select & lock room dropdown when redirected from a specific room ("Book Now" / "Book This Room")
    if (preselectedRoom && roomDetailsMap[preselectedRoom]) {
        roomSelect.value = preselectedRoom;
        roomSelect.classList.add("bg-light", "text-muted");
        roomSelect.style.pointerEvents = "none";
        roomSelect.setAttribute("tabindex", "-1");
        roomSelect.setAttribute("aria-readonly", "true");
    }

    const summaryTitle = document.getElementById("summaryRoomTitle");
    const summaryMeta = document.getElementById("summaryRoomMeta");
    const paxInput = document.getElementById("pax");
    const bookingDateInput = document.getElementById("bookingDate");
    const startTimeSelect = document.getElementById("startTime");
    const durationSelect = document.getElementById("duration");

    // 3. Grey out / disable already-booked time slots for the selected room & date
    function updateAvailableTimeSlots() {
        if (!startTimeSelect) return;

        const selectedRoom = roomSelect.value;
        const selectedDate = bookingDateInput ? bookingDateInput.value : "";
        const occupiedHours = getOccupiedHoursForRoomAndDate(selectedRoom, selectedDate);

        Array.from(startTimeSelect.options).forEach((opt) => {
            if (!opt.value) return;

            if (!opt.dataset.originalLabel) {
                opt.dataset.originalLabel = opt.textContent;
            }

            const hour = parseInt(opt.value.split(":")[0], 10);
            if (!isNaN(hour) && occupiedHours.has(hour)) {
                opt.disabled = true;
                opt.textContent = `${opt.dataset.originalLabel} (Booked)`;
                opt.style.color = "#9ca3af";
            } else {
                opt.disabled = false;
                opt.textContent = opt.dataset.originalLabel;
                opt.style.color = "";
            }
        });

        const currentOpt = startTimeSelect.options[startTimeSelect.selectedIndex];
        if (currentOpt && currentOpt.disabled) {
            const firstAvailable = Array.from(startTimeSelect.options).find((o) => !o.disabled && o.value);
            startTimeSelect.value = firstAvailable ? firstAvailable.value : "";
        }

        if (durationSelect && startTimeSelect.value) {
            const startHour = parseInt(startTimeSelect.value.split(":")[0], 10);
            Array.from(durationSelect.options).forEach((durOpt) => {
                const dur = parseInt(durOpt.value, 10);
                if (isNaN(dur)) return;

                let overlaps = false;
                for (let h = startHour; h < startHour + dur; h++) {
                    if (occupiedHours.has(h)) {
                        overlaps = true;
                        break;
                    }
                }
                durOpt.disabled = overlaps;
            });

            const currentDurOpt = durationSelect.options[durationSelect.selectedIndex];
            if (currentDurOpt && currentDurOpt.disabled) {
                const firstValidDur = Array.from(durationSelect.options).find((o) => !o.disabled);
                if (firstValidDur) durationSelect.value = firstValidDur.value;
            }
        }
    }

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
        updateAvailableTimeSlots();
    }

    roomSelect.addEventListener("change", updateRoomSummary);
    if (bookingDateInput) {
        bookingDateInput.addEventListener("change", updateAvailableTimeSlots);
    }
    if (startTimeSelect) {
        startTimeSelect.addEventListener("change", updateAvailableTimeSlots);
    }
    updateRoomSummary();
}

// [Ref: booking_form.html] 3. Capture booking form data and save to localStorage
function setupBookingForm() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        let roomSelectEl = document.getElementById("roomSelect") || document.getElementById("roomName");
        if (!roomSelectEl) {
            roomSelectEl = Array.from(form.querySelectorAll("select")).find((sel) =>
                Array.from(sel.options).some((opt) => opt.text.includes("Discussion Room A"))
            );
        }
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

        // Extra guard against duplicate booking on the same room, date & time slot
        const occupiedHours = getOccupiedHoursForRoomAndDate(roomName, bookingDate);
        for (let h = startHour; h < endHour; h++) {
            if (occupiedHours.has(h)) {
                e.preventDefault();
                alert("This time slot is already booked for the selected room and date. Please choose another available time.");
                return;
            }
        }

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
    // Ensure this runs only on my_bookings.html (not daily_schedule.html which also uses #bookingTableBody)
    if (!tableBody || document.getElementById("timelineBody")) return;

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

// [Ref: booking_analytics.html] 8. Setup charts and interactive room filter for Booking Analytics page
function setupBookingAnalyticsPage() {
    const bookingsByRoomEl = document.getElementById("bookingsByRoomChart");
    const utilizationEl = document.getElementById("utilizationDoughnutChart");
    const peakHoursEl = document.getElementById("peakHoursChart");

    // Exit early if not on booking_analytics.html
    if (!bookingsByRoomEl || !utilizationEl || !peakHoursEl) return;

    // [Ref: booking_analytics.html] Total Bookings by Room (Horizontal Bar Chart)
    const bookingsByRoomCtx = bookingsByRoomEl.getContext("2d");
    new Chart(bookingsByRoomCtx, {
        type: "bar",
        data: {
            labels: [
                "RM-101 (Discussion A1)",
                "RM-102 (Discussion A2)",
                "RM-301 (Seminar Pod C1)",
                "RM-202 (Media Room B2)",
                "RM-302 (Seminar Pod C2)",
                "RM-201 (Media Room B1)",
                "RM-401 (Quiet Study D1)",
                "RM-402 (Quiet Study D2)"
            ],
            datasets: [{
                label: "Total Bookings",
                data: [198, 184, 172, 165, 154, 142, 138, 131],
                backgroundColor: "#2563eb",
                hoverBackgroundColor: "#1d4ed8",
                borderRadius: 6,
                barThickness: 18
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });

    // [Ref: booking_analytics.html] Room Utilization Percentage (Doughnut Chart)
    const utilizationCtx = utilizationEl.getContext("2d");
    new Chart(utilizationCtx, {
        type: "doughnut",
        data: {
            labels: ["Utilized (76.4%)", "Available / Idle (23.6%)"],
            datasets: [{
                data: [76.4, 23.6],
                backgroundColor: ["#2563eb", "#e2e8f0"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { boxWidth: 12, font: { size: 12 } }
                }
            }
        }
    });

    // [Ref: booking_analytics.html] Peak Booking Hours (Bar Chart highlighting peak hours in orange)
    const peakHoursCtx = peakHoursEl.getContext("2d");
    const peakHoursChart = new Chart(peakHoursCtx, {
        type: "bar",
        data: {
            labels: ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"],
            datasets: [{
                label: "Avg. Bookings / Hour",
                data: [12, 22, 34, 41, 45, 48, 62, 68, 64, 52, 36, 28, 19],
                backgroundColor: [
                    "#93c5fd", "#93c5fd", "#60a5fa", "#60a5fa", "#3b82f6", "#3b82f6",
                    "#f97316", "#f97316", "#f97316", "#3b82f6", "#60a5fa", "#93c5fd", "#93c5fd"
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // [Ref: booking_analytics.html] Interactive Filter Simulation
    const applyFilterBtn = document.getElementById("applyFilterBtn");
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener("click", () => {
            const roomType = document.getElementById("roomFilter").value;
            const kpiReservations = document.getElementById("kpiReservations");
            const kpiUtilization = document.getElementById("kpiUtilization");
            const kpiTopRoom = document.getElementById("kpiTopRoom");

            const presets = {
                all: { res: "1,284", util: "76.4%", top: "RM-101", hours: [12, 22, 34, 41, 45, 48, 62, 68, 64, 52, 36, 28, 19] },
                discussion: { res: "482", util: "86.0%", top: "RM-101", hours: [6, 10, 15, 18, 20, 21, 26, 28, 25, 20, 14, 11, 8] },
                media: { res: "307", util: "72.0%", top: "RM-202", hours: [2, 4, 7, 9, 10, 11, 15, 16, 15, 12, 8, 6, 4] },
                seminar: { res: "326", util: "78.0%", top: "RM-301", hours: [3, 5, 8, 9, 10, 11, 14, 16, 16, 13, 9, 7, 4] },
                quiet: { res: "169", util: "65.0%", top: "RM-401", hours: [1, 3, 4, 5, 5, 5, 7, 8, 8, 7, 5, 4, 3] }
            };

            const selected = presets[roomType];
            if (selected) {
                kpiReservations.textContent = selected.res;
                kpiUtilization.textContent = selected.util;
                kpiTopRoom.textContent = selected.top;

                peakHoursChart.data.datasets[0].data = selected.hours;
                peakHoursChart.update();
            }
        });
    }
}

// [Ref: daily_schedule.html] 9. Setup hourly room timeline grid, date filter & details modal for Daily Booking Schedule page
function setupDailySchedulePage() {
    const timelineBody = document.getElementById("timelineBody");
    const bookingTableBody = document.getElementById("bookingTableBody");
    const scheduleDateInput = document.getElementById("scheduleDateInput");

    // Exit early if not on daily_schedule.html
    if (!timelineBody || !bookingTableBody || !scheduleDateInput) return;

    // [Ref: daily_schedule.html] Library rooms list
    const roomsList = [
        { id: "RM-101", name: "Discussion Room A1", floor: "1st Floor", maintenance: false },
        { id: "RM-102", name: "Discussion Room A2", floor: "1st Floor", maintenance: false },
        { id: "RM-201", name: "Media Room B1", floor: "2nd Floor", maintenance: true },
        { id: "RM-202", name: "Media Room B2", floor: "2nd Floor", maintenance: false },
        { id: "RM-301", name: "Seminar Pod C1", floor: "3rd Floor", maintenance: false },
        { id: "RM-302", name: "Seminar Pod C2", floor: "3rd Floor", maintenance: false },
        { id: "RM-401", name: "Quiet Study Room D1", floor: "4th Floor", maintenance: false },
        { id: "RM-402", name: "Quiet Study Room D2", floor: "4th Floor", maintenance: true }
    ];

    // [Ref: daily_schedule.html] Time slots (8:00 AM - 6:00 PM)
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    // [Ref: daily_schedule.html] Sample bookings data by date
    const bookingsData = [
        {
            bookingId: "BK-2026-101",
            studentName: "Ahmad Daniel Bin Roslan",
            studentId: "2024881920",
            roomId: "RM-101",
            roomName: "RM-101 - Discussion Room A1",
            date: "2026-11-22",
            startHour: 9,
            endHour: 11,
            startTime: "09:00 AM",
            endTime: "11:00 AM",
            status: "Completed",
            purpose: "Software Engineering Group Discussion (5 students)"
        },
        {
            bookingId: "BK-2026-102",
            studentName: "Nurul Aina Binti Zulkifli",
            studentId: "2024654321",
            roomId: "RM-101",
            roomName: "RM-101 - Discussion Room A1",
            date: "2026-11-22",
            startHour: 14,
            endHour: 16,
            startTime: "02:00 PM",
            endTime: "04:00 PM",
            status: "Completed",
            purpose: "Final Year Project Presentation Rehearsal"
        },
        {
            bookingId: "BK-2026-103",
            studentName: "Tan Wei Ming",
            studentId: "2024112233",
            roomId: "RM-102",
            roomName: "RM-102 - Discussion Room A2",
            date: "2026-11-22",
            startHour: 10,
            endHour: 12,
            startTime: "10:00 AM",
            endTime: "12:00 PM",
            status: "Completed",
            purpose: "Database System Assignment Review"
        },
        {
            bookingId: "BK-2026-104",
            studentName: "Siti Sarah Binti Hamid",
            studentId: "2024778899",
            roomId: "RM-202",
            roomName: "RM-202 - Media Room B2",
            date: "2026-11-22",
            startHour: 13,
            endHour: 15,
            startTime: "01:00 PM",
            endTime: "03:00 PM",
            status: "Cancelled",
            purpose: "Multimedia Video Editing & Audio Recording"
        },
        {
            bookingId: "BK-2026-105",
            studentName: "Kavita A/P Subramaniam",
            studentId: "2024334455",
            roomId: "RM-301",
            roomName: "RM-301 - Seminar Pod C1",
            date: "2026-11-22",
            startHour: 15,
            endHour: 18,
            startTime: "03:00 PM",
            endTime: "06:00 PM",
            status: "Completed",
            purpose: "Debate Club Mock Session"
        },
        {
            bookingId: "BK-2026-106",
            studentName: "Muhammad Hafiz Bin Omar",
            studentId: "2024990011",
            roomId: "RM-401",
            roomName: "RM-401 - Quiet Study Room D1",
            date: "2026-11-22",
            startHour: 11,
            endHour: 13,
            startTime: "11:00 AM",
            endTime: "01:00 PM",
            status: "Completed",
            purpose: "Midterm Exam Revision"
        },
        {
            bookingId: "BK-2026-107",
            studentName: "Aisyah Humaira Binti Yusof",
            studentId: "2024556677",
            roomId: "RM-101",
            roomName: "RM-101 - Discussion Room A1",
            date: "2026-11-20",
            startHour: 10,
            endHour: 12,
            startTime: "10:00 AM",
            endTime: "12:00 PM",
            status: "Completed",
            purpose: "Business Proposal Brainstorming"
        },
        {
            bookingId: "BK-2026-108",
            studentName: "Lim Jia Hao",
            studentId: "2024443322",
            roomId: "RM-302",
            roomName: "RM-302 - Seminar Pod C2",
            date: "2026-11-20",
            startHour: 14,
            endHour: 17,
            startTime: "02:00 PM",
            endTime: "05:00 PM",
            status: "Completed",
            purpose: "Hackathon Pitch Preparation"
        },
        {
            bookingId: "BK-2026-109",
            studentName: "Ahmad Daniel bin Sulaiman",
            studentId: "2026128701",
            roomId: "RM-302",
            roomName: "RM-302 - Seminar Pod C2",
            date: "2026-11-24",
            startHour: 9,
            endHour: 17,
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            status: "Cancelled",
            purpose: "Study Group For Final Exam Preparation"
        },
        {
            bookingId: "BK-2026-110",
            studentName: "Muhd Azizi bin Wali Ullah",
            studentId: "2023613046",
            roomId: "RM-102",
            roomName: "RM-102 - Discussion Room A2",
            date: "2026-11-24",
            startHour: 12,
            endHour: 17,
            startTime: "12:00 PM",
            endTime: "05:00 PM",
            status: "Booked",
            purpose: "Study Group"
        },
        {
            bookingId: "BK-2026-111",
            studentName: "Nik Muhd Fakhrul Ikhwan bin Mohd Nur Helmi",
            studentId: "2028124652",
            roomId: "RM-401",
            roomName: "RM-401 - Quiet Study Room D2",
            date: "2026-11-24",
            startHour: 12,
            endHour: 18,
            startTime: "12:00 PM",
            endTime: "05:00 PM",
            status: "Booked",
            purpose: "Birthday Party"
        },
        {
            bookingId: "BK-2026-112",
            studentName: "Abdulla bin Mukhzar",
            studentId: "2028956210",
            roomId: "RM-202",
            roomName: "RM-202 - Media Room B2",
            date: "2026-11-24",
            startHour: 8,
            endHour: 12,
            startTime: "08:00 AM",
            endTime: "12:00 PM",
            status: "Completed",
            purpose: "MPP Meeting"
        },
        {
            bookingId: "BK-2026-113",
            studentName: "Hadira Amalina bin Salleh",
            studentId: "2026102330",
            roomId: "RM-401",
            roomName: "RM-401 - Quiet Study Room D1",
            date: "2026-11-24",
            startHour: 9,
            endHour: 11,
            startTime: "09:00 AM",
            endTime: "11:00 AM",
            status: "Completed",
            purpose: "Relief Class"
        }
    ];

    const formattedDateLabel = document.getElementById("formattedDateLabel");
    const totalBookingsCount = document.getElementById("totalBookingsCount");
    const timelineRoomSearch = document.getElementById("timelineRoomSearch");
    const modalEl = document.getElementById("bookingDetailsModal");
    const detailsModal = modalEl ? new bootstrap.Modal(modalEl) : null;

    // [Ref: daily_schedule.html] Get local today's date in YYYY-MM-DD format
    function getLocalToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // [Ref: daily_schedule.html] Set today's date automatically on page load
    scheduleDateInput.value = getLocalToday();

    function formatDisplayDate(dateStr) {
        const dateObj = new Date(dateStr + "T00:00:00");
        return dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function openBookingModal(booking) {
        if (!detailsModal) return;

        const modalContent = document.querySelector("#bookingDetailsModal .modal-content");
        modalContent.classList.remove("theme-booked", "theme-completed", "theme-cancelled");
        modalContent.classList.add(`theme-${booking.status.toLowerCase()}`);

        document.getElementById("modalBookingId").textContent = booking.bookingId;
        document.getElementById("modalBookingSubtitle").textContent = `${booking.roomName} • ${booking.date}`;
        document.getElementById("modalStudentName").textContent = booking.studentName;
        document.getElementById("modalStudentId").textContent = booking.studentId;
        document.getElementById("modalRoomName").textContent = booking.roomName;
        document.getElementById("modalBookingDate").textContent = booking.date;
        document.getElementById("modalTimeSlot").textContent = `${booking.startTime} – ${booking.endTime}`;
        document.getElementById("modalPurpose").textContent = booking.purpose;

        const statusBadge = document.getElementById("modalBookingStatus");
        statusBadge.textContent = booking.status;
        statusBadge.className = "badge rounded-pill booking-status px-3 py-2 ";
        if (booking.status === "Booked") {
            statusBadge.classList.add("bg-primary");
        } else if (booking.status === "Completed") {
            statusBadge.classList.add("bg-success");
        } else if (booking.status === "Cancelled") {
            statusBadge.classList.add("bg-danger");
        }

        detailsModal.show();
    }

    function renderSchedule() {
        const selectedDate = scheduleDateInput.value;
        const searchKeyword = timelineRoomSearch ? timelineRoomSearch.value.toLowerCase().trim() : "";
        if (formattedDateLabel) {
            formattedDateLabel.textContent = formatDisplayDate(selectedDate);
        }

        const dayBookings = bookingsData.filter((b) => b.date === selectedDate);

        // [Ref: daily_schedule.html] 1. Build Timeline Grid
        timelineBody.innerHTML = "";
        roomsList
            .filter((r) => r.id.toLowerCase().includes(searchKeyword) || r.name.toLowerCase().includes(searchKeyword))
            .forEach((room) => {
                const tr = document.createElement("tr");

                // Room name column
                const roomTd = document.createElement("td");
                roomTd.className = "room-cell";
                roomTd.innerHTML = `
                    <div class="fw-bold small text-dark">${room.id} — ${room.name}</div>
                    <div class="text-muted" style="font-size: 0.72rem;">${room.floor}</div>
                `;
                tr.appendChild(roomTd);

                // Time slot columns (08:00 AM - 06:00 PM)
                hours.forEach((hour) => {
                    const slotTd = document.createElement("td");
                    slotTd.className = "slot-cell";

                    if (room.maintenance) {
                        slotTd.innerHTML = `<div class="slot-block slot-unavailable" title="Under Maintenance">Maint.</div>`;
                    } else {
                        const matchedBooking = dayBookings.find(
                            (b) => b.roomId === room.id && hour >= b.startHour && hour < b.endHour
                        );

                        if (matchedBooking) {
                            const statusClass = `slot-${matchedBooking.status.toLowerCase()}`;
                            const block = document.createElement("div");
                            block.className = `slot-block ${statusClass}`;
                            block.textContent = matchedBooking.bookingId.split("-").pop();
                            block.title = `${matchedBooking.bookingId}: ${matchedBooking.studentName} (${matchedBooking.status})`;
                            block.addEventListener("click", () => openBookingModal(matchedBooking));
                            slotTd.appendChild(block);
                        } else {
                            slotTd.innerHTML = `<div class="slot-block slot-available">Free</div>`;
                        }
                    }

                    tr.appendChild(slotTd);
                });

                timelineBody.appendChild(tr);
            });

        // [Ref: daily_schedule.html] 2. Build Scheduled Bookings List Table
        bookingTableBody.innerHTML = "";
        if (totalBookingsCount) {
            let countLabel = "Bookings Found";
            if (dayBookings.length === 1) {
                countLabel = "Booking Found";
            }
            totalBookingsCount.textContent = `${dayBookings.length} ${countLabel}`;
        }

        if (dayBookings.length === 0) {
            bookingTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-calendar-x fs-4 d-block mb-1"></i>
                        No room bookings scheduled for this date.
                    </td>
                </tr>
            `;
            return;
        }

        dayBookings.forEach((booking) => {
            let badgeClass = "bg-primary";
            if (booking.status === "Completed") badgeClass = "bg-success";
            if (booking.status === "Cancelled") badgeClass = "bg-danger";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="fw-bold text-primary">${booking.bookingId}</td>
                <td class="fw-medium">${booking.studentName}</td>
                <td>${booking.roomName}</td>
                <td>${booking.date}</td>
                <td>${booking.startTime} – ${booking.endTime}</td>
                <td><span class="badge ${badgeClass} rounded-pill px-2 py-1">${booking.status}</span></td>
                <td class="text-end">
                    <button type="button" class="btn btn-outline-primary btn-sm view-detail-btn">
                        <i class="bi bi-eye me-1"></i> View
                    </button>
                </td>
            `;

            row.querySelector(".view-detail-btn").addEventListener("click", () => openBookingModal(booking));
            bookingTableBody.appendChild(row);
        });
    }

    // [Ref: daily_schedule.html] Event listeners for date controls and room search
    const todayBtn = document.getElementById("todayBtn");
    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            scheduleDateInput.value = getLocalToday();
            renderSchedule();
        });
    }

    const prevDateBtn = document.getElementById("prevDateBtn");
    if (prevDateBtn) {
        prevDateBtn.addEventListener("click", () => {
            const current = new Date(scheduleDateInput.value + "T00:00:00");
            current.setDate(current.getDate() - 1);
            scheduleDateInput.value = current.toISOString().split("T")[0];
            renderSchedule();
        });
    }

    const nextDateBtn = document.getElementById("nextDateBtn");
    if (nextDateBtn) {
        nextDateBtn.addEventListener("click", () => {
            const current = new Date(scheduleDateInput.value + "T00:00:00");
            current.setDate(current.getDate() + 1);
            scheduleDateInput.value = current.toISOString().split("T")[0];
            renderSchedule();
        });
    }

    const filterDateBtn = document.getElementById("filterDateBtn");
    if (filterDateBtn) {
        filterDateBtn.addEventListener("click", renderSchedule);
    }

    scheduleDateInput.addEventListener("change", renderSchedule);

    if (timelineRoomSearch) {
        timelineRoomSearch.addEventListener("input", renderSchedule);
    }

    // [Ref: daily_schedule.html] Initial render on page load
    renderSchedule();
}

// [Ref: librarian_dashboard.html] 10. Setup Booking Statistics bar chart for Librarian Dashboard
function setupLibrarianDashboardPage() {
    const chartEl = document.getElementById("bookingStatsChart");
    if (!chartEl) return;

    const ctx = chartEl.getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Bookings",
                data: [24, 42, 46, 41, 31, 14, 21],
                backgroundColor: "#2563eb",
                hoverBackgroundColor: "#1d4ed8",
                borderRadius: 6,
                barThickness: 28
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// [Ref: manage_rooms.html] 11. Setup room search, status filter & View Details modal for Manage Rooms page
function setupManageRoomsPage() {
    const searchInput = document.getElementById("roomSearchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const roomItems = document.querySelectorAll(".room-item");

    // Exit early if not on manage_rooms.html
    if (!searchInput || roomItems.length === 0) return;

    let activeFilter = "all";

    // [Ref: manage_rooms.html] Filter & search rooms by status and keyword
    function filterRooms() {
        const keyword = searchInput.value.toLowerCase().trim();
        roomItems.forEach((item) => {
            const status = item.getAttribute("data-status");
            const text = item.getAttribute("data-search").toLowerCase();
            const matchStatus = activeFilter === "all" || status === activeFilter;
            const matchSearch = text.includes(keyword);

            if (matchStatus && matchSearch) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    }

    searchInput.addEventListener("input", filterRooms);

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => {
                b.classList.remove("btn-dark", "active");
                b.classList.add("btn-outline-secondary");
            });
            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-dark", "active");
            activeFilter = btn.getAttribute("data-filter");
            filterRooms();
        });
    });

    // [Ref: manage_rooms.html] Populate View Details Modal
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const name = btn.getAttribute("data-name");
            const floor = btn.getAttribute("data-floor");
            const capacity = btn.getAttribute("data-capacity");
            const status = btn.getAttribute("data-status");
            const facilities = btn.getAttribute("data-facilities");
            const notes = btn.getAttribute("data-notes");

            document.getElementById("modalRoomId").textContent = id;
            document.getElementById("modalRoomName").textContent = name;
            document.getElementById("modalRoomSubtitle").textContent = `${id} • ${floor}`;
            document.getElementById("modalRoomCapacity").textContent = `${floor} (${capacity})`;
            document.getElementById("modalRoomFacilities").textContent = facilities;
            document.getElementById("modalRoomNotes").textContent = notes;
            document.getElementById("modalUpdateBtn").href = `update_room_status.html?room=${id}`;

            const statusBadge = document.getElementById("modalRoomStatus");
            statusBadge.textContent = status;
            statusBadge.className = "badge rounded-pill px-2 py-1 mt-1 ";
            if (status === "Available") {
                statusBadge.classList.add("badge-available");
            } else if (status === "Booked") {
                statusBadge.classList.add("badge-confirmed");
            } else {
                statusBadge.classList.add("badge-maintenance");
            }
        });
    });
}

// [Ref: update_room_status.html] 12. Setup dynamic room preview, status badge & form submission for Update Room Status page
function setupUpdateRoomStatusPage() {
    const roomSelect = document.getElementById("roomSelect");
    const updateStatusForm = document.getElementById("updateStatusForm");

    // Exit early if not on update_room_status.html
    if (!roomSelect || !updateStatusForm) return;

    // [Ref: update_room_status.html] Sample Room Data for Dynamic Preview
    const roomsData = {
        "RM-101": {
            name: "Discussion Room A1",
            floor: "Floor 1",
            capacity: "6 Pax",
            bookings: "4 Active Sessions",
            status: "Available",
            note: "All equipment functioning normally. Ready for student reservations.",
            facilities: ["Whiteboard", "55\" Smart TV", "High-Speed Wi-Fi", "4 Power Outlets"]
        },
        "RM-102": {
            name: "Discussion Room A2",
            floor: "Floor 1",
            capacity: "8 Pax",
            bookings: "5 Active Sessions",
            status: "Available",
            note: "Markers and whiteboard eraser replenished.",
            facilities: ["Glass Whiteboard", "HDMI Display", "Wi-Fi", "6 Power Outlets"]
        },
        "RM-201": {
            name: "Media Room B1",
            floor: "Floor 2",
            capacity: "10 Pax",
            bookings: "3 Active Sessions",
            status: "Available",
            note: "Audio-visual surround system tested and ready.",
            facilities: ["HD Projector", "Surround Audio", "Video Conferencing", "Wi-Fi"]
        },
        "RM-202": {
            name: "Media Room B2",
            floor: "Floor 2",
            capacity: "10 Pax",
            bookings: "0 Active Sessions",
            status: "Maintenance",
            note: "Projector bulb replacement in progress until 5:00 PM.",
            facilities: ["HD Projector", "Smart Podium", "Wi-Fi", "Air-Conditioned"]
        },
        "RM-301": {
            name: "Seminar Pod C1",
            floor: "Floor 3",
            capacity: "15 Pax",
            bookings: "2 Active Sessions",
            status: "Reserved",
            note: "Reserved for Information Literacy Briefing.",
            facilities: ["Dual Monitors", "Wireless Mic", "Movable Chairs", "Wi-Fi"]
        },
        "RM-401": {
            name: "Quiet Study Room D1",
            floor: "Floor 4",
            capacity: "4 Pax",
            bookings: "6 Active Sessions",
            status: "Available",
            note: "Strict silent zone enforced.",
            facilities: ["Acoustic Insulation", "Desk Lamps", "Individual Power Ports", "Wi-Fi"]
        },
        "RM-402": {
            name: "Quiet Study Room D2",
            floor: "Floor 4",
            capacity: "4 Pax",
            bookings: "6 Active Sessions",
            status: "Available",
            note: "Strict silent zone enforced.",
            facilities: ["Acoustic Insulation", "Desk Lamps", "Individual Power Ports", "Wi-Fi"]
        }
    };

    const statusRadios = document.querySelectorAll('input[name="roomStatus"]');
    const statusNotes = document.getElementById("statusNotes");

    // [Ref: update_room_status.html] Apply badge styling based on status
    function applyStatusBadge(element, status) {
        element.className = "badge rounded-pill px-3 py-2";
        if (status === "Available") {
            element.classList.add("badge-available");
        } else if (status === "Maintenance") {
            element.classList.add("badge-maintenance");
        } else {
            element.classList.add("badge-confirmed");
        }
        element.textContent = status;
    }

    // [Ref: update_room_status.html] Load room details into preview panel
    function loadRoomPreview(roomCode) {
        const room = roomsData[roomCode];
        if (!room) return;

        document.getElementById("previewCode").textContent = roomCode;
        document.getElementById("previewName").textContent = room.name;
        document.getElementById("previewFloor").textContent = room.floor;
        document.getElementById("previewCapacity").textContent = room.capacity;
        document.getElementById("previewBookings").textContent = room.bookings;
        document.getElementById("previewNote").textContent = room.note;
        if (statusNotes) {
            statusNotes.value = room.note;
        }

        // Render facilities
        const facilitiesContainer = document.getElementById("previewFacilities");
        if (facilitiesContainer) {
            facilitiesContainer.innerHTML = room.facilities
                .map((item) => `<span class="facility-pill"><i class="bi bi-check2-circle text-primary"></i> ${item}</span>`)
                .join("");
        }

        // Set radio button & badge to match room's current status
        statusRadios.forEach((radio) => {
            radio.checked = radio.value === room.status;
        });
        applyStatusBadge(document.getElementById("previewBadge"), room.status);
    }

    // [Ref: update_room_status.html] Check URL query parameter (?room=RM-202 or ?roomId=RM-202)
    const urlParams = new URLSearchParams(window.location.search);
    const queryRoom = urlParams.get("room") || urlParams.get("roomId");
    if (queryRoom && roomsData[queryRoom]) {
        roomSelect.value = queryRoom;
    }
    loadRoomPreview(roomSelect.value);

    // Update preview when room dropdown changes
    roomSelect.addEventListener("change", function () {
        loadRoomPreview(this.value);
    });

    // Live update badge preview when radio status changes
    statusRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            if (this.checked) {
                applyStatusBadge(document.getElementById("previewBadge"), this.value);
            }
        });
    });

    // Live update note preview while typing
    if (statusNotes) {
        statusNotes.addEventListener("input", function () {
            const trimmedNote = this.value.trim();
            if (trimmedNote) {
                document.getElementById("previewNote").textContent = trimmedNote;
            } else {
                document.getElementById("previewNote").textContent = "No additional remarks provided.";
            }
        });
    }

    // [Ref: update_room_status.html] Handle Form Submission
    updateStatusForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedCode = roomSelect.value;
        const selectedStatus = document.querySelector('input[name="roomStatus"]:checked').value;
        const selectedReason = document.getElementById("reasonSelect").value;
        let noteText = selectedReason;
        if (statusNotes && statusNotes.value.trim()) {
            noteText = statusNotes.value.trim();
        }

        // Update stored room state
        roomsData[selectedCode].status = selectedStatus;
        roomsData[selectedCode].note = noteText;

        // Show confirmation alert
        const alertBox = document.getElementById("statusAlert");
        const alertMsg = document.getElementById("statusAlertMsg");
        if (alertMsg) {
            alertMsg.textContent = `${selectedCode} (${roomsData[selectedCode].name}) is now marked as ${selectedStatus}.`;
        }
        if (alertBox) {
            alertBox.classList.remove("d-none");
        }

        // Prepend to Recent Status Updates log
        let badgeClass = "badge-confirmed";
        if (selectedStatus === "Available") {
            badgeClass = "badge-available";
        } else if (selectedStatus === "Maintenance") {
            badgeClass = "badge-maintenance";
        }

        const logItem = document.createElement("div");
        logItem.className = "list-group-item px-0 py-2.5 border-bottom";
        logItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">${selectedCode} — ${roomsData[selectedCode].name}</span>
                <span class="badge ${badgeClass} rounded-pill">${selectedStatus}</span>
            </div>
            <p class="text-muted mb-1">${noteText}</p>
            <small class="text-muted"><i class="bi bi-clock me-1"></i>Just now • By Librarian</small>
        `;

        const logsList = document.getElementById("recentLogsList");
        if (logsList) {
            logsList.insertBefore(logItem, logsList.firstChild);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Reset button restores current room's saved preview
    const resetFormBtn = document.getElementById("resetFormBtn");
    if (resetFormBtn) {
        resetFormBtn.addEventListener("click", function () {
            setTimeout(() => loadRoomPreview(roomSelect.value), 10);
        });
    }
}

// [Ref: register.html, login.html, booking_form.html, booking_confirmation.html, my_bookings.html, booking_analytics.html, daily_schedule.html, librarian_dashboard.html, manage_rooms.html, update_room_status.html, components.js] 7. Global initialization
document.addEventListener("DOMContentLoaded", () => {
    setupRegisterPage();
    setupLoginPage();
    loadBookingConfirmation();
    setupBookingFormUI();
    setupBookingForm();
    loadMyBookings();
    updateWeeklyQuotaDisplay();
    setupBookingAnalyticsPage();
    setupDailySchedulePage();
    setupLibrarianDashboardPage();
    setupManageRoomsPage();
    setupUpdateRoomStatusPage();

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