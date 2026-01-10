document.addEventListener("DOMContentLoaded", function () {
    fetch("/dashboard/api/stats")
        .then(res => res.json())
        .then(data => {
            document.getElementById("total-users").textContent = data.totalUsers;
            document.getElementById("total-supervisors").textContent = data.supervisors;
            document.getElementById("total-trainees").textContent = data.trainees;
            document.getElementById("pending-approvals").textContent = data.pendingApprovals;

            // Pie Chart for user distribution
            const pieCtx = document.getElementById("userPieChart").getContext("2d");
            new Chart(pieCtx, {
                type: "pie",
                data: {
                    labels: ["Supervisors", "Trainees", "Pending Approvals"],
                    datasets: [{
                        data: [data.supervisors, data.trainees, data.pendingApprovals],
                        backgroundColor: ["#10b981", "#3b82f6", "#ef4444"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: "User Distribution" }
                    }
                }
            });

            // Line Chart for registration trend (example static data)
            const regCtx = document.getElementById("registrationChart").getContext("2d");
            new Chart(regCtx, {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{
                        label: "New Users",
                        data: [5, 10, 8, 15, 12, 20], // replace with DB data if available
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59,130,246,0.2)",
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: true } } }
            });

            // Bar chart for Quiz completion (example static data)
            const quizCtx = document.getElementById("quizChart").getContext("2d");
            new Chart(quizCtx, {
                type: "bar",
                data: {
                    labels: ["Module 1", "Module 2", "Module 3", "Module 4"],
                    datasets: [{
                        label: "Completion %",
                        data: [75, 60, 90, 50], // replace with DB data
                        backgroundColor: ["#10b981", "#3b82f6", "#facc15", "#ef4444"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
        })
        .catch(err => console.error("Error loading dashboard stats:", err));
});



document.querySelector('.logout-link').addEventListener('click', function (e) {
    e.preventDefault();
    fetch('/logout')
        .then(() => {
            window.location.href = '/';
        });
});

const tableBody = document.getElementById('userTableBody');

document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("userForm");
    const userTableBody = document.getElementById("userTableBody");
    const searchUser = document.getElementById("searchUser");

    let users = [];
    let editingUserId = null;

    // Fetch and display users
    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            users = data.users || data; // handle both structures
            renderUsers(users);
        } catch (err) {
            userTableBody.innerHTML = `<tr><td colspan="6">Failed to load users</td></tr>`;
            console.error(err);
        }
    }

    function renderUsers(list) {
        userTableBody.innerHTML = "";
        if (list.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
            return;
        }

        list.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.is_active ? "Yes" : "No"}</td>
                <td>
                    <button class="edit-btn" data-id="${user.id}">Edit</button>
                    <button class="deactivate-btn" data-id="${user.id}">Deactivate</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });

        // Attach event listeners for edit and deactivate buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const user = users.find(u => u.id == id);
                if (user) loadUserIntoForm(user);
            });
        });

        document.querySelectorAll(".deactivate-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                if (confirm("Are you sure you want to deactivate this user?")) {
                    deactivateUser(id);
                }
            });
        });
    }

    // Load user into form for editing
    function loadUserIntoForm(user) {
        editingUserId = user.id;
        document.getElementById("firstName").value = user.first_name;
        document.getElementById("lastName").value = user.last_name;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;
        document.getElementById("password").value = "";
    }

})

    async function editUser(id) {
        const res = await fetch(`${apiBase}/users`);
        const data = await res.json();
        const u = data.users.find(u => u.id === id);
        if (!u) return;

        document.getElementById('userId').value = u.id;
        document.getElementById('firstName').value = u.first_name;
        document.getElementById('lastName').value = u.last_name;
        document.getElementById('email').value = u.email;
        document.getElementById('role').value = u.role;
        document.getElementById('password').value = '';
    }

    async function deactivateUser(id) {
        if (!confirm('Are you sure to deactivate this user?')) return;

        const res = await fetch(`${apiBase}/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('User deactivated');
            fetchUsers();
        }
    }
    window.addEventListener('DOMContentLoaded', fetchUsers);

