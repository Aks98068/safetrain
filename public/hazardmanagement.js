
let hazardScore = 0;
const maxScore = 5; // adjust dynamically if needed
let hazardsData = [];

// ===== Fetch and display hazards in the scene =====
async function initHazardModule(moduleId = 1) {
    try {
        // Fetch module from backend
        const res = await fetch(`/api/admin/hazard-modules/${moduleId}`);
        if (!res.ok) throw new Error('Failed to fetch module');
        const module = await res.json();

        hazardsData = module.hazards; // save hazards data
        hazardScore = 0;
        document.getElementById('hazardScore').textContent = hazardScore;
        document.getElementById('completeBtn').disabled = true;

        const sceneContainer = document.getElementById('warehouseScene');
        sceneContainer.innerHTML = ''; // clear old hazards

        // Optional: Add background SVG
        sceneContainer.innerHTML = `
            <svg viewBox="0 0 1000 600" class="warehouse-svg">
                <rect x="0" y="0" width="1000" height="600" fill="#e5e7eb"/>
                <rect x="0" y="400" width="1000" height="200" fill="#9ca3af"/>
            </svg>
        `;

        // Add hazards dynamically
        hazardsData.forEach((hazard, index) => {
            const btn = document.createElement('button');
            btn.className = 'hazard-hotspot';
            btn.id = `hazard${index + 1}`;
            btn.type = 'button';
            btn.style.left = hazard.x_percent + '%';
            btn.style.top = hazard.y_percent + '%';
            btn.style.width = hazard.width + 'px';
            btn.style.height = hazard.height + 'px';
            btn.dataset.hazard = hazard.name;
            btn.setAttribute('aria-label', hazard.description);
            btn.onclick = () => clickHazard(index);

            const visual = document.createElement('div');
            visual.className = 'hazard-visual';
            visual.textContent = ''; // optional SVG inside if you want

            btn.appendChild(visual);
            sceneContainer.appendChild(btn);
        });
    } catch (err) {
        console.error(err);
        alert('Failed to load hazard module!');
    }
}

// ===== Handle click on hazard =====
function clickHazard(index) {
    const btn = document.getElementById(`hazard${index + 1}`);
    if (!btn.classList.contains('found')) {
        btn.classList.add('found');
        hazardScore++;
        document.getElementById('hazardScore').textContent = hazardScore;
        if (hazardScore >= hazardsData.length) {
            document.getElementById('completeBtn').disabled = false;
        }
    }
}

// ===== Complete Module =====
function completeHazardModule() {
    alert('Module Completed! You found ' + hazardScore + ' hazards.');
    // optionally send score to backend here
}

// ===== Reset Module =====
function resetHazardModule() {
    hazardScore = 0;
    document.getElementById('hazardScore').textContent = hazardScore;
    document.getElementById('completeBtn').disabled = true;
    hazardsData.forEach((_, index) => {
        const btn = document.getElementById(`hazard${index + 1}`);
        if (btn) btn.classList.remove('found');
    });
}

// ===== Initial Load =====
document.addEventListener('DOMContentLoaded', () => {
    initHazardModule(1); // Load module 1 by default
});






// ===== Show success/error alert =====
function showHazardAlert(msg, color = 'green') {
    const alert = document.getElementById('hazardAlert');
    alert.style.display = 'block';
    alert.style.backgroundColor = color;
    alert.style.color = '#fff';
    alert.textContent = msg;

    setTimeout(() => alert.style.display = 'none', 3000);
}

