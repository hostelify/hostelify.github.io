// ============================================================
// CONFIG
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwSLgrm424r3kD_WHk9rft4yPCMECa2ZaK6CaMSjL-HbpjVY8M6QqJDyA8kvEzO1g8l/exec";


// ============================================================
// PORTAL UI
// THEME + USER DROPDOWN + PROFILE FORM
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

    const dropdownEnrollmentText =
        document.getElementById("dropdownEnrollmentText");

    const dropdownLogoutBtn =
        document.getElementById("dropdownLogoutBtn");


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


    // ========================================================
    // LOGOUT
    // ========================================================

    if (dropdownLogoutBtn) {

        dropdownLogoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem("studentId");
                localStorage.removeItem("studentName");
                localStorage.removeItem("studentStatus");
                localStorage.removeItem("studentEmail");

                window.location.href = "index.html";

            }
        );

    }


    // ========================================================
    // AUTH GUARD
    // Redirect to login if no student is signed in.
    // ========================================================

    const studentId =
        localStorage.getItem("studentId");

    if (!studentId) {

        window.location.href = "index.html";

        return;

    }


    // ========================================================
    // PREFILL STUDENT ID FIELD + DROPDOWN LABEL
    // ========================================================

    const enrollmentIdInput =
        document.getElementById("enrollmentId");

    if (enrollmentIdInput) {

        enrollmentIdInput.value = studentId;

    }

    if (dropdownEnrollmentText) {

        dropdownEnrollmentText.textContent =
            "ID: " + studentId;

    }


    const studentEmail =
        localStorage.getItem("studentEmail");

    const emailInput =
        document.getElementById("email");

    if (emailInput && studentEmail) {

        emailInput.value = studentEmail;

    }


    // ========================================================
    // VIEW ELEMENTS: FORM VS "ALREADY SUBMITTED"
    // ========================================================

    const registrationFormView =
        document.getElementById("registrationFormView");

    const alreadySubmittedView =
        document.getElementById("alreadySubmittedView");

    const editRegistrationBtn =
        document.getElementById("editRegistrationBtn");

    const withdrawRegistrationBtn =
        document.getElementById("withdrawRegistrationBtn");

    const alreadySubmittedMessage =
        document.getElementById("alreadySubmittedMessage");


    // ========================================================
    // STATUS BAR ELEMENTS
    // ========================================================

    const queueNoValue =
        document.getElementById("queueNoValue");

    const allocationStatusDot =
        document.getElementById("allocationStatusDot");

    const allocationStatusValue =
        document.getElementById("allocationStatusValue");


    // Keep the most recently fetched profile around so
    // "Edit Registration" can prefill the form instantly.

    let lastKnownProfile = null;


    function showFormView() {

        if (registrationFormView) {

            registrationFormView.classList.remove("hidden");

        }

        if (alreadySubmittedView) {

            alreadySubmittedView.classList.add("hidden");

        }

    }


    function showAlreadySubmittedView() {

        if (registrationFormView) {

            registrationFormView.classList.add("hidden");

        }

        if (alreadySubmittedView) {

            alreadySubmittedView.classList.remove("hidden");

        }

    }


    // ========================================================
    // MAP applicationStatus -> STATUS BAR LABEL / STYLE
    // ========================================================

    function updateStatusBar(data) {

        if (!queueNoValue || !allocationStatusDot || !allocationStatusValue) {
            return;
        }

        const status =
            data && data.applicationStatus
                ? String(data.applicationStatus).trim()
                : "Registered";

        const hasQueueNumber =
            data &&
            data.queueNumber !== undefined &&
            data.queueNumber !== null &&
            data.queueNumber !== "";

        queueNoValue.textContent =
            hasQueueNumber
                ? String(data.queueNumber)
                : "—";

        allocationStatusDot.classList.remove(
            "pending",
            "allocated",
            "not-allocated"
        );

        allocationStatusValue.classList.remove(
            "pending",
            "allocated",
            "not-allocated"
        );

        if (status === "Allocated") {

            allocationStatusDot.classList.add("allocated");
            allocationStatusValue.classList.add("allocated");
            allocationStatusValue.textContent = "Allocated";

        } else if (status === "Not Allocated") {

            allocationStatusDot.classList.add("not-allocated");
            allocationStatusValue.classList.add("not-allocated");
            allocationStatusValue.textContent = "Not Allocated";

        } else {

            // "Registered" or "Withdrawn" (or blank) both read
            // as "Pending" from the student's point of view,
            // since no allocation decision has been made yet.

            allocationStatusDot.classList.add("pending");
            allocationStatusValue.classList.add("pending");
            allocationStatusValue.textContent = "Pending";

        }

    }


    // ========================================================
    // PREFILL FORM FIELDS FROM A PROFILE OBJECT
    // ========================================================

    function prefillFormFromProfile(profile) {

        if (!profile) {
            return;
        }

        const fieldMap = [
            ["fullName", profile.name],
            ["course", profile.course],
            ["gender", profile.gender],
            ["academicYear", profile.year],
            ["hostelPreference", profile.hostelPreference],
            ["pinCode", profile.housePincode],
            ["homeLocation", profile.state]
        ];

        fieldMap.forEach(function (pair) {

            const el =
                document.getElementById(pair[0]);

            if (el && pair[1] !== undefined && pair[1] !== null) {

                el.value = pair[1];

            }

        });

    }


    // ========================================================
    // FETCH CURRENT REGISTRATION STATE FROM THE BACKEND
    // ========================================================

    async function loadRegistrationState() {

        try {

            const body =
                new URLSearchParams();

            body.append("action", "getStudentProfile");
            body.append("studentId", studentId);

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body: body.toString()

                });

            if (!response.ok) {

                throw new Error(
                    "Server returned HTTP " +
                    response.status
                );

            }

            const result =
                await response.json();

            if (!result.success) {

                // If we can't determine state, fall back to
                // showing the (empty) registration form rather
                // than blocking the student entirely.

                showFormView();

                return;

            }

            lastKnownProfile = result;

            localStorage.setItem(
                "studentStatus",
                result.applicationStatus || "Registered"
            );

            updateStatusBar(result);

            if (result.isProfileComplete) {

                showAlreadySubmittedView();

            } else {

                prefillFormFromProfile(result.profile);

                showFormView();

            }

        } catch (error) {

            console.error(
                "Failed to load registration state:",
                error
            );

            // Network/parse failure: don't block the student,
            // just show the form as a safe default.

            showFormView();

        }

    }


    // ========================================================
    // EDIT REGISTRATION
    // ========================================================

    if (editRegistrationBtn) {

        editRegistrationBtn.addEventListener(
            "click",
            function () {

                if (lastKnownProfile && lastKnownProfile.profile) {

                    prefillFormFromProfile(
                        lastKnownProfile.profile
                    );

                }

                showFormView();

            }
        );

    }


    // ========================================================
    // WITHDRAW REGISTRATION
    // ========================================================

    if (withdrawRegistrationBtn) {

        withdrawRegistrationBtn.addEventListener(
            "click",
            async function () {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to withdraw your hostel registration? " +
                        "You will need to fill the form again if you change your mind."
                    );

                if (!confirmed) {
                    return;
                }

                withdrawRegistrationBtn.disabled = true;

                if (editRegistrationBtn) {
                    editRegistrationBtn.disabled = true;
                }

                if (alreadySubmittedMessage) {

                    alreadySubmittedMessage.textContent = "";
                    alreadySubmittedMessage.className =
                        "hostel-form-message";

                }

                try {

                    const body =
                        new URLSearchParams();

                    body.append("action", "withdrawRegistration");
                    body.append("studentId", studentId);

                    const response =
                        await fetch(API_URL, {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8"
                            },

                            body: body.toString()

                        });

                    if (!response.ok) {

                        throw new Error(
                            "Server returned HTTP " +
                            response.status
                        );

                    }

                    const result =
                        await response.json();

                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Failed to withdraw your registration."
                        );

                    }

                    localStorage.setItem(
                        "studentStatus",
                        result.status || "Withdrawn"
                    );

                    // Clear the visible form so the student
                    // starts fresh, then show it.

                    const hostelFormEl =
                        document.getElementById("hostelForm");

                    if (hostelFormEl) {
                        hostelFormEl.reset();
                    }

                    if (enrollmentIdInput) {
                        enrollmentIdInput.value = studentId;
                    }

                    if (emailInput && studentEmail) {
                        emailInput.value = studentEmail;
                    }

                    lastKnownProfile = null;

                    updateStatusBar({
                        applicationStatus: "Withdrawn",
                        queueNumber: ""
                    });

                    showFormView();

                } catch (error) {

                    console.error(
                        "Withdraw error:",
                        error
                    );

                    if (alreadySubmittedMessage) {

                        alreadySubmittedMessage.textContent =
                            error.message ||
                            "Unable to withdraw your registration. Please try again.";

                        alreadySubmittedMessage.className =
                            "hostel-form-message error-message";

                    }

                } finally {

                    withdrawRegistrationBtn.disabled = false;

                    if (editRegistrationBtn) {
                        editRegistrationBtn.disabled = false;
                    }

                }

            }
        );

    }


    // ========================================================
    // HOSTEL / PROFILE FORM SUBMISSION
    // ========================================================

    const hostelForm =
        document.getElementById("hostelForm");

    const hostelMessage =
        document.getElementById("hostelMessage");


    // adding registration button .....:
        const submitHostelBtn =
            document.getElementById("submitHostelBtn");
        
        const submitHostelBtnText =
            submitHostelBtn ? submitHostelBtn.querySelector("span") : null;
            


    function showHostelMessage(text, type) {

        if (!hostelMessage) {
            return;
        }

        hostelMessage.textContent = text;

        hostelMessage.className =
            "hostel-form-message " +
            (type === "success"
                ? "success-message"
                : "error-message");

    }


    if (hostelForm) {

        hostelForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                showHostelMessage("", "");


                // ------------------------------------------------
                // COLLECT + MAP FIELDS TO BACKEND NAMES
                // ------------------------------------------------
                //
                // Backend (updateStudentProfile) expects:
                //   studentId, name, course, gender, year,
                //   hostelPreference, housePincode, state
                //
                // Form field name -> backend field name:
                //   fullName        -> name
                //   homeLocation    -> state
                //   pinCode         -> housePincode
                //   academicYear    -> year
                //   hostelPreference -> hostelPreference (same)
                //   gender          -> gender (same)
                //   course          -> course (same)
                // ------------------------------------------------

                const name =
                    document.getElementById("fullName").value.trim();

                const course =
                    document.getElementById("course").value.trim();

                const gender =
                    document.getElementById("gender").value.trim();

                const year =
                    document.getElementById("academicYear").value.trim();

                const hostelPreference =
                    document.getElementById("hostelPreference").value.trim();

                const housePincode =
                    document.getElementById("pinCode").value.trim();

                const state =
                    document.getElementById("homeLocation").value.trim();


                // ------------------------------------------------
                // BASIC CLIENT-SIDE CHECKS
                // (backend re-validates everything anyway)
                // ------------------------------------------------

                if (
                    !name ||
                    !course ||
                    !gender ||
                    !year ||
                    !hostelPreference ||
                    !housePincode ||
                    !state
                ) {

                    showHostelMessage(
                        "Please fill in all required fields."
                    );

                    return;

                }

                if (!/^\d{6}$/.test(housePincode)) {

                    showHostelMessage(
                        "PIN code must contain exactly 6 digits."
                    );

                    return;

                }


               // ------------------------------------------------
// LOADING STATE
// ------------------------------------------------

if (submitHostelBtn) {

    submitHostelBtn.disabled = true;

}

if (submitHostelBtnText) {

    submitHostelBtnText.textContent = "Registering...";

}

                try {

                    // ------------------------------------------------
                    // SEND AS application/x-www-form-urlencoded
                    // to avoid a CORS preflight (Apps Script has no
                    // doOptions handler and cannot answer preflights).
                    // ------------------------------------------------

                    const body =
                        new URLSearchParams();

                    body.append("action", "updateStudentProfile");
                    body.append("studentId", studentId);
                    body.append("name", name);
                    body.append("course", course);
                    body.append("gender", gender);
                    body.append("year", year);
                    body.append("hostelPreference", hostelPreference);
                    body.append("housePincode", housePincode);
                    body.append("state", state);


                    const response =
                        await fetch(API_URL, {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8"
                            },

                            body: body.toString()

                        });


                    if (!response.ok) {

                        throw new Error(
                            "Server returned HTTP " +
                            response.status
                        );

                    }


                    const result =
                        await response.json();


                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Failed to save your registration."
                        );

                    }


                    // ------------------------------------------------
                    // SUCCESS
                    // ------------------------------------------------

                    localStorage.setItem(
                        "studentStatus",
                        result.status || "Registered"
                    );

                    showHostelMessage(
                        "Registration saved successfully.",
                        "success"
                    );

                    // Refresh the registration state so the page
                    // now flips to the "already submitted" screen,
                    // with an up-to-date queue number/status.

                    await loadRegistrationState();


                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    showHostelMessage(
                        error.message ||
                        "Unable to save your registration. Please try again."
                    );

} finally {

    if (submitHostelBtn) {

        submitHostelBtn.disabled = false;

    }

    if (submitHostelBtnText) {

        submitHostelBtnText.textContent = "Save Registration";

    }

}

                

            }
        );

    }


    // ========================================================
    // INITIAL LOAD: DECIDE WHICH VIEW TO SHOW
    // ========================================================

    loadRegistrationState();

});
