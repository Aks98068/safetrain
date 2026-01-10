document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (res.ok) {
        alert("Registration successful");
        window.location.href = "/login"; // ✅ redirect here
    } else {
        alert(data.message || "Registration failed");
    }
});
document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message || "Login failed");
        return;
    }

    // ✅ REDIRECT BASED ON ROLE
    if (data.role === "admin") {
        window.location.href = "/dashboard/admin";
    } else if (data.role === "supervisor") {
        window.location.href = "/dashboard/supervisor";
    } else if (data.role === "trainee") {
        window.location.href = "/dashboard/trainee";
    }
});
