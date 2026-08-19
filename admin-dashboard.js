// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// SESSION
// ============================================================

const adminToken = localStorage.getItem("adminToken");
const adminUsername = localStorage.getItem("adminUsername");

if (!adminToken) {
    window.location.replace("admin-login.html");
}


// ============================================================
// API HELPER
// ============================================================
// Every call automatically includes the admin token. If the
// server says the session is no longer valid, we bounce back
// to the login page.

async function callApi(action, payload) {

    const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(Object.assign({ action: action, adminToken: adminToken }, payload || {}))
    });

    const result = await response.json();

    if (result.adminSessionValid === false) {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");
        window.location.replace("admin-login.html");

        throw new Error("Session expired");

    }

    return result;

}


// ============================================================
// ELEMENTS
// ============================================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const userMenu = document.getElementById("userMenu");
const userMenuBtn = document.getElementById("userMenuBtn");
const userDropdown = document.getElementById("userDropdown");
const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");
const dropdownAdminName = document.getElementById("dropdownAdminName");

if (dropdownAdminName && adminUsername) {
    dropdownAdminName.textContent = adminUsername;
}


// ============================================================
// THEME
// ============================================================

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("light-theme", !isDark);

    if (themeIcon) themeIcon.textContent = isDark ? "🌙" : "☀️";

}

applyTheme(localStorage.getItem("portalTheme") === "dark" ? "dark" : "light");

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        const isDark = document.body.classList.contains("dark-theme");
        const newTheme = isDark ? "light" : "dark";

        localStorage.setItem("portalTheme", newTheme);
        applyTheme(newTheme);

    });

}


// ============================================================
// USER DROPDOWN
// ============================================================

if (userMenu && userMenuBtn && userDropdown) {

    userMenuBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        const isOpen = userMenu.classList.toggle("open");

        userMenuBtn.setAttribute("aria-expanded", String(isOpen));
        userDropdown.setAttribute("aria-hidden", String(!isOpen));

    });

    document.addEventListener("click", function (event) {

        if (!userMenu.contains(event.target)) {
            userMenu.classList.remove("open");
            userMenuBtn.setAttribute("aria-expanded", "false");
            userDropdown.setAttribute("aria-hidden", "true");
        }

    });

}

if (dropdownLogoutBtn) {

    dropdownLogoutBtn.addEventListener("click", async function () {

        dropdownLogoutBtn.disabled = true;

        try {
            await callApi("adminLogout", {});
        } catch (error) {
            console.error("Admin logout error:", error);
        }

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");

        window.location.replace("admin-login.html");

    });

}


// ============================================================
// TABS
// ============================================================

const tabAllBtn = document.getElementById("tabAllBtn");
const tabPriorityBtn = document.getElementById("tabPriorityBtn");
const tabAllPanel = document.getElementById("tabAllPanel");
const tabPriorityPanel = document.getElementById("tabPriorityPanel");

function activateTab(name) {

    const showAll = name === "all";

    tabAllBtn.classList.toggle("active", showAll);
    tabPriorityBtn.classList.toggle("active", !showAll);

    tabAllBtn.setAttribute("aria-selected", String(showAll));
    tabPriorityBtn.setAttribute("aria-selected", String(!showAll));

    tabAllPanel.hidden = !showAll;
    tabPriorityPanel.hidden = showAll;

    // Priority list is derived from the same data set, so make sure
    // it's rendered at least once when the tab is first opened.
    if (!showAll) {
        renderPriorityList();
    }

}

tabAllBtn.addEventListener("click", function () { activateTab("all"); });
tabPriorityBtn.addEventListener("click", function () { activateTab("priority"); });


// ============================================================
// REGISTERED STUDENTS
// ============================================================

let allRegistrations = [];

async function loadRegistrations() {

    const tbody = document.getElementById("regTableBody");
    tbody.innerHTML = "<tr><td colspan=\"9\">Loading...</td></tr>";

    try {

        const result = await callApi("getAllRegistrations", {});

        if (!result.success) {
            const message = "<tr><td colspan=\"9\">" + escapeHtml(result.message || "Could not load registrations.") + "</td></tr>";
            tbody.innerHTML = message;
            document.getElementById("priorityTableBody").innerHTML = message.replace("colspan=\"9\"", "colspan=\"11\"");
            return;
        }

        allRegistrations = result.registrations;
        renderRegistrations();
        renderPriorityList();

    } catch (error) {

        console.error("Registrations load error:", error);
        tbody.innerHTML = "<tr><td colspan=\"9\">Something went wrong.</td></tr>";

    }

}

