// ============================================================
// PORTAL UI
// THEME + USER DROPDOWN
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // ELEMENTS
    // ========================================================

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");

    const userMenu =
        document.getElementById("userMenu");

    const userMenuBtn =
        document.getElementById("userMenuBtn");

    const userDropdown =
        document.getElementById("userDropdown");


    // ========================================================
    // THEME
    // ========================================================

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add("light-theme");

            if (themeIcon) {
                themeIcon.textContent = "🌙";
            }

            if (themeToggle) {
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to dark mode"
                );
            }

        } else {

            document.body.classList.remove("light-theme");

            if (themeIcon) {
                themeIcon.textContent = "☀️";
            }

            if (themeToggle) {
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

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            function () {

                const isLight =
                    document.body.classList.contains(
                        "light-theme"
                    );

                if (isLight) {

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

            }
        );

    }


    // ========================================================
    // USER DROPDOWN
    // ========================================================

    function openUserMenu() {

        if (!userMenu || !userMenuBtn) {
            return;
        }

        userMenu.classList.add("open");

        userMenuBtn.setAttribute(
            "aria-expanded",
            "true"
        );

        if (userDropdown) {

            userDropdown.setAttribute(
                "aria-hidden",
                "false"
            );
        }
    }


    function closeUserMenu() {

        if (!userMenu || !userMenuBtn) {
            return;
        }

        userMenu.classList.remove("open");

        userMenuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

        if (userDropdown) {

            userDropdown.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    }


    function toggleUserMenu() {

        if (!userMenu) {
            return;
        }

        if (userMenu.classList.contains("open")) {

            closeUserMenu();

        } else {

            openUserMenu();

        }
    }


    // ========================================================
    // USER BUTTON CLICK
    // ========================================================

    if (userMenuBtn) {

        userMenuBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleUserMenu();

            }
        );

    }


    // ========================================================
    // DON'T CLOSE WHEN CLICKING INSIDE DROPDOWN
    // ========================================================

    if (userDropdown) {

        userDropdown.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );

    }


    // ========================================================
    // CLICK OUTSIDE
    // ========================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                userMenu &&
                !userMenu.contains(event.target)
            ) {

                closeUserMenu();

            }

        }
    );


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeUserMenu();

            }

        }
    );

});