// ===== Add / Remove hazard input fields dynamically =====
function addHazardInput() {
    const container = document.getElementById('hazardsContainer');
    const div = document.createElement('div');
    div.classList.add('hazard-input');
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" name="hazardName[]" placeholder="Hazard Name" required>
        <input type="number" name="hazardX[]" placeholder="X %" step="0.01" required>
        <input type="number" name="hazardY[]" placeholder="Y %" step="0.01" required>
        <input type="number" name="hazardWidth[]" placeholder="Width" step="0.01" required>
        <input type="number" name="hazardHeight[]" placeholder="Height" step="0.01" required>
        <button type="button" onclick="removeHazardInput(this)">Remove</button>
    `;
    container.appendChild(div);
}

function removeHazardInput(btn) {
    btn.parentElement.remove();
}

// ===== Fetch Hazard Modules and display in table =====
async function fetchHazardModules() {
    try {
        const res = await fetch('/api/admin/hazard-modules');
        const data = await res.json();

        const tbody = document.getElementById('hazardTableBody');
        tbody.innerHTML = '';

        if (!data.modules || data.modules.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No modules found.</td></tr>';
            return;
        }

        data.modules.forEach(module => {
            const hazards = module.hazards
                .map(h => `${h.name} (X:${h.x_percent}%, Y:${h.y_percent}%)`)
                .join('<br>');

            tbody.innerHTML += `<tr>
                <td>${module.id}</td>
                <td>${module.title}</td>
                <td>${module.description}</td>
                <td>${module.scene_image ? `<img src="${module.scene_image}" width="100">` : ''}</td>
                <td>${hazards}</td>
                <td>
                    <button onclick="editHazardModule(${module.id})">Edit</button>
                    <button onclick="deleteHazardModule(${module.id})">Delete</button>
                </td>
            </tr>`;
        });
    } catch (err) {
        console.error('Error fetching hazard modules:', err);
    }
}

// ===== Handle Add / Edit Hazard Module =====
document.getElementById('hazardForm').addEventListener('submit', async e => {
    e.preventDefault();

    const id = document.getElementById('hazardModuleId').value;
    const moduleName = document.getElementById('moduleName').value;
    const moduleDesc = document.getElementById('moduleDesc').value;
    const sceneUrl = document.getElementById('sceneUrl').value;

    const hazardNames = [...document.getElementsByName('hazardName[]')].map(i => i.value);
    const hazardX = [...document.getElementsByName('hazardX[]')].map(i => i.value);
    const hazardY = [...document.getElementsByName('hazardY[]')].map(i => i.value);
    const hazardWidth = [...document.getElementsByName('hazardWidth[]')].map(i => i.value);
    const hazardHeight = [...document.getElementsByName('hazardHeight[]')].map(i => i.value);

    const hazards = hazardNames.map((name, index) => ({
        name,
        x_percent: parseFloat(hazardX[index]),
        y_percent: parseFloat(hazardY[index]),
        width: parseFloat(hazardWidth[index]),
        height: parseFloat(hazardHeight[index])
    }));

    const payload = { title: moduleName, description: moduleDesc, scene_image: sceneUrl, hazards };

    const url = id ? `/api/admin/hazard-modules/${id}` : '/api/admin/hazard-modules';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (res.ok) {
            showHazardAlert(result.message || 'Module saved successfully', 'green');
            document.getElementById('hazardForm').reset();
            document.getElementById('hazardModuleId').value = '';
            document.getElementById('hazardsContainer').innerHTML = '';
            addHazardInput(); // Start with one hazard input
            fetchHazardModules();
        } else {
            showHazardAlert(result.error || 'Failed to save module', 'red');
        }
    } catch (err) {
        console.error(err);
        showHazardAlert('Something went wrong!', 'red');
    }
});

// ===== Edit Hazard Module =====
async function editHazardModule(id) {
    try {
        const res = await fetch(`/api/admin/hazard-modules/${id}`);
        const module = await res.json();

        document.getElementById('hazardModuleId').value = module.id;
        document.getElementById('moduleName').value = module.title;
        document.getElementById('moduleDesc').value = module.description;
        document.getElementById('sceneUrl').value = module.scene_image || '';

        const container = document.getElementById('hazardsContainer');
        container.innerHTML = '';

        module.hazards.forEach(h => {
            const div = document.createElement('div');
            div.classList.add('hazard-input');
            div.innerHTML = `
                <input type="text" name="hazardName[]" value="${h.name}" required>
                <input type="number" name="hazardX[]" value="${h.x_percent}" step="0.01" required>
                <input type="number" name="hazardY[]" value="${h.y_percent}" step="0.01" required>
                <input type="number" name="hazardWidth[]" value="${h.width}" step="0.01" required>
                <input type="number" name="hazardHeight[]" value="${h.height}" step="0.01" required>
                <button type="button" onclick="removeHazardInput(this)">Remove</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        showHazardAlert('Failed to load module for edit', 'red');
    }
}

// ===== Delete Hazard Module =====
async function deleteHazardModule(id) {
    if (!confirm('Are you sure you want to delete this hazard module?')) return;
    try {
        const res = await fetch(`/api/admin/hazard-modules/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showHazardAlert(result.message || 'Module deleted successfully', 'red');
            fetchHazardModules();
        } else {
            showHazardAlert(result.error || 'Failed to delete module', 'red');
        }
    } catch (err) {
        console.error(err);
        showHazardAlert('Something went wrong!', 'red');
    }
}

// ===== Initial setup =====
document.addEventListener('DOMContentLoaded', () => {
    fetchHazardModules();
    addHazardInput(); // Start with one hazard input
});