function renderRegistrations() {

    const tbody = document.getElementById("regTableBody");
    const search = document.getElementById("regSearch").value.trim().toLowerCase();

    const filtered = allRegistrations.filter(function (r) {
        return matchesSearch(r, search);
    });

    if (!filtered.length) {
        tbody.innerHTML = "<tr><td colspan=\"9\">No registrations match.</td></tr>";
        return;
    }

    tbody.innerHTML = filtered.map(function (r) {

        return "<tr>" +
            "<td>" + escapeHtml(r.enrollmentId) + "</td>" +
            "<td>" + escapeHtml(r.fullName) + "</td>" +
            "<td>" + escapeHtml(r.gender) + "</td>" +
            "<td>" + escapeHtml(r.course) + "</td>" +
            "<td>" + escapeHtml(r.academicYear) + "</td>" +
            "<td>" + escapeHtml(r.homeLocation) + "</td>" +
            "<td>" + escapeHtml(r.roomType) + "</td>" +
            "<td>" + statusBadge(r.allocationStatus) + "</td>" +
            "<td>" + escapeHtml(r.allocatedRoom || "-") + "</td>" +
            "</tr>";

    }).join("");

}

// Only "Allocated" ever gets a visible status - everything else
// (Pending, Waitlisted, etc.) is shown as a blank cell for now.

function statusBadge(status) {

    if (status === "Allocated") {
        return "<span class=\"status-badge allocated\">Allocated</span>";
    }

    return "";

}

function matchesSearch(r, search) {

    if (!search) return true;

    return r.fullName.toLowerCase().indexOf(search) !== -1 ||
        r.enrollmentId.toLowerCase().indexOf(search) !== -1 ||
        String(r.email).toLowerCase().indexOf(search) !== -1;

}

document.getElementById("regSearch").addEventListener("input", renderRegistrations);
document.getElementById("refreshRegBtn").addEventListener("click", loadRegistrations);


// ============================================================
// PRIORITY LIST
// ============================================================
// Allocation priority is based on the category the student
// themselves picked at registration (the homeLocation field is
// that selected category, e.g. "Delhi" / "Outside Delhi" /
// "International" - not a free-text city name):
//   1. International
//   2. Outside Delhi
//   3. Delhi
//
// We match on keywords rather than an exact string so small
// wording differences (casing, extra spaces, "NCR" etc.) don't
// silently fall through. Order matters: "international" is
// checked first, then "outside" (so "Outside Delhi" doesn't get
// mistaken for plain "Delhi"), and anything left defaults to Delhi.

const PRIORITY_LABELS = {
    1: "International",
    2: "Outside Delhi",
    3: "Delhi"
};

function classifyPriority(homeLocation) {

    const text = String(homeLocation || "").toLowerCase();

    if (text.indexOf("international") !== -1) {
        return 1; // International
    }

    if (text.indexOf("outside") !== -1) {
        return 2; // Outside Delhi
    }

    return 3; // Delhi (also the fallback for anything unrecognized)

}

function renderPriorityList() {

    const tbody = document.getElementById("priorityTableBody");

    if (!tbody) return;

    const search = document.getElementById("prioritySearch").value.trim().toLowerCase();

    const filtered = allRegistrations
        .filter(function (r) { return matchesSearch(r, search); })
        .map(function (r) {
            return Object.assign({}, r, { _priority: classifyPriority(r.homeLocation) });
        })
        .sort(function (a, b) {

            if (a._priority !== b._priority) {
                return a._priority - b._priority;
            }

            // Within the same priority bucket, keep it stable and readable.
            return a.fullName.localeCompare(b.fullName);

        });

    if (!filtered.length) {
        tbody.innerHTML = "<tr><td colspan=\"11\">No registrations match.</td></tr>";
        return;
    }

    tbody.innerHTML = filtered.map(function (r, index) {

        return "<tr>" +
            "<td>" + (index + 1) + "</td>" +
            "<td>" + priorityBadge(r._priority) + "</td>" +
            "<td>" + escapeHtml(r.enrollmentId) + "</td>" +
            "<td>" + escapeHtml(r.fullName) + "</td>" +
            "<td>" + escapeHtml(r.gender) + "</td>" +
            "<td>" + escapeHtml(r.course) + "</td>" +
            "<td>" + escapeHtml(r.academicYear) + "</td>" +
            "<td>" + escapeHtml(r.homeLocation) + "</td>" +
            "<td>" + escapeHtml(r.roomType) + "</td>" +
            "<td>" + statusBadge(r.allocationStatus) + "</td>" +
            "<td>" + escapeHtml(r.allocatedRoom || "-") + "</td>" +
            "</tr>";

    }).join("");

}

