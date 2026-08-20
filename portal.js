// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// SESSION
// ============================================================

const token =
    localStorage.getItem("studentToken");

const enrollmentId =
    localStorage.getItem("enrollmentId");


// ============================================================
// LOGIN CHECK
// ============================================================

if (!token || !enrollmentId) {

    window.location.replace("index.html");

}


// ============================================================
// ELEMENTS
// ============================================================

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

const dropdownLogoutBtn =
    document.getElementById("dropdownLogoutBtn");


const hostelForm =
    document.getElementById("hostelForm");

const submittedMessage =
    document.getElementById("submittedMessage");

const hostelMessage =
    document.getElementById("hostelMessage");

const submitHostelBtn =
    document.getElementById("submitHostelBtn");


const enrollmentInput =
    document.getElementById("enrollmentId");

const dropdownEnrollmentText =
    document.getElementById(
        "dropdownEnrollmentText"
    );


// ============================================================
// ENROLLMENT ID
// ============================================================

if (enrollmentInput) {

    enrollmentInput.value =
        enrollmentId || "";

}


if (dropdownEnrollmentText) {

    dropdownEnrollmentText.textContent =
        enrollmentId
            ? `Enrollment ID: ${enrollmentId}`
            : "Student Portal";

}


// ============================================================
// THEME
// ============================================================
//
// NOTE:
// style.css has TWO dark-mode systems in it:
//
//   - body.dark-theme / body.light-theme
//     -> the real site theme (near-black #0f1117 / #16181f
//        cards). This is also what the UNCLASSED default
//        CSS already looks like, so "dark-theme" and "no
//        class" render the same.
//
//   - html.dark
//        -> an older, unused bluish palette (#0f172a,
//           #60a5fa accent) left over in the stylesheet.
//
// We intentionally do NOT toggle "html.dark" — doing so
// makes parts of the page turn bluish and mismatched
// with the rest of the site's dark theme. Only
// body.dark-theme / body.light-theme should be toggled.
//

function applyTheme(theme) {

    const isDark =
        theme === "dark";


    document.body.classList.toggle(
        "dark-theme",
        isDark
    );


    document.body.classList.toggle(
        "light-theme",
        !isDark
    );


    if (themeIcon) {

        themeIcon.textContent =
            isDark
                ? "🌙"
                : "☀️";

    }

}


const savedTheme =
    localStorage.getItem(
        "portalTheme"
    );


applyTheme(
    savedTheme === "dark"
        ? "dark"
        : "light"
);


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.contains(
                    "dark-theme"
                );


            const newTheme =
                isDark
                    ? "light"
                    : "dark";


            localStorage.setItem(
                "portalTheme",
                newTheme
            );


            applyTheme(
                newTheme
            );

        }
    );

}


// ============================================================
// USER DROPDOWN
// ============================================================

if (
    userMenu &&
    userMenuBtn &&
    userDropdown
) {

    userMenuBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const isOpen =
                userMenu.classList.toggle(
                    "open"
                );


            userMenuBtn.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            userDropdown.setAttribute(
                "aria-hidden",
                String(!isOpen)
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                !userMenu.contains(
                    event.target
                )
            ) {

                userMenu.classList.remove(
                    "open"
                );


                userMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );


                userDropdown.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }
    );

}


// ============================================================
// LOCAL STORAGE KEY
// ============================================================

const localSubmissionKey =
    `hostelRegistrationSubmitted_${enrollmentId}`;


// ============================================================
// SHOW SUBMITTED STATE
// ============================================================

function showSubmittedState() {

    if (hostelForm) {

        hostelForm.style.display =
            "none";

    }


    if (submittedMessage) {

        submittedMessage.style.display =
            "flex";

    }

}


// ============================================================
// SHOW REGISTRATION FORM
// ============================================================

function showRegistrationForm() {

    if (hostelForm) {

        hostelForm.style.display =
            "";

    }


    if (submittedMessage) {

        submittedMessage.style.display =
            "none";

    }

}


