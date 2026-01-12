// ===== Trainee Variables =====
let hazardScore = 0;
let hazardsData = [];

// ===== Load hazard module for trainee =====
async function initHazardModule(moduleId = 1) {
    try {
        const res = await fetch(`/api/training/hazard-module/${moduleId}`);
        if (!res.ok) throw new Error('Failed to fetch module');
        const module = await res.json();

        hazardsData = module.hazards; 
        hazardScore = 0;
        document.getElementById('hazardScore').textContent = hazardScore;
        document.getElementById('completeBtn').disabled = true;

        const sceneContainer = document.getElementById('warehouseScene');
        sceneContainer.innerHTML = ''; // clear old hazards

        // Add background image
        const img = document.createElement('img');
        img.src = module.scene_image;
        img.alt = module.title;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.className = 'scene-background';
        sceneContainer.appendChild(img);

        // Add hazards dynamically
        hazardsData.forEach((hazard, index) => {
            const btn = document.createElement('button');
            btn.className = 'hazard-hotspot';
            btn.id = `hazard${index + 1}`;
            btn.type = 'button';
            btn.style.position = 'absolute';
            btn.style.left = hazard.x_percent + '%';
            btn.style.top = hazard.y_percent + '%';
            btn.style.width = hazard.width + '%';
            btn.style.height = hazard.height + '%';
            btn.dataset.hazard = hazard.name;
            btn.setAttribute('aria-label', hazard.description);
            btn.onclick = () => clickHazard(index);

            const visual = document.createElement('div');
            visual.className = 'hazard-visual';
            visual.style.width = '100%';
            visual.style.height = '100%';
            visual.style.backgroundColor = 'rgba(255,0,0,0.3)'; // semi-transparent red
            btn.appendChild(visual);

            sceneContainer.appendChild(btn);
        });

    } catch (err) {
        console.error(err);
        alert('Failed to load hazard module!');
    }
}

// ===== Click Hazard =====
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

// ===== Admin Functions =====
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
        console.error(err);
    }
}

// ===== Initial Load =====
document.addEventListener('DOMContentLoaded', () => {
    initHazardModule(1); // trainee view
    fetchHazardModules(); // admin view if needed
});
