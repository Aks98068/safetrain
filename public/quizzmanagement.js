// Show alert
function showQuizAlert(msg, color='green') {
    const alertBox = document.getElementById('quizAlert');
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = color;
    alertBox.style.color = '#fff';
    alertBox.textContent = msg;
    setTimeout(() => alertBox.style.display = 'none', 3000);
}

// Fetch all quizzes
async function fetchAdminQuizzes() {
    const res = await fetch("/api/admin/quizzes");
    const quizzes = await res.json();

    const tbody = document.getElementById("quizTableBody");
    const moduleSelect = document.getElementById("quizModule");
    tbody.innerHTML = '';
    moduleSelect.innerHTML = '<option value="">Select Module</option>';

    quizzes.forEach(q => {
        // Populate table
        tbody.innerHTML += `
        <tr>
            <td>${q.ID}</td>
            <td>${q.ModuleID}</td>
            <td>${q.Question}</td>
            <td>
                A: ${q.OptionA}<br>
                B: ${q.OptionB}<br>
                C: ${q.OptionC}<br>
                D: ${q.OptionD}
            </td>
            <td>${q.CorrectOption}</td>
            <td>
                <button onclick="editQuiz(${q.ID})">Edit</button>
                <button onclick="deleteQuiz(${q.ID})">Delete</button>
            </td>
        </tr>`;

        // Populate module select
        if (![...moduleSelect.options].some(o => o.value === q.ModuleID)) {
            moduleSelect.innerHTML += `<option value="${q.ModuleID}">${q.ModuleID}</option>`;
        }
    });
}

// Add / Edit Quiz
document.getElementById("quizForm").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("quizId").value;

    const payload = {
        ModuleID: document.getElementById("quizModule").value,
        Question: document.getElementById("question").value,
        OptionA: document.getElementById("optionA").value,
        OptionB: document.getElementById("optionB").value,
        OptionC: document.getElementById("optionC").value,
        OptionD: document.getElementById("optionD").value,
        CorrectOption: document.getElementById("correctOption").value,
        Feedback: document.getElementById("feedback").value
    };

    const url = id ? `/api/admin/quizzes/${id}` : '/api/admin/quizzes';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showQuizAlert(id ? "Quiz updated successfully!" : "Quiz created successfully!");
        document.getElementById("quizForm").reset();
        document.getElementById("quizId").value = '';
        fetchAdminQuizzes();
    } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Something went wrong"));
    }
});

// Edit quiz
async function editQuiz(id) {
    const res = await fetch("/api/admin/quizzes");
    const quizzes = await res.json();
    const quiz = quizzes.find(q => q.ID === id);
    if (!quiz) return;

    document.getElementById("quizId").value = quiz.ID;
    document.getElementById("quizModule").value = quiz.ModuleID;
    document.getElementById("question").value = quiz.Question;
    document.getElementById("optionA").value = quiz.OptionA;
    document.getElementById("optionB").value = quiz.OptionB;
    document.getElementById("optionC").value = quiz.OptionC;
    document.getElementById("optionD").value = quiz.OptionD;
    document.getElementById("correctOption").value = quiz.CorrectOption;
    document.getElementById("feedback").value = quiz.Feedback;
}

// Delete quiz
async function deleteQuiz(id) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    const res = await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showQuizAlert("Quiz deleted successfully!", 'red');
        fetchAdminQuizzes();
    } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Failed to delete quiz"));
    }
}

// Initial load
fetchAdminQuizzes();
