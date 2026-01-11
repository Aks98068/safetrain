const TrainingState = {
    hazardScore: 0,
    hazardCompleted: false,
    hazardsFound: [],
    handlingScore: 0,
    handlingCompleted: false,
    currentScenario: 1,
    scenarioAnswered: [false, false, false, false]
};


const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


const HAZARD_FEEDBACK = {
    1: {
        name: "Floor Spillage",
        message: "Correct! Liquid spillages on the floor are a slip hazard. They should be cleaned immediately and warning signs placed."
    },
    2: {
        name: "Unstable Stacked Boxes",
        message: "Well spotted! Loose and tilted boxes can fall and cause injuries. Boxes should be stacked safely and securely."
    },
    3: {
        name: "Blocked Emergency Exit",
        message: "Excellent! Emergency exits must never be blocked. This is a serious safety violation that could prevent escape in an emergency."
    },
    4: {
        name: "Trailing Cable",
        message: "Good eye! Trailing cables are a trip hazard. Cables should be secured or covered with cable protectors."
    },
    5: {
        name: "Broken Pallet",
        message: "Correct! Broken pallets can cause items to fall and are dangerous. They should be removed from use immediately."
    }
};

const HANDLING_FEEDBACK = {
    correct: [
        "Correct! Bending your knees while keeping your back straight is the safest way to lift. This uses your leg muscles instead of straining your back.",
        "Right! Keeping the load close to your body reduces strain on your back and gives you better control of the item.",
        "Excellent! Using a step ladder and facing the shelf directly prevents twisting your spine while lifting overhead, which can cause serious injury.",
        "Perfect! Heavy items should always be team lifted. Never try to lift something alone if it's too heavy - ask for help!"
    ],
    incorrect: [
        "Incorrect. Bending from the waist with straight legs puts enormous strain on your lower back and can cause serious injury. Always bend your knees instead.",
        "Not quite. Holding items away from your body increases strain on your back and arms, and gives you less control. Keep loads close to your center of gravity.",
        "Wrong. Twisting while lifting, especially overhead, is one of the most common causes of back injuries. Always face the shelf directly.",
        "Incorrect. Lifting very heavy items alone can cause severe injuries. It's always safer to get help or use mechanical aids for heavy loads."
    ]
};

function saveState() {
    sessionStorage.setItem('trainingState', JSON.stringify(TrainingState));
}

function loadState() {
    const saved = sessionStorage.getItem('trainingState');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(TrainingState, parsed);
    }
}

function initModule(type) {
    loadState();
    if (type === 'hazard') {
        TrainingState.hazardScore = 0;
        TrainingState.hazardsFound = [];
    } else if (type === 'handling') {
        TrainingState.handlingScore = 0;
        TrainingState.currentScenario = 1;
        TrainingState.scenarioAnswered = [false, false, false, false];
    }
    saveState();
}

function updateProgressDisplay() {
    loadState();
    const hazardProgress = document.getElementById('hazardProgress');
    const handlingProgress = document.getElementById('handlingProgress');
    
    if (hazardProgress) {
        if (TrainingState.hazardCompleted) {
            hazardProgress.textContent = `Completed (${TrainingState.hazardScore}/5)`;
            hazardProgress.classList.add('completed');
        } else {
            hazardProgress.textContent = 'Not Started';
            hazardProgress.classList.remove('completed');
        }
    }
    
    if (handlingProgress) {
        if (TrainingState.handlingCompleted) {
            handlingProgress.textContent = `Completed (${TrainingState.handlingScore}/4)`;
            handlingProgress.classList.add('completed');
        } else {
            handlingProgress.textContent = 'Not Started';
            handlingProgress.classList.remove('completed');
        }
    }
}