function priorityBadge(priority) {

    const classes = { 1: "intl", 2: "outside", 3: "delhi" };

    return "<span class=\"status-badge priority-" + classes[priority] + "\">" +
        escapeHtml(PRIORITY_LABELS[priority]) +
        "</span>";

}

document.getElementById("prioritySearch").addEventListener("input", renderPriorityList);
document.getElementById("refreshPriorityBtn").addEventListener("click", loadRegistrations);


// ============================================================
// UTIL
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadRegistrations();
// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
// Simple show/hide view switcher. Loaded after admin-dashboard.js
// so the existing registrations logic keeps working untouched.

(function () {

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    const views = {
        registrations: document.getElementById("viewRegistrations"),
        devtools: document.getElementById("viewDevTools")
    };

    function showView(name) {

        Object.keys(views).forEach(function (key) {
            if (!views[key]) return;
            views[key].hidden = key !== name;
        });

        sidebarLinks.forEach(function (link) {
            link.classList.toggle("active", link.dataset.view === name);
        });

        // Dev Tools panel keeps its stat counters current whenever
        // it becomes visible (admin-devtools.js exposes this hook).
        if (name === "devtools" && typeof window.refreshDevToolsStats === "function") {
            window.refreshDevToolsStats();
        }

        closeMobileSidebar();

    }

    sidebarLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            showView(link.dataset.view);
        });
    });

    // -------------------- MOBILE TOGGLE --------------------

    function openMobileSidebar() {
        sidebar.classList.add("open");
        sidebarBackdrop.classList.add("open");
        sidebarToggle.setAttribute("aria-expanded", "true");
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("open");
        sidebarBackdrop.classList.remove("open");
        sidebarToggle.setAttribute("aria-expanded", "false");
    }

    if (sidebarToggle) {

        sidebarToggle.addEventListener("click", function () {
            const isOpen = sidebar.classList.contains("open");
            if (isOpen) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });

    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener("click", closeMobileSidebar);
    }

})();
// ============================================================
// DEV TOOLS - FAKE DATA SEEDING
// ============================================================
// Generates realistic-looking sample registrations entirely in
// the browser so you can test search, sorting, and the priority
// list without touching your real Google Sheet / API.
//
// Relies on things already defined in admin-dashboard.js and
// loaded before this file: `allRegistrations`, `renderRegistrations`,
// `renderPriorityList`, `escapeHtml`. Classic <script> tags on the
// same page share one top-level scope, so this just works as long
// as admin-dashboard.js is loaded first.

