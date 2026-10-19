// PROTOCOLO SENTINEL - CTF SEGURIDAD INFORMÁTICA
// Autores: Ángel & Josué
// Evaluación: Previo 2

// Hashes SHA-256 de las soluciones válidas
const VALID_HASHES = {
  1: ["44298a92b897ce38aaa79c49c4995fb7f834da2f639cb7b59061632206ec7296"], // PREVIO2
  2: ["f702c2ea8122e9b588d2ecbeb313300a6153a21ad0f4bdc8a6acdd8e36a4b6cd"], // DEV_KEY_F12_2026
  3: [
    "83772f07995a63edcc7f4249002cc2326075638887b8c691f4515c430174efda", // EXIF_FORENSE_2026
    "8dec96896d893c7bfef3b467c2bd3d3464afce51b9c65b7aac3237361dc48f77"  // METADATA_NODE_77
  ],
  4: [
    "064866d6167ab12bacb2637bfe8c809372f3069fd075e1ccb3dd5425d364d137", // HACK
    "6a1e963371a64b32aff302ef7f3a7d6df8df903fce10f3db6ee918f18ac11f2a"  // FLAG
  ]
};

// Fallbacks directos para compatibilidad total
const DIRECT_ANSWERS = {
  1: ["PREVIO2"],
  2: ["DEV_KEY_F12_2026"],
  3: ["EXIF_FORENSE_2026", "METADATA_NODE_77"],
  4: ["HACK", "FLAG"]
};

// Estado de cada una de las 4 casillas
const challengeState = {
  1: false,
  2: false,
  3: false,
  4: false
};

// Utilidad para calcular hash SHA-256 en el navegador
async function sha256(message) {
  if (window.crypto && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn("crypto.subtle no disponible:", e);
    }
  }
  return null;
}

// Efectos de sonido con Web Audio API (nativo, sin archivos externos)
function playTone(freq, type = 'sine', duration = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Modo silencioso si el navegador bloquea audio antes de clic
  }
}

function playSuccessChime() {
  playTone(523.25, 'triangle', 0.1); // C5
  setTimeout(() => playTone(659.25, 'triangle', 0.1), 90); // E5
  setTimeout(() => playTone(783.99, 'triangle', 0.15), 180); // G5
  setTimeout(() => playTone(1046.50, 'triangle', 0.3), 270); // C6
}

function playErrorSound() {
  playTone(220, 'sawtooth', 0.12);
  setTimeout(() => playTone(180, 'sawtooth', 0.2), 100);
}

function playVictoryFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.50, 880, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 'sine', 0.28), idx * 130);
  });
}

// Lluvia de confeti
function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }
}

