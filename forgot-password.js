// ============================================================
// API
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx6SauTgTqor5jE8o1_L-HzqsSIuojRn7eGdDeCjwDJJICSWMZkJ5JDgJM5uQWdM-naoQ/exec";


// ============================================================
// ELEMENTS
// ============================================================

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const submitBtn =
    document.getElementById("submitBtn");

const message =
    document.getElementById("message");


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

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const enrollmentId =
                document
                    .getElementById("enrollmentId")
                    .value
                    .trim();


            if (!enrollmentId) {

                message.style.color =
                    "#ef4444";

                message.textContent =
                    "Please enter your Enrollment ID.";

                return;

            }


            message.textContent =
                "";

            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Sending...";


            try {

                const response =
                    await fetchWithRetry(
                        API_URL,
                        {

                            method: "POST",

                            body:
                                JSON.stringify({

                                    action:
                                        "requestPasswordReset",

                                    enrollmentId:
                                        enrollmentId

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


                // --------------------------------------------
                // NOTE:
                //
                // The server intentionally always returns the
                // same generic message here, whether or not the
                // account/email actually exists. This prevents
                // someone from using this form to check which
                // Enrollment IDs are valid.
                // --------------------------------------------

                message.style.color =
                    "#16a34a";

                message.textContent =
                    result.message ||
                    "If an account with that Enrollment ID exists, a reset link has been sent.";


                forgotPasswordForm.reset();


                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Send Reset Link";


            } catch (error) {

                console.error(
                    "FORGOT PASSWORD ERROR:",
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
                    "Send Reset Link";

            }

        }
    );

}