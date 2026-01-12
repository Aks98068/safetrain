let hazards = [];
let currentIndex = 0;
let score = 0;
let found = false;

async function loadTrainingModule(moduleId) {
    try {
        const res = await fetch(`/api/training/hazard-module/${moduleId}`);
        const data = await res.json();

        document.getElementById("moduleTitle").innerText = data.title;
        document.getElementById("moduleDescription").innerText = data.description;

        hazards = data.hazards;
        currentIndex = 0;
        score = 0;
        updateScore();

        const scene = document.getElementById("warehouseScene");
        scene.style.backgroundImage = `url(${data.scene_image})`;

        scene.onclick = wrongClick;

        loadCurrentHazard();
    } catch {
        document.getElementById("feedback").innerText =
            "Failed to load hazard module";
    }
}

function loadCurrentHazard() {
    const scene = document.getElementById("warehouseScene");
    scene.innerHTML = "";
    found = false;

    document.getElementById("nextBtn").disabled = true;
    document.getElementById("feedback").innerText =
        `Find hazard ${currentIndex + 1} of ${hazards.length}`;

    if (currentIndex >= hazards.length) {
        score += 10; // completion bonus
        updateScore();

        document.getElementById("feedback").innerHTML = `
            🎉 <strong>Training Completed</strong><br>
            Final Score: ${score}<br>
            ${finalFeedback()}
        `;
        return;
    }

    const h = hazards[currentIndex];

    const hotspot = document.createElement("div");
    hotspot.className = "hazard-hotspot";
    hotspot.style.left = h.x_percent + "%";
    hotspot.style.top = h.y_percent + "%";
    hotspot.style.width = h.width + "%";
    hotspot.style.height = h.height + "%";

    hotspot.onclick = (e) => {
        e.stopPropagation();
        detectHazard(hotspot, h);
    };

    scene.appendChild(hotspot);
}

function detectHazard(el, hazard) {
    if (found) return;

    found = true;
    el.classList.add("found");

    score += 10;
    updateScore();

    document.getElementById("feedback").innerHTML = `
        ✔ <strong>${hazard.name}</strong><br>
        ${hazard.description}<br>
        +10 points
    `;

    document.getElementById("nextBtn").disabled = false;
}

function wrongClick() {
    if (found) return;

    score = Math.max(0, score - 2);
    updateScore();

    document.getElementById("feedback").innerText =
        "❌ Incorrect area clicked (−2 points)";
}

function nextHazard() {
    currentIndex++;
    loadCurrentHazard();
}

function updateScore() {
    document.getElementById("score").innerText = score;
}

function finalFeedback() {
    if (score >= 80) return "🏆 Excellent hazard awareness!";
    if (score >= 50) return "👍 Good job, but stay more alert.";
    return "⚠️ Needs improvement. Review safety training.";
}
