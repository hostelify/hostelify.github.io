// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwubkDfDCE6ZfHAho7amAGBnbhBVa_ir9QgT5N9xQ20HPvVTrpHT06zLauB7Ixkmxsw/exec";


// ============================================================
// THEME SYSTEM
// ============================================================

(function () {

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");

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
            prefersLight
                ? "light"
                : "dark"
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
                isLight
                    ? "dark"
                    : "light";

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

const registerForm =
    document.getElementById("registerForm");

const enrollmentIdInput =
    document.getElementById("enrollmentId");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerBtn =
    document.getElementById("registerBtn");

const message =
    document.getElementById("message");


// ============================================================
// STUDENT ID — NUMBERS ONLY
// ============================================================

if (enrollmentIdInput) {

    enrollmentIdInput.addEventListener(
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
// PASSWORD MATCH
// ============================================================

function checkPasswords() {

    if (
        !passwordInput ||
        !confirmPasswordInput
    ) {
        return;
    }


    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (confirmPassword === "") {

        confirmPasswordInput.setCustomValidity("");

        return;
    }


    if (password !== confirmPassword) {

        confirmPasswordInput.setCustomValidity(
            "Passwords do not match."
        );

    } else {

        confirmPasswordInput.setCustomValidity("");

    }

}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        checkPasswords
    );

}


if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener(
        "input",
        checkPasswords
    );

}


// ============================================================
// SHOW / HIDE PASSWORD
// ============================================================

function setupPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);


    if (!input || !button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const isHidden =
                input.type === "password";


            input.type =
                isHidden
                    ? "text"
                    : "password";


            button.setAttribute(
                "aria-pressed",
                isHidden
                    ? "true"
                    : "false"
            );


            button.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );


            const svg =
                button.querySelector("svg");


            if (!svg) return;


            if (isHidden) {

                svg.innerHTML = `
                    <path d="M3 3l18 18"></path>
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                    <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a20.2 20.2 0 0 1-3.2 3.9"></path>
                    <path d="M6.6 6.6C3.4 8.8 1 12 1 12s4 7 11 7c1.7 0 3.2-.4 4.6-1"></path>
                `;

            } else {

                svg.innerHTML = `
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;

            }

        }
    );
}


setupPasswordToggle(
    "password",
    "togglePassword"
);


setupPasswordToggle(
    "confirmPassword",
    "toggleConfirmPassword"
);


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    text,
    type
) {

    if (!message) return;

    message.textContent = text;

    message.className = "";

    if (type) {
        message.classList.add(type);
    }

}


// ============================================================
// REGISTRATION
// ============================================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            checkPasswords();


            // Browser validation
            if (!registerForm.checkValidity()) {

                registerForm.reportValidity();

                return;
            }


            const studentId =
                enrollmentIdInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // ====================================================
            // STUDENT ID VALIDATION
            // ====================================================

            if (!/^\d{8}$/.test(studentId)) {

                showMessage(
                    "Student ID must contain exactly 8 digits.",
                    "error"
                );

                enrollmentIdInput.focus();

                return;
            }


            // ====================================================
            // GMAIL VALIDATION
            // ====================================================

            if (
                !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)
            ) {

                showMessage(
                    "Please enter a valid Gmail address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            // ====================================================
            // PASSWORD VALIDATION
            // ====================================================

            if (password.length < 8) {

                showMessage(
                    "Password must be at least 8 characters long.",
                    "error"
                );

                passwordInput.focus();

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                confirmPasswordInput.focus();

                return;
            }


            // ====================================================
            // DISABLE BUTTON
            // ====================================================

            registerBtn.disabled = true;

            registerBtn.textContent =
                "Creating Account...";


            showMessage(
                "Creating your account...",
                "loading"
            );


            // ====================================================
            // SEND TO APPS SCRIPT
            // ====================================================

            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body: JSON.stringify({

                                action:
                                    "registerStudent",

                                studentId:
                                    studentId,

                                email:
                                    email,

                                password:
                                    password

                            })
                        }
                    );


                const result =
                    await response.json();


                if (!result.success) {

                    throw new Error(
                        result.message ||
                        "Registration failed."
                    );

                }


                // ====================================================
                // SUCCESS
                // ====================================================

                showMessage(
                    result.message ||
                    "Account created successfully.",
                    "success"
                );


                // Save Student ID for login/dashboard
                localStorage.setItem(
                    "studentId",
                    studentId
                );


                registerBtn.textContent =
                    "Account Created";


                // Redirect
                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to create account. Please try again.",
                    "error"
                );


                registerBtn.disabled = false;

                registerBtn.textContent =
                    "Create Account";

            }

        }
    );

}