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

// [Ref: room_details.html] 8. Load dynamic room details based on URL parameter (?room_id=...)
function loadRoomDetailsPage() {
    const roomNameEl = document.getElementById("roomNameText");
    if (!roomNameEl) return;

    const roomsCatalog = {
        "1": {
            room_id: 1,
            room_name: "Discussion Room A",
            capacity: 6,
            room_status: "Available",
            facilities: '43" Smart TV, HDMI Cable, Whiteboard, High-Speed Wi-Fi, 4 Power Outlets',
            icon: "bi-door-open-fill"
        },
        "2": {
            room_id: 2,
            room_name: "Presentation Lab 1",
            capacity: 12,
            room_status: "Available",
            facilities: "HD Projector, Podium, Microphone, Acoustic Walls, Wi-Fi",
            icon: "bi-easel-fill"
        },
        "3": {
            room_id: 3,
            room_name: "Group Study Pod 1",
            capacity: 4,
            room_status: "Available",
            facilities: "Glass Whiteboard, High-Speed Wi-Fi, 2 Power Outlets",
            icon: "bi-door-open-fill"
        },
        "4": {
            room_id: 4,
            room_name: "Discussion Room B",
            capacity: 8,
            room_status: "Occupied",
            facilities: "Whiteboard, HDMI Monitor, Wi-Fi, 4 Power Outlets",
            icon: "bi-door-closed-fill"
        },
        "5": {
            room_id: 5,
            room_name: "Computer & Multimedia Room",
            capacity: 20,
            room_status: "Maintenance",
            facilities: "Smart Board, Video Conferencing Camera, Wi-Fi",
            icon: "bi-tools"
        }
    };

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room_id") || "1";
    const room = roomsCatalog[roomId] || roomsCatalog["1"];

    document.getElementById("roomIdText").textContent = "Room ID: #" + room.room_id;
    roomNameEl.textContent = room.room_name;
    document.getElementById("roomCapacityText").textContent = room.capacity + " Students";
    document.getElementById("roomFacilitiesText").textContent = room.facilities;
    document.getElementById("scheduleSubtitle").textContent = "Existing reservations for " + room.room_name;

    const iconBox = document.getElementById("roomIconBox");
    const iconEl = document.getElementById("roomIcon");
    const badgeEl = document.getElementById("roomStatusBadge");
    const statusTextEl = document.getElementById("roomStatusText");
    const btnContainer = document.getElementById("bookButtonContainer");

    iconEl.className = "bi " + room.icon;
    badgeEl.textContent = room.room_status;
    statusTextEl.textContent = room.room_status;

    const encodedRoomName = encodeURIComponent(room.room_name);

    if (room.room_status === "Available") {
        iconBox.className = "stat-icon bg-primary bg-opacity-10 text-primary";
        badgeEl.className = "badge badge-available px-3 py-2 rounded-pill";
        statusTextEl.className = "fw-semibold text-success text-end py-2";
        btnContainer.innerHTML = `<a href="booking_form.html?roomName=${encodedRoomName}&from=room_details&room_id=${room.room_id}" class="btn btn-primary-roomsync"><i class="bi bi-calendar-plus me-1"></i> Book This Room</a>`;
    } else if (room.room_status === "Occupied") {
        iconBox.className = "stat-icon bg-secondary bg-opacity-10 text-secondary";
        badgeEl.className = "badge bg-warning-subtle text-warning px-3 py-2 rounded-pill";
        statusTextEl.className = "fw-semibold text-warning text-end py-2";
        btnContainer.innerHTML = `<a href="booking_form.html?roomName=${encodedRoomName}&from=room_details&room_id=${room.room_id}" class="btn btn-outline-primary"><i class="bi bi-calendar-plus me-1"></i> Book Later Slot</a>`;
    } else {
        iconBox.className = "stat-icon bg-danger bg-opacity-10 text-danger";
        badgeEl.className = "badge bg-danger-subtle text-danger px-3 py-2 rounded-pill";
        statusTextEl.className = "fw-semibold text-danger text-end py-2";
        btnContainer.innerHTML = `<button type="button" class="btn btn-secondary" disabled>Room Under Maintenance</button>`;
    }

    // Populate booked time slots from localStorage for this room
    const tbody = document.getElementById("scheduleTableBody");
    const savedBookings = JSON.parse(localStorage.getItem("roomSyncBookings")) || [];
    const roomBookings = savedBookings.filter(
        (b) => b.roomName === room.room_name && b.bookingStatus !== "Cancelled"
    );

    if (tbody) {
        if (roomBookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No active reservations scheduled for this room.</td></tr>`;
        } else {
            tbody.innerHTML = roomBookings.map((b) => `
                <tr>
                    <td>${b.bookingDate || b.rawDate}</td>
                    <td>${b.startTime}</td>
                    <td>${b.endTime}</td>
                    <td><span class="badge badge-confirmed px-2 py-1 rounded-pill">${b.bookingStatus || "Approved"}</span></td>
                </tr>
            `).join("");
        }
    }
}

// [Ref: room_list.html] 9. Filter rooms by both Room Status and Minimum Capacity
function setupRoomListFilter() {
    const filterForm = document.getElementById("roomFilterForm");
    if (!filterForm) return;

    const statusSelect = document.getElementById("filter_status");
    const capacitySelect = document.getElementById("filter_capacity");
    const roomCards = document.querySelectorAll(".room-card-item");
    const noRoomsAlert = document.getElementById("noRoomsAlert");

    function applyRoomFilters() {
        const selectedStatus = statusSelect ? statusSelect.value.trim() : "";
        const minCapacity = capacitySelect && capacitySelect.value ? parseInt(capacitySelect.value, 10) : 0;
        let visibleCount = 0;

        roomCards.forEach((card) => {
            const cardStatus = card.getAttribute("data-status") || "";
            const cardCapacity = parseInt(card.getAttribute("data-capacity") || "0", 10);

            const matchesStatus = !selectedStatus || cardStatus === selectedStatus;
            const matchesCapacity = !minCapacity || cardCapacity >= minCapacity;

            if (matchesStatus && matchesCapacity) {
                card.classList.remove("d-none");
                visibleCount++;
            } else {
                card.classList.add("d-none");
            }
        });

        if (noRoomsAlert) {
            if (visibleCount === 0) {
                noRoomsAlert.classList.remove("d-none");
            } else {
                noRoomsAlert.classList.add("d-none");
            }
        }
    }

    filterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        applyRoomFilters();
    });

    const params = new URLSearchParams(window.location.search);
    if (params.has("room_status") || params.has("capacity")) {
        if (statusSelect && params.get("room_status")) statusSelect.value = params.get("room_status");
        if (capacitySelect && params.get("capacity")) capacitySelect.value = params.get("capacity");
        applyRoomFilters();
    }
}

// [Ref: register.html, login.html, booking_form.html, booking_confirmation.html, my_bookings.html, room_list.html, room_details.html, components.js] 7. Global initialization
document.addEventListener("DOMContentLoaded", () => {
    setupRegisterPage();
    setupLoginPage();
    loadBookingConfirmation();
    setupBookingFormUI();
    setupBookingForm();
    loadMyBookings();
    updateWeeklyQuotaDisplay();
    loadRoomDetailsPage();
    setupRoomListFilter();

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