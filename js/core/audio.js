let audioCtx = null;
let musicGain = null;
let musicInterval = null;
let musicEnabled = true;

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.25;
  musicGain.connect(audioCtx.destination);
}

export function playSound(type) {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  switch (type) {
    case 'success':
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start();
      osc.stop(now + 0.3);
      break;
    case 'roundwin':
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.value = 660;
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc2.start();
      osc2.stop(now + 0.6);
      setTimeout(() => {
        const o = audioCtx.createOscillator();
        o.connect(audioCtx.destination);
        o.frequency.value = 880;
        o.start();
        o.stop(now + 0.9);
      }, 400);
      break;
    case 'victory':
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.frequency.value = 523 + i * 200;
          g.gain.setValueAtTime(0.15, audioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
          o.start();
          o.stop(audioCtx.currentTime + 0.4);
        }, i * 200);
      }
      break;
  }
}

function playAmbient() {
  if (!musicEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(musicGain);
  osc.type = 'sine';
  osc.frequency.value = 80 + Math.sin(now) * 8;
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
  osc.start();
  osc.stop(now + 3);
}

export function startBackgroundMusic() {
  if (musicInterval) clearInterval(musicInterval);
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  playAmbient();
  musicInterval = setInterval(() => {
    if (musicEnabled) playAmbient();
  }, 3500);
}

export function stopBackgroundMusic() {
  if (musicInterval) clearInterval(musicInterval);
  musicInterval = null;
}

export function toggleMusic() {
  musicEnabled = !musicEnabled;
  const btn = document.getElementById('musicToggle');
  if (musicEnabled) {
    startBackgroundMusic();
    btn.innerHTML = "🎵 Musique ON";
  } else {
    stopBackgroundMusic();
    btn.innerHTML = "🔇 Musique OFF";
  }
}

// Pour que la musique démarre au premier clic (politique navigateur)
export function enableAudioOnFirstClick() {
  document.body.addEventListener('click', () => {
    if (!audioCtx) {
      initAudio();
      startBackgroundMusic();
    }
  }, { once: true });
}
