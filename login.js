// ============================================================
// CONFIG
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwSLgrm424r3kD_WHk9rft4yPCMECa2ZaK6CaMSjL-HbpjVY8M6QqJDyA8kvEzO1g8l/exec";


// ============================================================
// THEME SYSTEM
// ============================================================

(function () {

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    if (!themeToggle || !themeIcon) return;

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add("light-theme");

            themeIcon.textContent = "🌙";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark theme"
            );

        } else {

            document.body.classList.remove("light-theme");

            themeIcon.textContent = "☀️";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light theme"
            );
        }
    }


    const savedTheme =
        localStorage.getItem("theme");

    if (
        savedTheme === "light" ||
        savedTheme === "dark"
    ) {

        applyTheme(savedTheme);

    } else {

        const prefersLight =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: light)"
            ).matches;

        applyTheme(
            prefersLight ? "light" : "dark"
        );
    }


    themeToggle.addEventListener(
        "click",
        function () {

            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );

            const newTheme =
                isLight ? "dark" : "light";

            applyTheme(newTheme);

            localStorage.setItem(
                "theme",
                newTheme
            );

        }
    );

})();


// ============================================================
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("loginForm");

const studentIdInput =
    document.getElementById("studentId");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const eyeIcon =
    document.getElementById("eyeIcon");

const message =
    document.getElementById("message");

const loginBtn =
    document.getElementById("loginBtn");


// ============================================================
// SHOW / HIDE PASSWORD
// ============================================================

if (passwordInput && togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.setAttribute(
                "aria-pressed",
                isPassword ? "true" : "false"
            );


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );


            if (eyeIcon) {

                if (isPassword) {

                    eyeIcon.innerHTML = `
                        <path d="M3 3l18 18"></path>
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                        <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a20.2 20.2 0 0 1-3.2 3.9"></path>
                        <path d="M6.6 6.6C3.4 8.8 1 12 1 12s4 7 11 7c1.7 0 3.2-.4 4.6-1"></path>
                    `;

                } else {

                    eyeIcon.innerHTML = `
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    `;
                }
            }

        }
    );

}


// ============================================================
// STUDENT ID — NUMBERS ONLY
// ============================================================

if (studentIdInput) {

    studentIdInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value.replace(/\D/g, "");

            if (this.value.length > 8) {

                this.value =
                    this.value.slice(0, 8);
            }

        }
    );

}


// ============================================================
// MESSAGE HELPER
// ============================================================

function showMessage(text, type = "error") {

    if (!message) return;

    message.textContent = text;

    message.className = "";

    message.classList.add(
        type === "success"
            ? "success-message"
            : "error-message"
    );
}


// ============================================================
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const studentId =
                studentIdInput.value.trim();

            const password =
                passwordInput.value;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!/^\d{8}$/.test(studentId)) {

                showMessage(
                    "Student ID must contain exactly 8 digits."
                );

                studentIdInput.focus();

                return;
            }


            if (password.length < 8) {

                showMessage(
                    "Password must be at least 8 characters long."
                );

                passwordInput.focus();

                return;
            }


            // ------------------------------------------------
            // CHECK API URL
            // ------------------------------------------------

            if (
                !API_URL ||
                API_URL ===
                "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
            ) {

                showMessage(
                    "Backend API URL has not been configured."
                );

                return;
            }


            // ------------------------------------------------
            // LOADING STATE
            // ------------------------------------------------

            if (loginBtn) {

                loginBtn.disabled = true;

                loginBtn.textContent =
                    "Logging in...";
            }

            showMessage("");


            try {

                // ------------------------------------------------
                // SEND LOGIN REQUEST TO GOOGLE APPS SCRIPT
                // ------------------------------------------------

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8"
                        }),

                        body: JSON.stringify({

                            action: "loginStudent",

                            studentId:
                                studentId,

                            password:
                                password

                        })

                    });


                // ------------------------------------------------
                // READ RESPONSE
                // ------------------------------------------------

                const result =
                    await response.json();


                console.log(
                    "Login response:",
                    result
                );


                // ------------------------------------------------
                // LOGIN SUCCESS
                // ------------------------------------------------

                if (result.success) {

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    // Save login information
                    // DO NOT save password
                    localStorage.setItem(
                        "studentId",
                        result.studentId
                    );

                    localStorage.setItem(
                        "studentName",
                        result.name || ""
                    );

                    localStorage.setItem(
                        "studentStatus",
                        result.status || ""
                    );


                    // Remember me
                    const rememberMe =
                        document.getElementById(
                            "rememberMe"
                        );

                    if (
                        rememberMe &&
                        rememberMe.checked
                    ) {

                        localStorage.setItem(
                            "rememberedStudentId",
                            result.studentId
                        );

                    } else {

                        localStorage.removeItem(
                            "rememberedStudentId"
                        );
                    }


                    // ------------------------------------------------
                    // REDIRECT
                    // ------------------------------------------------

                    setTimeout(function () {

                        window.location.href =
                            "portal.html";

                    }, 500);


                } else {

                    // ------------------------------------------------
                    // LOGIN FAILED
                    // ------------------------------------------------

                    showMessage(
                        result.message ||
                        "Invalid Student ID or password."
                    );

                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    "Unable to connect to the server. Please try again."
                );


            } finally {

                // ------------------------------------------------
                // RESTORE BUTTON
                // ------------------------------------------------

                if (loginBtn) {

                    loginBtn.disabled = false;

                    loginBtn.textContent =
                        "Login";
                }

            }

        }
    );

}


// ============================================================
// LOAD REMEMBERED STUDENT ID
// ============================================================

(function () {

    const rememberedStudentId =
        localStorage.getItem(
            "rememberedStudentId"
        );

    const rememberMe =
        document.getElementById(
            "rememberMe"
        );


    if (
        rememberedStudentId &&
        studentIdInput
    ) {

        studentIdInput.value =
            rememberedStudentId;


        if (rememberMe) {

            rememberMe.checked = true;

        }

    }

})();