// ============================================================
// CHECK REGISTRATION WITH DATABASE
// ============================================================

async function checkRegistrationStatus() {

    if (!token || !enrollmentId) {

        return;

    }


    /*
     * ---------------------------------------------------------
     * FAST LOCAL CHECK
     * ---------------------------------------------------------
     *
     * If we already know this student submitted before,
     * immediately hide the form.
     */

    if (
        localStorage.getItem(
            localSubmissionKey
        ) === "true"
    ) {

        showSubmittedState();

    }


    /*
     * ---------------------------------------------------------
     * SERVER CHECK
     * ---------------------------------------------------------
     *
     * This is the REAL source of truth.
     *
     * It checks Google Sheets even if:
     *
     * - localStorage was cleared
     * - student uses another browser
     * - student uses another device
     */

    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    body:
                        JSON.stringify({

                            action:
                                "checkHostelRegistration",

                            token:
                                token,

                            enrollmentId:
                                enrollmentId

                        })

                }
            );


        const result =
            await response.json();


        // -----------------------------------------------------
        // SESSION INVALID
        // -----------------------------------------------------

        if (
            result.sessionValid === false
        ) {

            localStorage.removeItem(
                "studentToken"
            );

            localStorage.removeItem(
                "enrollmentId"
            );


            window.location.replace(
                "index.html"
            );


            return;

        }


        // -----------------------------------------------------
        // ALREADY REGISTERED
        // -----------------------------------------------------

        if (
            result.success &&
            result.alreadyRegistered
        ) {

            localStorage.setItem(
                localSubmissionKey,
                "true"
            );


            showSubmittedState();


            return;

        }


        // -----------------------------------------------------
        // NOT REGISTERED
        // -----------------------------------------------------

        if (
            result.success &&
            !result.alreadyRegistered
        ) {

            localStorage.removeItem(
                localSubmissionKey
            );


            showRegistrationForm();

        }


    } catch (error) {

        console.error(
            "Registration status check failed:",
            error
        );


        /*
         * Do not hide the form if the server could
         * not be reached and we don't have a local
         * submission flag.
         *
         * This prevents a network error from
         * incorrectly locking the student out.
         */

        if (
            localStorage.getItem(
                localSubmissionKey
            ) !== "true"
        ) {

            showRegistrationForm();

        }

    }

}


// ============================================================
// RUN REGISTRATION CHECK
// ============================================================

checkRegistrationStatus();


// ============================================================
// HOSTEL REGISTRATION SUBMIT
// ============================================================

