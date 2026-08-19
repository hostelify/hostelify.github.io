// ==========================================
// SHARED THEME TOGGLE
// ==========================================

(function () {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    document.addEventListener("DOMContentLoaded", function () {

        const toggle =
            document.getElementById("themeToggle");

        const icon =
            document.getElementById("themeIcon");

        if (!toggle || !icon) return;

        icon.textContent =
            document.body.classList.contains("light-theme")
                ? "🌙"
                : "☀️";

        toggle.addEventListener("click", function () {

            document.body.classList.add("theme-transition");

            document.body.classList.toggle("light-theme");

            const isLight =
                document.body.classList.contains("light-theme");

            icon.textContent = isLight ? "🌙" : "☀️";

            localStorage.setItem("theme", isLight ? "light" : "dark");

            setTimeout(function () {
                document.body.classList.remove("theme-transition");
            }, 500);

        });

    });

})();
