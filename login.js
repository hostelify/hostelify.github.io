// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("loginForm");

const loginBtn =
    document.getElementById("loginBtn");

const message =
    document.getElementById("message");

const passwordInput =
    document.getElementById("password");

const togglePasswordBtn =
    document.getElementById("togglePassword");

const eyeIcon =
    document.getElementById("eyeIcon");

const rememberMeCheckbox =
    document.getElementById("rememberMe");


// ============================================================
// PASSWORD SHOW / HIDE TOGGLE
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


if (
    togglePasswordBtn &&
    passwordInput &&
    eyeIcon
) {

    togglePasswordBtn.addEventListener(
        "click",
        function () {

            const isHidden =
                passwordInput.type === "password";


            passwordInput.type =
                isHidden
                    ? "text"
                    : "password";


            eyeIcon.innerHTML =
                isHidden
                    ? EYE_OFF_ICON
                    : EYE_OPEN_ICON;


            togglePasswordBtn.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );


            togglePasswordBtn.setAttribute(
                "aria-pressed",
                String(isHidden)
            );

        }
    );

}


// ============================================================
// FETCH WITH RETRY
// ============================================================
//
// WHY THIS EXISTS:
//
// Google Apps Script's /exec endpoint occasionally returns a
// transient HTTP 404 or 5xx error, especially right after the
// script has been idle ("cold start"), even though the
// deployment itself is completely healthy. A normal retry a
// few hundred ms later almost always succeeds.
//
// This wrapper retries automatically on:
//   - network failures (fetch throws)
//   - HTTP 404
//   - HTTP 5xx
//
// It does NOT retry on other 4xx errors, since those usually
// mean something is actually wrong with the request itself.
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


            // ------------------------------------------------
            // RETRY-ABLE HTTP STATUS
            // ------------------------------------------------

            const isRetryableStatus =
                response.status === 404 ||
                response.status >= 500;


            if (
                isRetryableStatus &&
                attempt < maxRetries
            ) {

                console.warn(
                    `Request failed with HTTP ${response.status}, retrying (attempt ${attempt + 1}/${maxRetries})...`
                );


                await sleep(
                    delayMs *
                    (attempt + 1)
                );


                continue;

            }


            // ------------------------------------------------
            // RETURN RESPONSE
            // (caller decides what to do with non-ok statuses
            // that aren't retryable, e.g. 400/401/403)
            // ------------------------------------------------

            return response;


        } catch (error) {

            // ------------------------------------------------
            // NETWORK ERROR (server unreachable, DNS, offline)
            // ------------------------------------------------

            lastError =
                error;


            if (
                attempt < maxRetries
            ) {

                console.warn(
                    `Network error, retrying (attempt ${attempt + 1}/${maxRetries})...`,
                    error
                );


                await sleep(
                    delayMs *
                    (attempt + 1)
                );


                continue;

            }

        }

    }


    // ------------------------------------------------------
    // ALL ATTEMPTS FAILED
    // ------------------------------------------------------

    throw (
        lastError ||
        new Error(
            "Unable to reach the server after multiple attempts."
        )
    );

}