function initHazardModule() {
    loadState();
    TrainingState.hazardScore = 0;
    TrainingState.hazardsFound = [];
    TrainingState.hazardCompleted = false;
    saveState();
    updateHazardScore();
    
    for (let i = 1; i <= 5; i++) {
        const hotspot = document.getElementById(`hazard${i}`);
        if (hotspot) {
            hotspot.classList.remove('found');
        }
    }
    
    const feedbackContent = document.getElementById('feedbackContent');
    if (feedbackContent) {
        feedbackContent.innerHTML = '<p>Click on hazards in the scene above to identify them.</p>';
        feedbackContent.classList.remove('correct', 'incorrect');
    }
    
    const completeBtn = document.getElementById('completeBtn');
    if (completeBtn) {
        completeBtn.disabled = true;
    }
}

function clickHazard(hazardId) {
    loadState();
    
    if (TrainingState.hazardsFound.includes(hazardId)) {
        return;
    }
    
    TrainingState.hazardsFound.push(hazardId);
    TrainingState.hazardScore++;
    saveState();
    
    const hotspot = document.getElementById(`hazard${hazardId}`);
    if (hotspot) {
        hotspot.classList.add('found');
    }
    
    updateHazardScore();
    
    const feedback = HAZARD_FEEDBACK[hazardId];
    const feedbackContent = document.getElementById('feedbackContent');
    if (feedbackContent && feedback) {
        feedbackContent.innerHTML = `
            <span style="font-size: 1.5rem; color: var(--success-color);">&#10003;</span>
            <div>
                <strong>${feedback.name}</strong>
                <p>${feedback.message}</p>
            </div>
        `;
        feedbackContent.classList.add('correct');
        feedbackContent.classList.remove('incorrect');
    }
    
    if (TrainingState.hazardScore >= 5) {
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.disabled = false;
        }
    }
}

function updateHazardScore() {
    const scoreValue = document.getElementById('hazardScore');
    if (scoreValue) {
        scoreValue.textContent = TrainingState.hazardScore;
    }
}

function resetHazardModule() {
    initHazardModule();
}

function completeHazardModule() {
    loadState();
    TrainingState.hazardCompleted = true;
    saveState();
    window.location.href = '/result';
}

function initHandlingModule() {
    loadState();
    TrainingState.handlingScore = 0;
    TrainingState.currentScenario = 1;
    TrainingState.scenarioAnswered = [false, false, false, false];
    TrainingState.handlingCompleted = false;
    saveState();
    
    showScenario(1);
    updateHandlingScore();
    updateProgressBar();
    
    const feedbackContent = document.getElementById('handlingFeedbackContent');
    if (feedbackContent) {
        feedbackContent.innerHTML = '<p>Select the correct posture for each scenario.</p>';
        feedbackContent.classList.remove('correct', 'incorrect');
    }
    
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeHandlingBtn');
    if (nextBtn) nextBtn.classList.add('hidden');
    if (completeBtn) completeBtn.classList.add('hidden');
    
    document.querySelectorAll('.posture-card').forEach(card => {
        card.classList.remove('selected', 'correct', 'incorrect');
    });
}

