// ============================================================
// ADMIN LOGIN
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // API CONFIG
    // ========================================================

    const API_URL =
        "PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE";


    // ========================================================
    // ELEMENTS
    // ========================================================

    const form =
        document.getElementById("adminLoginForm");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const message =
        document.getElementById("message");

    const submitBtn =
        document.getElementById("submitBtn");

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");


    // ========================================================
    // PASSWORD ICONS
    // ========================================================

    const eyeIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
            <circle
                cx="12"
                cy="12"
                r="3"
            ></circle>
        </svg>
    `;


    const eyeOffIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M2 2l20 20"></path>

            <path d="
                M6.7 6.7
                C3.7 8.4 2 12 2 12
                S6 19 12 19
                C13.8 19 15.4 18.5 16.8 17.8
            "></path>

            <path d="
                M9.9 4.9
                C10.6 4.7 11.3 4.5 12 4.5
                C18 4.5 22 12 22 12
                S20.3 15.1 17.3 17.1
            "></path>

            <path d="
                M14.1 14.1
                A3 3 0 0 1 9.9 9.9
            "></path>
        </svg>
    `;


    // ========================================================
    // SHOW / HIDE PASSWORD
    // ========================================================

    passwordToggle.addEventListener("click", function () {

        const passwordIsHidden =
            password.type === "password";


        if (passwordIsHidden) {

            password.type = "text";

            passwordToggle.innerHTML =
                eyeOffIcon;

            passwordToggle.setAttribute(
                "aria-label",
                "Hide password"
            );

            passwordToggle.setAttribute(
                "title",
                "Hide password"
            );

        } else {

            password.type = "password";

            passwordToggle.innerHTML =
                eyeIcon;

            passwordToggle.setAttribute(
                "aria-label",
                "Show password"
            );

            passwordToggle.setAttribute(
                "title",
                "Show password"
            );
        }

    });


    // ========================================================
    // THEME
    // ========================================================

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add(
                "light-theme"
            );

            themeIcon.textContent = "🌙";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to dark mode"
            );

        } else {

            document.body.classList.remove(
                "light-theme"
            );

            themeIcon.textContent = "☀️";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to light mode"
            );
        }
    }


    // ========================================================
    // LOAD SAVED THEME
    // ========================================================

    const savedTheme =
        localStorage.getItem("theme");


    if (savedTheme === "light") {

        applyTheme("light");

    } else {

        applyTheme("dark");

    }


    // ========================================================
    // THEME TOGGLE
    // ========================================================

    themeToggle.addEventListener("click", function () {

        const lightMode =
            document.body.classList.contains(
                "light-theme"
            );


        if (lightMode) {

            localStorage.setItem(
                "theme",
                "dark"
            );

            applyTheme("dark");

        } else {

            localStorage.setItem(
                "theme",
                "light"
            );

            applyTheme("light");
        }

    });


    // ========================================================
    // BUTTON LOADING STATE
    // ========================================================

    function setSubmitLoading(isLoading) {

        submitBtn.disabled = isLoading;

        submitBtn.textContent =
            isLoading
                ? "Signing in…"
                : "Sign In";

    }


    // ========================================================
    // ADMIN LOGIN
    // ========================================================

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        const user =
            username.value.trim();

        const pass =
            password.value;


        message.textContent = "";


        if (!user || !pass) {

            message.textContent =
                "Please enter username and password.";

            return;
        }


        setSubmitLoading(true);


        const body = new URLSearchParams();

        body.append("action", "adminLogin");
        body.append("username", user);
        body.append("password", pass);


        fetch(API_URL, {
            method: "POST",
            body: body
        })

            .then(function (res) {

                return res.json();

            })

            .then(function (data) {

                setSubmitLoading(false);


                if (data.success) {

                    sessionStorage.setItem(
                        "isAdmin",
                        "true"
                    );

                    sessionStorage.setItem(
                        "adminUsername",
                        data.username
                    );

                    sessionStorage.setItem(
                        "adminKey",
                        pass
                    );

                    window.location.href =
                        "admin-dashboard.html";

                } else {

                    message.textContent =
                        data.message ||
                        "Invalid username or password.";

                }

            })

            .catch(function (err) {

                setSubmitLoading(false);

                message.textContent =
                    "Network error. Please try again.";

                console.error(err);

            });

    });

});
