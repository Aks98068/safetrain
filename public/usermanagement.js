
// ===========================
// 1️⃣ Fetch Users and Populate Table
// ===========================
async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Content-Type': 'application/json' }
        });
        const users = await res.json();
        populateUserTable(users);
    } catch (err) {
        console.error('Failed to fetch users:', err);
    }
}

function populateUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = ''; // clear table
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.ID}</td>
            <td>${user.FirstName}</td>
            <td>${user.LastName}</td>
            <td>${user.Email}</td>
            <td>${user.Role}</td>
            <td>${user.IsActive ? 'Active' : 'Inactive'}</td>
        `;
        // Allow clicking row to edit
        tr.addEventListener('click', () => fillFormForEdit(user));
        tbody.appendChild(tr);
    });
}

// ===========================
// 2️⃣ Fill Form for Editing User
// ===========================
let editUserId = null; // track if editing
function fillFormForEdit(user) {
    editUserId = user.ID;
    const form = document.getElementById('userForm');
    form.first_name.value = user.FirstName;
    form.last_name.value = user.LastName;
    form.email.value = user.Email;
    form.password.value = ''; // password is optional when editing
    form.role.value = user.Role;
}

// ===========================
// 3️⃣ Submit Form (Create or Update)
// ===========================
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        email: form.email.value,
        password: form.password.value,
        role: form.role.value
    };

    let url = '/api/admin/users';
    let method = 'POST';

    if (editUserId) { // edit mode
        url += `/${editUserId}`;
        method = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message); // show alert
        form.reset();
        editUserId = null;
        fetchUsers(); // refresh table
    } catch (err) {
        console.error('Error submitting form:', err);
        alert('Failed to save user.');
    }
});

// ===========================
// 4️⃣ Search Users by Email
// ===========================
document.getElementById('searchUser').addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    const tbody = document.getElementById('userTableBody');
    Array.from(tbody.rows).forEach(row => {
        const email = row.cells[3].innerText.toLowerCase();
        row.style.display = email.includes(filter) ? '' : 'none';
    });
});

// ===========================
// 5️⃣ Initial Fetch
// ===========================
fetchUsers();

