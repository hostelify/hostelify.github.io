// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// ELEMENTS
// ============================================================

const form =
    document.getElementById("registerForm");

const button =
    document.getElementById("registerBtn");

const message =
    document.getElementById("message");

const enrollmentIdInput =
    document.getElementById("enrollmentId");

const enrollmentIdGroup =
    document.getElementById("enrollmentIdGroup");

const enrollmentIdHint =
    document.getElementById("enrollmentIdHint");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const passwordGroup =
    document.getElementById("passwordGroup");

const passwordHint =
    document.getElementById("passwordHint");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const confirmPasswordGroup =
    document.getElementById("confirmPasswordGroup");

const confirmPasswordHint =
    document.getElementById("confirmPasswordHint");


// ============================================================
// PASSWORD SHOW / HIDE TOGGLES
// ============================================================

const EYE_OPEN_ICON =
    `
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
    `;


const EYE_OFF_ICON =
    `
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
    `;


function wireUpPasswordToggle(
    buttonId,
    inputEl
) {

    const toggleBtn =
        document.getElementById(buttonId);

    const icon =
        toggleBtn
            ? toggleBtn.querySelector(".eye-icon")
            : null;


    if (!toggleBtn || !inputEl || !icon) {

        return;

    }


    toggleBtn.addEventListener(
        "click",
        function () {

            const isHidden =
                inputEl.type === "password";


            inputEl.type =
                isHidden
                    ? "text"
                    : "password";


            icon.innerHTML =
                isHidden
                    ? EYE_OFF_ICON
                    : EYE_OPEN_ICON;


            toggleBtn.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );


            toggleBtn.setAttribute(
                "aria-pressed",
                String(isHidden)
            );

        }
    );

}


wireUpPasswordToggle(
    "togglePassword",
    passwordInput
);


wireUpPasswordToggle(
    "toggleConfirmPassword",
    confirmPasswordInput
);


// ============================================================
// INLINE VALIDATION
// (checked live as the student types, before submit)
// ============================================================

// --------------------------------------------------
// ENROLLMENT ID
// --------------------------------------------------
//
// NOTE:
// This only checks a sane minimum (non-empty, at least
// 3 characters). If your college enrollment IDs follow a
// specific pattern (e.g. always digits, or a fixed length),
// tighten the regex below to match it.

function validateEnrollmentId() {

    const value =
        enrollmentIdInput.value.trim();


    if (!value) {

        enrollmentIdGroup.classList.remove(
            "field-invalid",
            "field-valid"
        );

        enrollmentIdHint.textContent =
            "";

        return false;

    }


    const isValid =
        value.length >= 3;


    enrollmentIdGroup.classList.toggle(
        "field-invalid",
        !isValid
    );


    enrollmentIdGroup.classList.toggle(
        "field-valid",
        isValid
    );


    enrollmentIdHint.textContent =
        isValid
            ? ""
            : "Enrollment ID looks too short.";


    return isValid;

}


enrollmentIdInput.addEventListener(
    "input",
    validateEnrollmentId
);


// --------------------------------------------------
// PASSWORD LENGTH
// --------------------------------------------------

function validatePasswordLength() {

    const value =
        passwordInput.value;


    if (!value) {

        passwordGroup.classList.remove(
            "field-invalid",
            "field-valid"
        );

        passwordHint.textContent =
            "At least 8 characters.";

        return false;

    }


    const isValid =
        value.length >= 8;


    passwordGroup.classList.toggle(
        "field-invalid",
        !isValid
    );


    passwordGroup.classList.toggle(
        "field-valid",
        isValid
    );


    passwordHint.textContent =
        isValid
            ? "Looks good."
            : `At least 8 characters (${value.length}/8).`;


    return isValid;

}


passwordInput.addEventListener(
    "input",
    function () {

        validatePasswordLength();


        // Re-check the confirm field too, since the
        // password it needs to match just changed.

        if (confirmPasswordInput.value) {

            validatePasswordsMatch();

        }

    }
);


// --------------------------------------------------
// CONFIRM PASSWORD MATCH
// --------------------------------------------------