// Verificación de cada casilla
async function checkAnswer(challengeId) {
  const inputEl = document.getElementById(`input-reto-${challengeId}`);
  const statusEl = document.getElementById(`status-reto-${challengeId}`);
  const cardEl = document.getElementById(`card-reto-${challengeId}`);
  const buttonEl = document.getElementById(`btn-reto-${challengeId}`);
  
  if (!inputEl) return;
  
  const rawValue = inputEl.value.trim().toUpperCase();
  if (!rawValue) {
    showFeedback(challengeId, "Por favor introduce una respuesta.", "amber");
    return;
  }
  
  const computedHash = await sha256(rawValue);
  const isValid = (computedHash && VALID_HASHES[challengeId].includes(computedHash)) || 
                  DIRECT_ANSWERS[challengeId].includes(rawValue);
  
  if (isValid) {
    challengeState[challengeId] = true;
    playSuccessChime();
    
    // Marcar como completado
    cardEl.classList.add('completed');
    inputEl.disabled = true;
    inputEl.classList.remove('border-rose-500', 'border-slate-700');
    inputEl.classList.add('border-emerald-500', 'bg-emerald-950/30', 'text-emerald-400');
    
    buttonEl.disabled = true;
    buttonEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Correcto`;
    buttonEl.style.background = "#059669";
    buttonEl.style.cursor = "default";
    
    statusEl.innerHTML = `<span class="card-status-pill" style="border-color: rgba(16, 185, 129, 0.4); color: var(--neon-emerald); background: rgba(16, 185, 129, 0.1);">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--neon-emerald); display: inline-block;"></span> Desbloqueado
    </span>`;
    
    // Notificar al backend para registrar intento en Neon PostgreSQL
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId,
        answer: rawValue,
        teamName: 'Equipo Rival (3 Analistas)'
      })
    }).catch(e => console.log('Modo estático/local (sin backend activo)'));

    showFeedback(challengeId, "¡Correcto! Fase desbloqueada con éxito.", "emerald");
    updateMasterProgress();
  } else {
    playErrorSound();
    inputEl.style.borderColor = "var(--neon-rose)";
    
    // Registrar fallo en Neon
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId,
        answer: rawValue,
        teamName: 'Equipo Rival (3 Analistas)'
      })
    }).catch(e => console.log('Modo estático/local (sin backend activo)'));

    showFeedback(challengeId, "Clave incorrecta. Analiza las pistas con atención.", "rose");
  }
}

function showFeedback(id, text, color) {
  const feedbackEl = document.getElementById(`feedback-reto-${id}`);
  if (!feedbackEl) return;
  
  feedbackEl.className = `feedback-msg ${color}`;
  feedbackEl.textContent = text;
}

function updateMasterProgress() {
  const solvedCount = Object.values(challengeState).filter(Boolean).length;
  const progressPercent = (solvedCount / 4) * 100;
  
  const progressBar = document.getElementById('master-progress-bar');
  const progressText = document.getElementById('master-progress-text');
  const masterStatusBadge = document.getElementById('master-status-badge');
  
  if (progressBar) progressBar.style.width = `${progressPercent}%`;
  if (progressText) progressText.textContent = `${solvedCount}/4 Retos (${progressPercent}%)`;
  
  if (solvedCount === 4) {
    if (masterStatusBadge) {
      masterStatusBadge.className = "badge-locked";
      masterStatusBadge.style.background = "rgba(16, 185, 129, 0.2)";
      masterStatusBadge.style.color = "var(--neon-emerald)";
      masterStatusBadge.style.borderColor = "var(--neon-emerald)";
      masterStatusBadge.textContent = "SISTEMA RESTAURADO";
    }
    setTimeout(showVictoryModal, 600);
  }
}

function showVictoryModal() {
  playVictoryFanfare();
  launchConfetti();
  
  // Registrar victoria en Neon DB
  fetch('/api/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teamName: 'Equipo Rival (3 Analistas)',
      flag: 'FLAG{PREVIO2_F12_FORENSIC_HILL_SUCCESS}'
    })
  }).catch(e => console.log('Modo estático/local'));

  const modal = document.getElementById('victory-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeVictoryModal() {
  const modal = document.getElementById('victory-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function copyFlag() {
  const flagText = "FLAG{PREVIO2_F12_FORENSIC_HILL_SUCCESS}";
  navigator.clipboard.writeText(flagText).then(() => {
    const copyBtn = document.getElementById('copy-flag-btn');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "¡Copiado al portapapeles!";
      setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    }
  });
}

function openImageModal() {
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// Inicialización de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Pistas en consola para el Reto 2 (F12)
  console.log(
    "%c[PROTOCOLO SENTINEL - SEGURIDAD INFORMÁTICA]",
    "color: #10b981; font-size: 18px; font-weight: bold; background: #0f172a; padding: 8px 12px; border: 1px solid #10b981; border-radius: 4px;"
  );
  console.log(
    "%c¡Excelente iniciativa analizando la consola de desarrollador (F12)!",
    "color: #38bdf8; font-size: 13px; font-weight: bold;"
  );
  console.log(
    "%c>>> CLAVE DE LA CASILLA 2: %cDEV_KEY_F12_2026",
    "color: #94a3b8; font-size: 13px;",
    "color: #00ff66; font-size: 14px; font-weight: bold; background: #1e293b; padding: 2px 6px; border-radius: 3px;"
  );
  console.log(
    "%cAutores del Reto: Ángel & Josué | Evaluación: Previo 2",
    "color: #64748b; font-size: 11px; font-style: italic;"
  );

  // Permitir presionar 'Enter' en cada input
  [1, 2, 3, 4].forEach(id => {
    const input = document.getElementById(`input-reto-${id}`);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          checkAnswer(id);
        }
      });
    }
  });
});