if (hostelForm) {

    hostelForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("Hostel registration submit triggered");


        // ------------------------------------------------
        // SAFETY CHECK
        // ------------------------------------------------

        if (!token || !enrollmentId) {

            hostelMessage.textContent =
                "Your session has expired. Please login again.";

            hostelMessage.className =
                "hostel-form-message error";

            return;

        }


        // ------------------------------------------------
        // FORM VALIDATION
        // ------------------------------------------------

        if (!hostelForm.checkValidity()) {

            hostelForm.reportValidity();

            return;

        }


        // ------------------------------------------------
        // COLLECT FORM DATA
        // ------------------------------------------------

        const registrationData = {

            action: "saveHostelRegistration",

            token: token,

            enrollmentId: enrollmentId,

            fullName:
                document.getElementById("fullName").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            gender:
                document.getElementById("gender").value,

            course:
                document.getElementById("course").value.trim(),

            homeLocation:
                document.getElementById("homeLocation").value,

            pinCode:
                document.getElementById("pinCode").value.trim(),

            roomType:
                document.getElementById("roomType").value,

            academicYear:
                document.getElementById("academicYear").value

        };


        console.log(
            "Registration data:",
            registrationData
        );


        // ------------------------------------------------
        // DISABLE BUTTON
        // ------------------------------------------------

        if (submitHostelBtn) {

            submitHostelBtn.disabled = true;

            submitHostelBtn.innerHTML = `
                <span>Saving...</span>
                <span>✓</span>
            `;

        }


        hostelMessage.textContent = "";

        hostelMessage.className =
            "hostel-form-message";


        // ------------------------------------------------
        // SEND TO GOOGLE APPS SCRIPT
        // ------------------------------------------------

        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    body: JSON.stringify(
                        registrationData
                    )
                }
            );


            console.log(
                "Server response:",
                response
            );


            // ------------------------------------------------
            // CHECK HTTP RESPONSE
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            // ------------------------------------------------
            // READ RESPONSE
            // ------------------------------------------------

            const result =
                await response.json();


            console.log(
                "Registration result:",
                result
            );


            // =================================================
            // SESSION INVALID
            // =================================================

            if (
                result.sessionValid === false
            ) {

                localStorage.removeItem(
                    "studentToken"
                );

                localStorage.removeItem(
                    "enrollmentId"
                );


                hostelMessage.textContent =
                    "Your session has expired. Redirecting to login...";

                hostelMessage.className =
                    "hostel-form-message error";


                setTimeout(function () {

                    window.location.replace(
                        "index.html"
                    );

                }, 1000);


                return;

            }


            // =================================================
            // SUCCESS
            // =================================================

            if (
                result.success === true
            ) {

                localStorage.setItem(
                    localSubmissionKey,
                    "true"
                );


                showSubmittedState();


                return;

            }


            // =================================================
            // ALREADY REGISTERED
            // =================================================

            if (
                result.alreadyRegistered === true
            ) {

                localStorage.setItem(
                    localSubmissionKey,
                    "true"
                );


                showSubmittedState();


                return;

            }


            // =================================================
            // SERVER RETURNED AN ERROR
            // =================================================

            throw new Error(
                result.message ||
                "Registration could not be saved."
            );


        } catch (error) {

            console.error(
                "Hostel registration error:",
                error
            );


            // ------------------------------------------------
            // KEEP FORM OPEN
            // ------------------------------------------------

            showRegistrationForm();


            // ------------------------------------------------
            // RESTORE BUTTON
            // ------------------------------------------------

            if (submitHostelBtn) {

                submitHostelBtn.disabled = false;

                submitHostelBtn.innerHTML = `
                    <span>Save Registration</span>
                    <span>→</span>
                `;

            }


            // ------------------------------------------------
            // SHOW ERROR
            // ------------------------------------------------

            hostelMessage.textContent =
                "Unable to save registration. Please try again.";

            hostelMessage.className =
                "hostel-form-message error";

        }

    });

}

// ============================================================
// LOGOUT
// ============================================================

async function logoutStudent() {

    if (dropdownLogoutBtn) {

        dropdownLogoutBtn.disabled =
            true;


        dropdownLogoutBtn.innerHTML =
            `
            <span class="logout-icon">
                ⏳
            </span>

            <span class="logout-text">
                Logging out...
            </span>
            `;

    }


    try {

        await fetch(
            API_URL,
            {

                method: "POST",

                body:
                    JSON.stringify({

                        action:
                            "logout",

                        token:
                            token

                    })

            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    // ------------------------------------------------
    // CLEAR SESSION
    // ------------------------------------------------

    localStorage.removeItem(
        "studentToken"
    );

    localStorage.removeItem(
        "enrollmentId"
    );

    localStorage.removeItem(
        "hostelStatus"
    );


    // ------------------------------------------------
    // RETURN TO LOGIN
    // ------------------------------------------------

    window.location.replace(
        "index.html"
    );

}


// ============================================================
// LOGOUT BUTTON
// ============================================================

if (dropdownLogoutBtn) {

    dropdownLogoutBtn.addEventListener(
        "click",
        function () {

            logoutStudent();

        }
    );

}
