const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const message = document.getElementById("loginMessage");
    const button = loginForm.querySelector("button");
    message.textContent = "";
    try {
      setLoading(button, true, "Signing in...");
      const result = await API.login(
        document.getElementById("studentId").value.trim(),
        document.getElementById("password").value
      );
      sessionStorage.setItem("studentSession", JSON.stringify({
        studentId: result.studentId,
        name: result.name,
        status: result.status
      }));
      window.location.href = "student.html";
    } catch (err) {
      message.textContent = err.message;
    } finally { setLoading(button, false); }
  });
}