// ============================================================
// SLEEP HELPER
// ============================================================

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
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // --------------------------------------------
            // GET VALUES
            // --------------------------------------------

            const enrollmentId =
                document
                    .getElementById("enrollmentId")
                    .value
                    .trim();


            const password =
                passwordInput.value;


            const rememberMe =
                Boolean(
                    rememberMeCheckbox &&
                    rememberMeCheckbox.checked
                );


            // --------------------------------------------
            // BASIC VALIDATION
            // --------------------------------------------

            if (!enrollmentId || !password) {

                message.style.color =
                    "#ef4444";

                message.textContent =
                    "Please enter your enrollment ID and password.";

                return;

            }


            // --------------------------------------------
            // UI
            // --------------------------------------------

            message.textContent = "";

            loginBtn.disabled = true;

            loginBtn.textContent =
                "Logging in...";


            // --------------------------------------------
            // REQUEST DATA
            // --------------------------------------------

            const loginData = {

                action:
                    "login",

                enrollmentId:
                    enrollmentId,

                password:
                    password,

                // IMPORTANT:
                // Controls session length server-side.
                // See createSession() in Code.gs.

                rememberMe:
                    rememberMe

            };


            try {

                // ==================================================
                // SEND REQUEST (with automatic retry)
                // ==================================================

                const response =
                    await fetchWithRetry(
                        API_URL,
                        {
                            method: "POST",

                            // IMPORTANT:
                            // Keep this as text/plain.
                            // Do NOT add:
                            // Content-Type: application/json
                            //
                            // Adding application/json can trigger
                            // a browser CORS preflight with Apps Script.

                            body:
                                JSON.stringify(
                                    loginData
                                )

                        }
                    );


                // ==================================================
                // CHECK HTTP RESPONSE
                // ==================================================

                if (!response.ok) {

                    throw new Error(
                        `Server returned HTTP ${response.status}. Please try again.`
                    );

                }


                // ==================================================
                // READ RESPONSE
                // ==================================================

                const responseText =
                    await response.text();


                console.log(
                    "Login server response:",
                    responseText
                );


                // --------------------------------------------
                // EMPTY RESPONSE
                // --------------------------------------------

                if (!responseText) {

                    throw new Error(
                        "Server returned an empty response."
                    );

                }


                // --------------------------------------------
                // PARSE JSON
                // --------------------------------------------

                let result;

                try {

                    result =
                        JSON.parse(
                            responseText
                        );

                } catch (jsonError) {

                    console.error(
                        "Invalid JSON from server:",
                        responseText
                    );

                    throw new Error(
                        "Server returned an invalid response."
                    );

                }


                // ==================================================
                // LOGIN FAILED
                // ==================================================

                if (!result.success) {

                    message.style.color =
                        "#ef4444";

                    message.textContent =
                        result.message ||
                        "Invalid enrollment ID or password.";

                    loginBtn.disabled =
                        false;

                    loginBtn.textContent =
                        "Login";

                    return;

                }


                // ==================================================
                // MAKE SURE TOKEN EXISTS
                // ==================================================

                if (!result.token) {

                    throw new Error(
                        "Login succeeded but no session token was returned."
                    );

                }


                if (!result.enrollmentId) {

                    throw new Error(
                        "Login succeeded but no enrollment ID was returned."
                    );

                }


                // ==================================================
                // SAVE LOGIN SESSION
                // ==================================================

                localStorage.setItem(
                    "studentToken",
                    String(result.token)
                );


                localStorage.setItem(
                    "enrollmentId",
                    String(result.enrollmentId)
                );


                // IMPORTANT:
                // Clear old local hostel state.
                //
                // The portal will ask the server/database whether
                // this student has actually registered.

                localStorage.removeItem(
                    `hostelRegistrationSubmitted_${result.enrollmentId}`
                );


                console.log(
                    "Login successful."
                );


                console.log(
                    "Enrollment ID:",
                    result.enrollmentId
                );


                console.log(
                    "Token saved."
                );


                // ==================================================
                // SUCCESS MESSAGE
                // ==================================================

                message.style.color =
                    "#16a34a";

                message.textContent =
                    "Login successful. Opening portal...";


                // ==================================================
                // REDIRECT
                // ==================================================

                setTimeout(
                    function () {

                        window.location.replace(
                            "portal.html"
                        );

                    },
                    300
                );

            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                message.style.color =
                    "#ef4444";


                // Show a more useful error instead of always saying
                // "Unable to connect to server."

                message.textContent =
                    error.message ||
                    "Unable to connect to server.";


                loginBtn.disabled =
                    false;


                loginBtn.textContent =
                    "Login";

            }

        }
    );

}