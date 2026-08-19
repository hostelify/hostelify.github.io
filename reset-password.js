// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// ELEMENTS
// ============================================================

const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const submitBtn =
    document.getElementById("submitBtn");

const message =
    document.getElementById("message");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const confirmHint =
    document.getElementById("confirmHint");

const confirmGroup =
    confirmPasswordInput.closest(".input-group");


// ============================================================
// TOKEN FROM URL
// ============================================================
//
// The reset link emailed to the student looks like:
//   https://.../reset-password.html?token=XXXX
//

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const resetToken =
    urlParams.get("token");


if (!resetToken) {

    message.style.color =
        "#ef4444";

    message.textContent =
        "This reset link is missing or invalid. Please request a new one from the Forgot Password page.";

    resetPasswordForm.querySelectorAll(
        "input, button"
    ).forEach(function (el) {

        el.disabled = true;

    });

}


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

    const button =
        document.getElementById(buttonId);

    const icon =
        button
            ? button.querySelector(".eye-icon")
            : null;


    if (!button || !inputEl || !icon) {

        return;

    }


    button.addEventListener(
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


            button.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );


            button.setAttribute(
                "aria-pressed",
                String(isHidden)
            );

        }
    );

}


wireUpPasswordToggle(
    "toggleNewPassword",
    newPasswordInput
);


wireUpPasswordToggle(
    "toggleConfirmPassword",
    confirmPasswordInput
);


// ============================================================
// INLINE VALIDATION
// (checked live as the student types, before submit)
// ============================================================

function validatePasswordsMatch() {

    if (!confirmPasswordInput.value) {

        confirmGroup.classList.remove(
            "field-invalid",
            "field-valid"
        );

        confirmHint.textContent =
            "";

        return true;

    }


    const matches =
        newPasswordInput.value ===
        confirmPasswordInput.value;


    confirmGroup.classList.toggle(
        "field-invalid",
        !matches
    );


    confirmGroup.classList.toggle(
        "field-valid",
        matches
    );


    confirmHint.textContent =
        matches
            ? "Passwords match."
            : "Passwords do not match.";


    return matches;

}


newPasswordInput.addEventListener(
    "input",
    validatePasswordsMatch
);


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

if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // --------------------------------------------
            // VALIDATE BEFORE HITTING THE SERVER
            // --------------------------------------------

            if (newPassword.length < 8) {

                message.style.color =
                    "#ef4444";

                message.textContent =
                    "Password must be at least 8 characters.";

                return;

            }


            if (!validatePasswordsMatch()) {

                message.style.color =
                    "#ef4444";

                message.textContent =
                    "Passwords do not match.";

                return;

            }


            message.textContent =
                "";

            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Resetting...";


            try {

                const response =
                    await fetchWithRetry(
                        API_URL,
                        {

                            method: "POST",

                            body:
                                JSON.stringify({

                                    action:
                                        "resetPassword",

                                    token:
                                        resetToken,

                                    newPassword:
                                        newPassword

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


                if (!result.success) {

                    message.style.color =
                        "#ef4444";

                    message.textContent =
                        result.message ||
                        "This reset link is invalid or has expired.";

                    submitBtn.disabled =
                        false;

                    submitBtn.textContent =
                        "Reset Password";

                    return;

                }


                message.style.color =
                    "#16a34a";

                message.textContent =
                    "Password reset successfully. Redirecting to login...";


                setTimeout(
                    function () {

                        window.location.replace(
                            "index.html"
                        );

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "RESET PASSWORD ERROR:",
                    error
                );


                message.style.color =
                    "#ef4444";

                message.textContent =
                    error.message ||
                    "Unable to connect to server.";


                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Reset Password";

            }

        }
    );

}