function showScenario(scenarioNum) {
    for (let i = 1; i <= 4; i++) {
        const scenario = document.getElementById(`scenario${i}`);
        if (scenario) {
            if (i === scenarioNum) {
                scenario.classList.remove('hidden');
            } else {
                scenario.classList.add('hidden');
            }
        }
    }
    
    const currentScenarioSpan = document.getElementById('currentScenario');
    if (currentScenarioSpan) {
        currentScenarioSpan.textContent = scenarioNum;
    }
    
    updateProgressBar();
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const percentage = (TrainingState.currentScenario / 4) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

function updateHandlingScore() {
    const scoreValue = document.getElementById('handlingScore');
    if (scoreValue) {
        scoreValue.textContent = TrainingState.handlingScore;
    }
}

function selectPosture(card, scenarioNum) {
    loadState();
    
    if (TrainingState.scenarioAnswered[scenarioNum - 1]) {
        return;
    }
    
    TrainingState.scenarioAnswered[scenarioNum - 1] = true;
    
    const isCorrect = card.dataset.correct === 'true';
    
    card.classList.add('selected');
    
    if (isCorrect) {
        card.classList.add('correct');
        TrainingState.handlingScore++;
    } else {
        card.classList.add('incorrect');
        const correctCard = document.querySelector(`#scenario${scenarioNum} .posture-card[data-correct="true"]`);
        if (correctCard) {
            correctCard.classList.add('correct');
        }
    }
    
    saveState();
    updateHandlingScore();
    
    const feedbackContent = document.getElementById('handlingFeedbackContent');
    if (feedbackContent) {
        const feedbackIndex = scenarioNum - 1;
        const feedbackText = isCorrect 
            ? HANDLING_FEEDBACK.correct[feedbackIndex]
            : HANDLING_FEEDBACK.incorrect[feedbackIndex];
        
        feedbackContent.innerHTML = `
            <span style="font-size: 1.5rem; color: ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
                ${isCorrect ? '&#10003;' : '&#10007;'}
            </span>
            <p>${feedbackText}</p>
        `;
        feedbackContent.classList.toggle('correct', isCorrect);
        feedbackContent.classList.toggle('incorrect', !isCorrect);
    }
    
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeHandlingBtn');
    
    if (scenarioNum < 4) {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (completeBtn) completeBtn.classList.add('hidden');
    } else {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (completeBtn) completeBtn.classList.remove('hidden');
    }
}

function nextScenario() {
    loadState();
    TrainingState.currentScenario++;
    saveState();
    
    showScenario(TrainingState.currentScenario);
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.classList.add('hidden');
    
    const feedbackContent = document.getElementById('handlingFeedbackContent');
    if (feedbackContent) {
        feedbackContent.innerHTML = '<p>Select the correct posture for this scenario.</p>';
        feedbackContent.classList.remove('correct', 'incorrect');
    }
}

function resetHandlingModule() {
    initHandlingModule();
}

function completeHandlingModule() {
    loadState();
    TrainingState.handlingCompleted = true;
    saveState();
    window.location.href = '/result';
}

function displayResults() {
    loadState();
    
    const hazardFinalScore = document.getElementById('hazardFinalScore');
    const handlingFinalScore = document.getElementById('handlingFinalScore');
    const totalScore = document.getElementById('totalScore');
    const hazardBar = document.getElementById('hazardBar');
    const handlingBar = document.getElementById('handlingBar');
    const hazardFeedback = document.getElementById('hazardFeedback');
    const handlingFeedback = document.getElementById('handlingFeedback');
    const performanceBadge = document.getElementById('performanceBadge');
    const resultSubtitle = document.getElementById('resultSubtitle');
    
    const hazardScoreValue = TrainingState.hazardCompleted ? TrainingState.hazardScore : 0;
    const handlingScoreValue = TrainingState.handlingCompleted ? TrainingState.handlingScore : 0;
    const total = hazardScoreValue + handlingScoreValue;
    
    if (hazardFinalScore) hazardFinalScore.textContent = hazardScoreValue;
    if (handlingFinalScore) handlingFinalScore.textContent = handlingScoreValue;
    if (totalScore) totalScore.textContent = total;
    
    setTimeout(() => {
        if (hazardBar) hazardBar.style.width = `${(hazardScoreValue / 5) * 100}%`;
        if (handlingBar) handlingBar.style.width = `${(handlingScoreValue / 4) * 100}%`;
    }, 100);
    
    if (hazardFeedback) {
        if (TrainingState.hazardCompleted) {
            if (hazardScoreValue === 5) {
                hazardFeedback.textContent = "Perfect! You found all hazards.";
            } else if (hazardScoreValue >= 3) {
                hazardFeedback.textContent = "Good job! You identified most hazards.";
            } else {
                hazardFeedback.textContent = "Keep practicing hazard spotting.";
            }
        } else {
            hazardFeedback.textContent = "Complete this module to see your score.";
        }
    }
    
    if (handlingFeedback) {
        if (TrainingState.handlingCompleted) {
            if (handlingScoreValue === 4) {
                handlingFeedback.textContent = "Excellent! Perfect technique!";
            } else if (handlingScoreValue >= 2) {
                handlingFeedback.textContent = "Good understanding of safe lifting.";
            } else {
                handlingFeedback.textContent = "Review proper lifting techniques.";
            }
        } else {
            handlingFeedback.textContent = "Complete this module to see your score.";
        }
    }
    
    if (performanceBadge) {
        const badgeText = performanceBadge.querySelector('.badge-text');
        performanceBadge.className = 'performance-badge';
        
        if (!TrainingState.hazardCompleted && !TrainingState.handlingCompleted) {
            performanceBadge.classList.add('incomplete');
            if (badgeText) badgeText.textContent = 'Training Not Started';
        } else if (!TrainingState.hazardCompleted || !TrainingState.handlingCompleted) {
            performanceBadge.classList.add('incomplete');
            if (badgeText) badgeText.textContent = 'Training Incomplete';
        } else if (total >= 8) {
            performanceBadge.classList.add('excellent');
            if (badgeText) badgeText.textContent = 'Excellent Performance!';
        } else if (total >= 5) {
            performanceBadge.classList.add('good');
            if (badgeText) badgeText.textContent = 'Good Progress';
        } else {
            performanceBadge.classList.add('needs-improvement');
            if (badgeText) badgeText.textContent = 'Needs Improvement';
        }
    }
    
    if (resultSubtitle) {
        if (!TrainingState.hazardCompleted && !TrainingState.handlingCompleted) {
            resultSubtitle.textContent = 'Complete the training modules to see your results';
        } else if (!TrainingState.hazardCompleted || !TrainingState.handlingCompleted) {
            resultSubtitle.textContent = 'Complete all modules for full results';
        } else {
            resultSubtitle.textContent = 'Great job completing your safety training!';
        }
    }
}

function resetAllProgress() {
    TrainingState.hazardScore = 0;
    TrainingState.hazardCompleted = false;
    TrainingState.hazardsFound = [];
    TrainingState.handlingScore = 0;
    TrainingState.handlingCompleted = false;
    TrainingState.currentScenario = 1;
    TrainingState.scenarioAnswered = [false, false, false, false];
    saveState();
}

document.addEventListener('DOMContentLoaded', function() {
    loadState();
});






document.addEventListener("DOMContentLoaded", () => {

  const scene = document.getElementById("scene360");
  const img = document.getElementById("sceneImage");

  if (!scene || !img) {
    console.error("scene360 or sceneImage missing");
    return;
  }

  const scenes = [
    "/public/images/warehouse1.png",
    "/public/images/warehouse2.png",
    "/public/images/warehouse3.png"
  ];

  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  /* Scene switch (GLOBAL for buttons) */
  window.loadScene = function (index) {
    if (!scenes[index]) return;
    img.src = scenes[index];
    currentX = 0;
    img.style.transform = "translateX(0px)";

    document.querySelectorAll(".hotspot").forEach(h => {
      h.style.display = "block";
      h.dataset.clicked = "false";
    });
  };

  /* Mouse */
  scene.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    scene.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    scene.style.cursor = "grab";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    startX = e.clientX;
    currentX += dx;

    img.style.transform = `translateX(${currentX}px)`;
  });

  /* Touch */
  scene.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
  });

  scene.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.touches[0].clientX - startX;
    startX = e.touches[0].clientX;
    currentX += dx;

    img.style.transform = `translateX(${currentX}px)`;
  }, { passive: false });

  scene.addEventListener("touchend", () => {
    isDragging = false;
  });

  /* Hotspots */
  document.querySelectorAll(".hotspot").forEach(h => {
    h.addEventListener("click", () => {

      if (h.dataset.clicked === "true") return;

      alert("Hazard identified: " + h.dataset.hazard);

      let score = Number(sessionStorage.getItem("score")) || 0;
      sessionStorage.setItem("score", score + 1);

      h.dataset.clicked = "true";
      h.style.display = "none";
    });
  });

});
