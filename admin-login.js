// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// ALREADY LOGGED IN?
// ============================================================

if (localStorage.getItem("adminToken")) {
    window.location.replace("admin-dashboard.html");
}


// ============================================================
// ELEMENTS
// ============================================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const adminLoginForm = document.getElementById("adminLoginForm");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");


// ============================================================
// THEME (same convention as portal.js - only body.dark-theme /
// body.light-theme are toggled, never html.dark)
// ============================================================

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("light-theme", !isDark);

    if (themeIcon) {
        themeIcon.textContent = isDark ? "🌙" : "☀️";
    }

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
// SHOW / HIDE PASSWORD
// ============================================================

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener("click", function () {

        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        passwordToggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");

    });

}


// ============================================================
// LOGIN SUBMIT
// ============================================================

adminLoginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        message.textContent = "Please enter your username and password.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";
    message.textContent = "";

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "adminLogin",
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {

            localStorage.setItem("adminToken", result.adminToken);
            localStorage.setItem("adminUsername", result.username);

            window.location.replace("admin-dashboard.html");

            return;

        }

        message.textContent = result.message || "Login failed. Please try again.";

    } catch (error) {

        console.error("Admin login error:", error);
        message.textContent = "Something went wrong. Please try again.";

    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";

});