(function () {

    // -------------------- SAMPLE DATA POOLS --------------------

    const FIRST_NAMES = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
        "Ishaan", "Kabir", "Rohan", "Aryan", "Dev", "Yash", "Karan",
        "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra", "Anika", "Ira",
        "Navya", "Riya", "Sara", "Tara", "Meera", "Priya", "Isha",
        "Liam", "Noah", "Olivia", "Emma", "Sophia", "Mateo", "Yuki", "Chen",
        "Fatima", "Omar"
    ];

    const LAST_NAMES = [
        "Sharma", "Verma", "Gupta", "Mehta", "Kapoor", "Malhotra", "Nair", "Iyer",
        "Reddy", "Rao", "Chatterjee", "Bose", "Singh", "Yadav", "Joshi", "Kulkarni",
        "Khan", "Ahmed", "Das", "Patel", "Sinha", "Bhatt", "Chauhan", "Mishra",
        "Roy", "Sarkar", "Pillai", "Menon", "Thomas", "Fernandes"
    ];

    const COURSES = [
        "B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.A. Economics",
        "B.Com (Hons)", "BBA", "B.Sc Physics", "B.Sc Mathematics",
        "M.Tech CSE", "MBA", "M.A. English", "LLB"
    ];

    const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"];

    // Must match the keywords admin-dashboard.js checks for in
    // classifyPriority(): "international", "outside", else Delhi.
    const HOME_LOCATIONS = ["Delhi", "Outside Delhi", "International"];
    const HOME_LOCATION_WEIGHTS = [0.45, 0.4, 0.15]; // roughly realistic mix

    const ROOM_TYPES = ["Single", "Double", "Triple", "Dormitory"];
    const STATUSES = ["Pending", "Waitlisted", "Allocated"];
    const GENDERS = ["Male", "Female", "Other"];

    // -------------------- HELPERS --------------------

    function randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function weightedItem(items, weights) {
        const r = Math.random();
        let acc = 0;
        for (let i = 0; i < items.length; i++) {
            acc += weights[i];
            if (r <= acc) return items[i];
        }
        return items[items.length - 1];
    }

    function randomEnrollmentId() {
        return "SEED" + Math.floor(100000 + Math.random() * 900000);
    }

    function randomRoomNumber() {
        const block = randomItem(["A", "B", "C", "D"]);
        const number = 100 + Math.floor(Math.random() * 320);
        return block + "-" + number;
    }

    function generateFakeRegistrations(n) {

        const out = [];

        for (let i = 0; i < n; i++) {

            const firstName = randomItem(FIRST_NAMES);
            const lastName = randomItem(LAST_NAMES);
            const fullName = firstName + " " + lastName;
            const status = randomItem(STATUSES);

            out.push({
                enrollmentId: randomEnrollmentId(),
                fullName: fullName,
                email: (firstName + "." + lastName + Math.floor(Math.random() * 999) + "@example.edu").toLowerCase(),
                gender: randomItem(GENDERS),
                course: randomItem(COURSES),
                academicYear: randomItem(YEARS),
                homeLocation: weightedItem(HOME_LOCATIONS, HOME_LOCATION_WEIGHTS),
                roomType: randomItem(ROOM_TYPES),
                allocationStatus: status,
                allocatedRoom: status === "Allocated" ? randomRoomNumber() : "",
                _seeded: true
            });

        }

        return out;

    }

    // -------------------- WIRE UP UI --------------------

    const seedCountInput = document.getElementById("seedCount");
    const seedGenerateBtn = document.getElementById("seedGenerateBtn");
    const seedClearBtn = document.getElementById("seedClearBtn");
    const seedClearAllBtn = document.getElementById("seedClearAllBtn");

    const statTotal = document.getElementById("statTotal");
    const statSeeded = document.getElementById("statSeeded");
    const statReal = document.getElementById("statReal");

    function refreshStats() {

        if (typeof allRegistrations === "undefined") return;

        const total = allRegistrations.length;
        const seeded = allRegistrations.filter(function (r) { return r._seeded; }).length;

        if (statTotal) statTotal.textContent = total;
        if (statSeeded) statSeeded.textContent = seeded;
        if (statReal) statReal.textContent = total - seeded;

    }

    // Exposed so admin-sidebar.js can refresh counters whenever the
    // Dev Tools view is opened.
    window.refreshDevToolsStats = refreshStats;

    // Keep the counters in sync automatically whenever the tables
    // re-render (real data load, search, tab switch, etc.) by
    // wrapping the render functions admin-dashboard.js already
    // defined at top-level scope.
    if (typeof renderRegistrations === "function") {
        const originalRenderRegistrations = renderRegistrations;
        renderRegistrations = function () {
            originalRenderRegistrations();
            refreshStats();
        };
    }

    if (typeof renderPriorityList === "function") {
        const originalRenderPriorityList = renderPriorityList;
        renderPriorityList = function () {
            originalRenderPriorityList();
            refreshStats();
        };
    }

    if (seedGenerateBtn) {

        seedGenerateBtn.addEventListener("click", function () {

            let n = parseInt(seedCountInput.value, 10);

            if (!n || n < 1) n = 1;
            if (n > 1000) n = 1000;

            seedCountInput.value = n;

            if (typeof allRegistrations === "undefined") {
                console.error("allRegistrations is not available - is admin-dashboard.js loaded first?");
                return;
            }

            allRegistrations = allRegistrations.concat(generateFakeRegistrations(n));

            if (typeof renderRegistrations === "function") renderRegistrations();
            if (typeof renderPriorityList === "function") renderPriorityList();

            refreshStats();

        });

    }

    if (seedClearBtn) {

        seedClearBtn.addEventListener("click", function () {

            if (typeof allRegistrations === "undefined") return;

            allRegistrations = allRegistrations.filter(function (r) { return !r._seeded; });

            if (typeof renderRegistrations === "function") renderRegistrations();
            if (typeof renderPriorityList === "function") renderPriorityList();

            refreshStats();

        });

    }

    if (seedClearAllBtn) {

        seedClearAllBtn.addEventListener("click", function () {

            if (typeof allRegistrations === "undefined") return;

            const confirmed = window.confirm(
                "This clears every row currently loaded in this tab (real + seeded). " +
                "Nothing on your server is affected - hit Refresh on the Registrations tab to reload real data. Continue?"
            );

            if (!confirmed) return;

            allRegistrations = [];

            if (typeof renderRegistrations === "function") renderRegistrations();
            if (typeof renderPriorityList === "function") renderPriorityList();

            refreshStats();

        });

    }

    // Initial paint (in case Dev Tools happens to be the first view).
    refreshStats();

})();