function validatePasswordsMatch() {

    if (!confirmPasswordInput.value) {

        confirmPasswordGroup.classList.remove(
            "field-invalid",
            "field-valid"
        );

        confirmPasswordHint.textContent =
            "";

        return true;

    }


    const matches =
        passwordInput.value ===
        confirmPasswordInput.value;


    confirmPasswordGroup.classList.toggle(
        "field-invalid",
        !matches
    );


    confirmPasswordGroup.classList.toggle(
        "field-valid",
        matches
    );


    confirmPasswordHint.textContent =
        matches
            ? "Passwords match."
            : "Passwords do not match.";


    return matches;

}


confirmPasswordInput.addEventListener(
    "input",
    validatePasswordsMatch
);


// ============================================================
// FETCH WITH RETRY
// ============================================================
//
// See login.js for the full explanation. Apps Script's /exec
// endpoint occasionally 404s on a cold start; retrying once or
// twice with a short backoff resolves it silently.
//

async function fetchWithRetry(
    url,
    options,
    maxRetries = 2,
    delayMs = 700
) {

    let lastError =
        null;


    for (
        let attempt = 0;
        attempt <= maxRetries;
        attempt++
    ) {

        try {

            const response =
                await fetch(
                    url,
                    options
                );


            const isRetryableStatus =
                response.status === 404 ||
                response.status >= 500;


            if (
                isRetryableStatus &&
                attempt < maxRetries
            ) {

                await sleep(
                    delayMs *
                    (attempt + 1)
                );


                continue;

            }


            return response;


        } catch (error) {

            lastError =
                error;


            if (
                attempt < maxRetries
            ) {

                await sleep(
                    delayMs *
                    (attempt + 1)
                );


                continue;

            }

        }

    }


    throw (
        lastError ||
        new Error(
            "Unable to reach the server after multiple attempts."
        )
    );

}


function sleep(ms) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                ms
            );

        }
    );

}


// ============================================================
// SUBMIT
// ============================================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const enrollmentId =
            enrollmentIdInput.value.trim();


        const email =
            emailInput.value.trim();


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        // ================================
        // VALIDATE BEFORE HITTING THE SERVER
        // ================================

        message.style.color =
            "#ef4444";


        if (!validateEnrollmentId()) {

            message.textContent =
                "Please enter a valid Enrollment ID.";

            return;

        }


        if (!email) {

            message.textContent =
                "Please enter your email address.";

            return;

        }


        if (!validatePasswordLength()) {

            message.textContent =
                "Password must be at least 8 characters.";

            return;

        }


        if (!validatePasswordsMatch()) {

            message.textContent =
                "Passwords do not match.";

            return;

        }


        // ================================
        // LOADING
        // ================================

        button.disabled = true;

        button.textContent =
            "Creating account...";


        message.textContent = "";


        try {

            const response =
                await fetchWithRetry(
                    API_URL,
                    {

                        method: "POST",

                        // IMPORTANT:
                        // Keep this as text/plain (no explicit
                        // Content-Type header). Adding
                        // "application/json" triggers a CORS
                        // preflight that Apps Script doesn't
                        // handle.

                        body: JSON.stringify({

                            action: "register",

                            enrollmentId:
                                enrollmentId,

                            email:
                                email,

                            password:
                                password

                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Server returned HTTP ${response.status}. Please try again.`
                );

            }


            const result =
                await response.json();


            // ================================
            // SUCCESS
            // ================================

            if (result.success) {

                message.style.color =
                    "#16a34a";

                message.textContent =
                    "Account created successfully. Redirecting...";


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    1500
                );

            }


            // ================================
            // ERROR
            // ================================

            else {

                message.style.color =
                    "#ef4444";

                message.textContent =
                    result.message ||
                    "Unable to create account.";


                button.disabled =
                    false;


                button.textContent =
                    "Create Account";

            }


        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );


            message.style.color =
                "#ef4444";

            message.textContent =
                error.message ||
                "Unable to connect to server.";


            button.disabled =
                false;


            button.textContent =
                "Create Account";

        }

    }
);