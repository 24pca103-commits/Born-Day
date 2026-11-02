// --- Web Audio API Synthesizer (Zero external audio dependency for reliable playback) ---
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.isPlayingMelody = false;
    this.melodyTimeouts = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  }

  playPop() {
    this.playTone(520, 'triangle', 0.15, 0.2);
  }

  playBubblePop() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playHeartTwinkle() {
    if (this.muted) return;
    const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, 0.08);
      }, idx * 70);
    });
  }

  playPaperPlaneWhoosh() {
    if (this.muted) return;
    this.init();
    try {
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.35);
      filter.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 0.7);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.35);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playChibiDanceBeat() {
    if (this.muted) return;
    const danceNotes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1174.66, 1318.5];
    danceNotes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.12, 0.16), i * 110);
    });
  }

  playChibiBubbleGroove() {
    if (this.muted) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((n, i) => {
      setTimeout(() => {
        this.playTone(n, 'sine', 0.22, 0.14);
        if (i % 2 === 0) this.playBubblePop();
      }, i * 140);
    });
  }

  playChibiRockRiff() {
    if (this.muted) return;
    const powerChords = [
      [220, 330],
      [261.63, 392],
      [293.66, 440],
      [349.23, 523.25]
    ];
    powerChords.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach(freq => this.playTone(freq, 'sawtooth', 0.25, 0.12));
      }, i * 160);
    });
  }

  playChibiHeartSong() {
    if (this.muted) return;
    const melody = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.45, 0.12), i * 180);
    });
  }

  playChibiLoFiBeat() {
    if (this.muted) return;
    const lofiChords = [
      [329.63, 392, 493.88], // Em
      [349.23, 440, 523.25], // F
      [392, 493.88, 587.33]  // G
    ];
    lofiChords.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach(freq => this.playTone(freq, 'triangle', 0.35, 0.1));
      }, i * 260);
    });
  }

  playChibiSwagBeat() {
    if (this.muted) return;
    // Funky bass walk
    const bass = [110, 130.81, 146.83, 164.81, 220];
    bass.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.15, 0.14), i * 120);
    });
    setTimeout(() => this.playCheerChime(), 600);
  }

  playCheerChime() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.4, 0.12);
      }, idx * 100);
    });
  }

  playBlowSound() {
    if (this.muted) return;
    this.init();
    try {
      // Noise buffer for gentle wind / blow
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  stopBirthdayMelody() {
    this.melodyTimeouts.forEach(t => clearTimeout(t));
    this.melodyTimeouts = [];
    this.isPlayingMelody = false;
  }

  playBirthdayMelody(loop = true) {
    if (this.muted) return;
    this.stopBirthdayMelody();
    this.init();
    this.isPlayingMelody = true;
    // Notes of "Happy Birthday To You":
    // G4, G4, A4, G4, C5, B4
    const melody = [
      { note: 392.00, dur: 0.28, delay: 0 },
      { note: 392.00, dur: 0.28, delay: 300 },
      { note: 440.00, dur: 0.5, delay: 600 },
      { note: 392.00, dur: 0.5, delay: 1150 },
      { note: 523.25, dur: 0.5, delay: 1700 },
      { note: 493.88, dur: 0.9, delay: 2250 },

      // G4, G4, A4, G4, D5, C5
      { note: 392.00, dur: 0.28, delay: 3200 },
      { note: 392.00, dur: 0.28, delay: 3500 },
      { note: 440.00, dur: 0.5, delay: 3800 },
      { note: 392.00, dur: 0.5, delay: 4350 },
      { note: 587.33, dur: 0.5, delay: 4900 },
      { note: 523.25, dur: 0.9, delay: 5450 },

      // G4, G4, G5, E5, C5, B4, A4
      { note: 392.00, dur: 0.28, delay: 6400 },
      { note: 392.00, dur: 0.28, delay: 6700 },
      { note: 783.99, dur: 0.55, delay: 7000 },
      { note: 659.25, dur: 0.55, delay: 7600 },
      { note: 523.25, dur: 0.5, delay: 8200 },
      { note: 493.88, dur: 0.5, delay: 8750 },
      { note: 440.00, dur: 0.8, delay: 9300 },

      // F5, F5, E5, C5, D5, C5
      { note: 698.46, dur: 0.28, delay: 10200 },
      { note: 698.46, dur: 0.28, delay: 10500 },
      { note: 659.25, dur: 0.55, delay: 10800 },
      { note: 523.25, dur: 0.55, delay: 11400 },
      { note: 587.33, dur: 0.55, delay: 12000 },
      { note: 523.25, dur: 1.1, delay: 12600 }
    ];

    melody.forEach(item => {
      const t = setTimeout(() => {
        if (!this.muted && this.isPlayingMelody) {
          this.playTone(item.note, 'triangle', item.dur, 0.14);
        }
      }, item.delay);
      this.melodyTimeouts.push(t);
    });

    if (loop) {
      const loopTimeout = setTimeout(() => {
        if (!this.muted && this.isPlayingMelody) {
          this.playBirthdayMelody(true);
        }
      }, 14000);
      this.melodyTimeouts.push(loopTimeout);
    }
  }

  playKnifeSlice() {
    if (this.muted) return;
    this.init();
    try {
      // Swish / slice whoosh sound
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();

      // Sharp metallic ding / slice shimmer
      setTimeout(() => {
        this.playTone(1800, 'triangle', 0.18, 0.12);
        this.playTone(2400, 'sine', 0.22, 0.08);
      }, 70);
    } catch (e) {}
  }
}

const sounds = new SoundSystem();

// --- Background Twinkling Stars Animation ---
function initStars() {
  const canvas = document.getElementById('canvas-stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = 85;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      star.alpha += star.speed * star.direction;
      if (star.alpha >= 1) {
        star.alpha = 1;
        star.direction = -1;
      } else if (star.alpha <= 0.1) {
        star.alpha = 0.1;
        star.direction = 1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#818cf8';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

// --- Confetti Helper with Canvas-Confetti or CSS Fallback ---
function triggerConfetti(particleCount = 70, spread = 65, origin = { y: 0.6 }) {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: particleCount,
      spread: spread,
      origin: origin,
      colors: ['#6366f1', '#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#ffffff']
    });
  }
}

function fullGrandCelebration() {
  sounds.playCheerChime();

  if (typeof confetti === 'function') {
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#6366f1', '#f59e0b', '#06b6d4', '#f43f5e'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}

// --- Countdown Timer to November 4 ---
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-mins');
  const secondsEl = document.getElementById('count-secs');
  const celebrationNotice = document.getElementById('celebration-notice');

  function update() {
    const now = new Date();
    let currentYear = now.getFullYear();
    let target = new Date(currentYear, 10, 4, 0, 0, 0); // Month is 0-indexed (10 = November)

    // If Nov 4 of this year has passed completely by more than 2 days, count down to next year
    if (now.getTime() > target.getTime() + 24 * 60 * 60 * 1000 * 2) {
      target = new Date(currentYear + 1, 10, 4, 0, 0, 0);
    }

    const diff = target - now;

    // Is it November 4 today?
    const isToday = now.getMonth() === 10 && now.getDate() === 4;

    if (isToday) {
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minutesEl) minutesEl.innerText = "00";
      if (secondsEl) secondsEl.innerText = "00";
      if (celebrationNotice) {
        celebrationNotice.innerText = "🎉 IT IS TODAY! HAPPY BIRTHDAY SEILESH SIR! 👑";
        celebrationNotice.classList.add('gold-text');
      }
      return;
    }

    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
      if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
      if (minutesEl) minutesEl.innerText = String(m).padStart(2, '0');
      if (secondsEl) secondsEl.innerText = String(s).padStart(2, '0');
    }
  }

  update();
  setInterval(update, 1000);
}

// --- Interactive Cake & Candles Logic ---
function initCakeCeremony() {
  const blowBtn = document.getElementById('btn-blow-candles');
  const cutBtn = document.getElementById('btn-cut-cake');
  const resetBtn = document.getElementById('btn-relight');
  const flames = document.querySelectorAll('.flame');
  const smokes = document.querySelectorAll('.smoke');
  const statusEl = document.getElementById('cake-status');
  const cakeContainer = document.getElementById('cake-interactive-container');
  const knifeEl = document.getElementById('celebration-knife');

  if (!blowBtn) return;

  blowBtn.addEventListener('click', () => {
    sounds.playBlowSound();
    flames.forEach(f => f.classList.add('extinguished'));
    smokes.forEach(s => s.classList.add('active'));

    setTimeout(() => {
      triggerConfetti(90, 80);
      sounds.playCheerChime();
      if (statusEl) {
        statusEl.innerHTML = "✨ <strong>Candles blown!</strong> May your vision continue illuminating Ixly Technologies!";
      }
      blowBtn.style.display = 'none';
      if (cutBtn) cutBtn.style.display = 'inline-flex';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    }, 400);
  });

  if (cutBtn) {
    cutBtn.addEventListener('click', () => {
      // 1. Play realistic knife slicing sound
      sounds.playKnifeSlice();

      // 2. Trigger knife slice downward animation
      if (knifeEl) {
        knifeEl.classList.remove('slicing');
        void knifeEl.offsetWidth; // trigger reflow
        knifeEl.classList.add('slicing');
      }

      // 3. At apex of knife cut, physically separate cake halves & serve delicious slice
      setTimeout(() => {
        if (cakeContainer) {
          cakeContainer.classList.add('is-cut');
        }
        sounds.playCheerChime();
        triggerConfetti(140, 100);

        if (statusEl) {
          statusEl.innerHTML = "🍰 <strong>Freshly cut for Seilesh Sir!</strong> The sweetest slice has been served! Wishing our visionary CEO boundless joy, stellar health, and unprecedented success!";
        }

        fullGrandCelebration();
      }, 380);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      flames.forEach(f => f.classList.remove('extinguished'));
      smokes.forEach(s => s.classList.remove('active'));
      if (cakeContainer) cakeContainer.classList.remove('is-cut');
      if (knifeEl) knifeEl.classList.remove('slicing');
      blowBtn.style.display = 'inline-flex';
      if (cutBtn) cutBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      if (statusEl) {
        statusEl.innerHTML = "🕯️ <strong>Candles are lit!</strong> Make a wish and click Blow Candles!";
      }
    });
  }
}

// --- Floating Cheer Emoji Blaster ---
let cheerCount = 384; // Initial cheer base

function initCheerBlaster() {
  const cheerBtn = document.getElementById('cheer-button');
  const countEl = document.getElementById('cheer-count');

  if (!cheerBtn) return;

  const emojis = ['❤️', '👑', '🎉', '🚀', '🔥', '👏', '🎂', '⭐'];

  cheerBtn.addEventListener('click', (e) => {
    sounds.playPop();
    cheerCount++;
    if (countEl) countEl.innerText = cheerCount;

    // Spawn floating emoji
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const floater = document.createElement('div');
    floater.className = 'floating-heart';
    floater.innerText = emoji;

    // Calculate position
    const rect = cheerBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
    const y = rect.top - 10;

    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    document.body.appendChild(floater);

    setTimeout(() => {
      floater.remove();
    }, 1600);

    // Occasional confetti
    if (cheerCount % 5 === 0) {
      triggerConfetti(25, 45, { y: 0.9, x: 0.85 });
    }
  });
}

// --- Team Wishes Data & Board (Tailored to Ixly: Developer, Manager, HR, Client Teams) ---
// Default mock wishes cleared per user request so team members can post real wishes directly!
const defaultWishes = [];

function initWishesBoard() {
  const grid = document.getElementById('wishes-container');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const form = document.getElementById('wish-form');
  const emojiBtns = document.querySelectorAll('.emoji-opt');
  const selectedEmojiInput = document.getElementById('selected-emoji');

  // Modal dialog elements
  const wishModal = document.getElementById('wish-modal');
  const openModalBtn = document.getElementById('btn-open-wish-modal');
  const openModalHeroBtn = document.getElementById('btn-open-wish-modal-hero');
  const closeModalBtn = document.getElementById('modal-close-btn');

  // --- Shared Backend Wishes System ---
  let storedWishes = JSON.parse(localStorage.getItem('ixly_ceo_wishes_v5')) || [];

  // Function to sync wishes from central server so EVERY phone & laptop sees them in real-time
  async function fetchSharedWishes() {
    try {
      const res = await fetch('/api/wishes', { cache: 'no-store' });
      if (res.ok) {
        const remoteWishes = await res.json();
        if (Array.isArray(remoteWishes)) {
          // If server is empty but local has wishes, upload local wishes to server
          if (remoteWishes.length === 0 && storedWishes.length > 0) {
            for (const localWish of storedWishes) {
              await fetch('/api/wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localWish)
              }).catch(() => {});
            }
          } else {
            storedWishes = remoteWishes;
            localStorage.setItem('ixly_ceo_wishes_v5', JSON.stringify(storedWishes));
            render(currentFilter);
          }
        }
      }
    } catch (e) {
      // Fallback gracefully to offline localStorage
    }
  }

  // Initial fetch and automatic background sync every 4 seconds
  fetchSharedWishes();
  setInterval(fetchSharedWishes, 4000);

  let currentFilter = 'all';

  // Update count badges on the filter pills
  function updateFilterPillCounts() {
    const counts = {
      all: storedWishes.length,
      dev: storedWishes.filter(w => w.department === 'dev').length,
      manager: storedWishes.filter(w => w.department === 'manager').length,
      hr: storedWishes.filter(w => w.department === 'hr').length,
      client: storedWishes.filter(w => w.department === 'client').length
    };

    filterBtns.forEach(btn => {
      const f = btn.getAttribute('data-filter');
      const baseLabel = {
        all: 'All Wishes',
        dev: 'Developer Team 💻',
        manager: 'Manager Team 📊',
        hr: 'HR Team 🤝',
        client: 'Client Team 🌐'
      }[f] || f;
      
      const count = counts[f] || 0;
      btn.innerHTML = `${baseLabel} ${count > 0 ? `<span class="filter-count-badge">${count}</span>` : ''}`;
    });
  }

  // --- Modal Open & Close Logic ---
  function openWishModal() {
    if (!wishModal) return;
    wishModal.style.display = 'flex';
    requestAnimationFrame(() => {
      wishModal.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    const firstInput = document.getElementById('wish-name');
    if (firstInput) setTimeout(() => firstInput.focus(), 120);
  }

  function closeWishModal() {
    if (!wishModal) return;
    wishModal.classList.remove('open');
    setTimeout(() => {
      wishModal.style.display = 'none';
    }, 280);
    document.body.style.overflow = '';
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openWishModal);
  if (openModalHeroBtn) openModalHeroBtn.addEventListener('click', openWishModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeWishModal);

  if (wishModal) {
    wishModal.addEventListener('click', (e) => {
      if (e.target === wishModal) {
        closeWishModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wishModal && wishModal.classList.contains('open')) {
      closeWishModal();
    }
  });

  // --- Render Wishes Grid & Empty State ---
  function render(filter = 'all') {
    if (!grid) return;
    grid.innerHTML = '';
    updateFilterPillCounts();

    const list = filter === 'all' 
      ? storedWishes 
      : storedWishes.filter(w => w.department === filter);

    if (list.length === 0) {
      const deptNames = {
        all: "the Ixly Technologies family",
        dev: "Developer Team 💻",
        manager: "Manager Team 📊",
        hr: "HR Team 🤝",
        client: "Client Team 🌐"
      };
      const deptLabel = deptNames[filter] || "Ixly Technologies";

      grid.innerHTML = `
        <div class="wishes-empty-box glass-card" style="grid-column: 1 / -1;">
          <span class="empty-icon">💌</span>
          <h3>No Wishes Posted Yet for ${deptLabel}</h3>
          <p>Be the very first from the Ixly Technologies family to send your birthday blessing to Seilesh Sir!</p>
          <button type="button" class="btn-gold" id="btn-empty-add-wish" style="margin-top: 1.25rem;">
            <span>✍️</span> Drop The First Wish
          </button>
        </div>
      `;

      const emptyAddBtn = document.getElementById('btn-empty-add-wish');
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', openWishModal);
      }
      return;
    }

    list.forEach(w => {
      const card = document.createElement('div');
      card.className = 'wish-card glass-card';
      card.innerHTML = `
        <div>
          <div class="wish-header">
            <div class="wish-avatar" style="background: ${w.avatarBg}">
              ${w.initials || w.name.slice(0, 2).toUpperCase()}
            </div>
            <div class="wish-sender-info">
              <h4>${escapeHTML(w.name)}</h4>
              <span>${escapeHTML(w.role || 'Ixly Team Member')}</span>
            </div>
            <button type="button" class="btn-delete-wish" data-id="${w.id}" title="Remove this wish" aria-label="Remove this wish">
              🗑️
            </button>
          </div>
          <div class="wish-body">
            "${escapeHTML(w.message)}"
          </div>
        </div>
        <div class="wish-footer">
          <span>${w.emoji || '🎉'} ${escapeHTML(w.badge || 'Ixly Technologies')}</span>
          <button class="like-btn" data-id="${w.id}">
            <span>❤️</span>
            <span class="like-count">${w.likes || 0}</span>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Attach delete wish events
    grid.querySelectorAll('.btn-delete-wish').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(delBtn.getAttribute('data-id'), 10);
        const wishToDelete = storedWishes.find(item => item.id === id);
        const namePreview = wishToDelete ? `from "${wishToDelete.name}"` : '';

        if (confirm(`Remove this birthday wish ${namePreview}?`)) {
          storedWishes = storedWishes.filter(item => item.id !== id);
          localStorage.setItem('ixly_ceo_wishes_v5', JSON.stringify(storedWishes));
          sounds.playPop();
          render(currentFilter);
          showToast("🗑️ Wish removed successfully!");

          // Delete from shared server database
          fetch(`/api/wishes/${id}`, { method: 'DELETE' }).catch(() => {
            fetch('/api/wishes/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id })
            }).catch(e => console.log('Delete sync error:', e));
          });
        }
      });
    });

    // Attach like events
    grid.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        const id = parseInt(btn.getAttribute('data-id'));
        const targetWish = storedWishes.find(item => item.id === id);
        if (targetWish) {
          const isLiking = !btn.classList.contains('liked');
          if (isLiking) {
            targetWish.likes++;
            btn.classList.add('liked');
          } else {
            targetWish.likes--;
            btn.classList.remove('liked');
          }
          btn.querySelector('.like-count').innerText = targetWish.likes;
          localStorage.setItem('ixly_ceo_wishes_v5', JSON.stringify(storedWishes));

          // Sync like count with server
          fetch('/api/wishes/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, liked: isLiking })
          }).catch(e => console.log('Like sync error:', e));
        }
      });
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      render(currentFilter);
    });
  });

  // Emoji selection in form
  emojiBtns.forEach(opt => {
    opt.addEventListener('click', () => {
      emojiBtns.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      if (selectedEmojiInput) {
        selectedEmojiInput.value = opt.getAttribute('data-emoji');
      }
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wish-name').value.trim();
      const role = document.getElementById('wish-role').value.trim();
      const department = document.getElementById('wish-dept').value;
      const message = document.getElementById('wish-text').value.trim();
      const emoji = selectedEmojiInput ? selectedEmojiInput.value : '🎂';

      if (!name || !message) return;

      const randomGradients = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #10b981, #06b6d4)',
        'linear-gradient(135deg, #ec4899, #a855f7)'
      ];

      const deptBadges = {
        dev: '💻 Developer Team',
        manager: '📊 Manager Team',
        hr: '🤝 HR Team',
        client: '🌐 Client Team'
      };

      const newWish = {
        id: Date.now(),
        name: name,
        role: role || 'Ixly Team Member',
        department: department,
        avatarBg: randomGradients[Math.floor(Math.random() * randomGradients.length)],
        initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        badge: deptBadges[department] || '✨ Ixly Family',
        emoji: emoji,
        message: message,
        likes: 1
      };

      storedWishes.unshift(newWish);
      localStorage.setItem('ixly_ceo_wishes_v5', JSON.stringify(storedWishes));

      // Reset to "All Wishes" tab so the new wish is immediately visible to everyone
      currentFilter = 'all';
      filterBtns.forEach(b => {
        if (b.getAttribute('data-filter') === 'all') b.classList.add('active');
        else b.classList.remove('active');
      });
      render('all');

      // Post to shared server so EVERY phone and laptop sees this wish
      fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWish)
      }).then(() => {
        fetchSharedWishes();
      }).catch(err => {
        console.error('Failed to post wish to server:', err);
      });

      form.reset();
      closeWishModal();
      triggerConfetti(70, 70);
      sounds.playCheerChime();

      // Notification toast
      showToast("✨ Your birthday wish has been posted for Seilesh Sir!");
    });
  }

  render();
}

function showToast(msg) {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '85px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.border = '1px solid #6366f1';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '9999px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '600';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.style.opacity = '1';
  toast.style.pointerEvents = 'auto';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
  }, 3500);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- Jolly Soap Bubbles System ---
let bubblesPoppedCount = 0;

function createSingleBubble() {
  const container = document.getElementById('bubble-container');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'soap-bubble';

  const size = Math.floor(Math.random() * 40) + 40; // 40px to 80px
  const startLeft = Math.random() * (window.innerWidth - size);
  const duration = Math.random() * 6 + 9; // 9s to 15s

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${startLeft}px`;
  bubble.style.animationDuration = `${duration}s`;

  // Random cute inner floating icon (hearts, sparkles, stars)
  const innerIcons = ['❤️', '💖', '✨', '⭐', '🎈', '🫰'];
  const icon = innerIcons[Math.floor(Math.random() * innerIcons.length)];

  bubble.innerHTML = `<span class="bubble-inner-heart">${icon}</span>`;

  // Click or touch to pop
  const popBubble = (e) => {
    e.stopPropagation();
    sounds.playBubblePop();
    bubblesPoppedCount++;

    // Create pop sparkle particles
    const rect = bubble.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 6; i++) {
      const part = document.createElement('div');
      part.className = 'bubble-pop-particle';
      part.innerText = icon;
      part.style.left = `${cx}px`;
      part.style.top = `${cy}px`;

      const angle = (Math.PI * 2 / 6) * i;
      const dist = 35 + Math.random() * 30;
      part.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      part.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

      document.body.appendChild(part);
      setTimeout(() => part.remove(), 800);
    }

    bubble.remove();

    if (bubblesPoppedCount === 10) {
      showToast("🫧 10 Bubbles Popped! Chief Seilesh Kumaar sends a huge smile! 😊");
    } else if (bubblesPoppedCount === 25) {
      showToast("👑 25 Bubbles Popped! You unlocked the Master Celebrator badge!");
      triggerConfetti(60, 70);
    }
  };

  bubble.addEventListener('click', popBubble);
  bubble.addEventListener('mouseenter', (e) => {
    // 35% chance to pop on hover for playful feel
    if (Math.random() > 0.4) {
      popBubble(e);
    }
  });

  container.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentElement) bubble.remove();
  }, duration * 1000);
}

function initSoapBubbles() {
  let container = document.getElementById('bubble-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'bubble-container';
    container.className = 'bubble-container';
    document.body.appendChild(container);
  }

  // Initial batch
  for (let i = 0; i < 6; i++) {
    setTimeout(createSingleBubble, i * 600);
  }

  // Periodic creation
  setInterval(() => {
    if (document.hidden) return;
    createSingleBubble();
  }, 2200);
}

// --- Flying Magic Paper Airplane ---
function launchMagicPlane(bannerText = "Happy Birthday Seilesh Sir! 🚀") {
  sounds.playPaperPlaneWhoosh();
  let plane = document.getElementById('magic-plane');
  if (!plane) {
    plane = document.createElement('div');
    plane.id = 'magic-plane';
    plane.className = 'magic-paper-plane';
    document.body.appendChild(plane);
  }

  plane.innerHTML = `
    <span class="plane-body">✈️</span>
    <span class="plane-banner">${escapeHTML(bannerText)}</span>
  `;

  plane.classList.remove('active');
  void plane.offsetWidth; // Trigger reflow
  plane.classList.add('active');

  setTimeout(() => {
    plane.classList.remove('active');
  }, 9800);
}

// --- 3D Interactive Portrait Tilt ---
function initPortrait3DTilt() {
  const wrapper = document.querySelector('.jolly-portrait-wrapper');
  const card = document.querySelector('.jolly-portrait-card');
  if (!wrapper || !card) return;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / (rect.height / 2)) * 12;
    const rotY = (x / (rect.width / 2)) * 12;

    card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.03)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

// --- Interactive Jolly Vibe Actions ---
function initVibeActions() {
  const btns = document.querySelectorAll('.vibe-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.init();
      const action = btn.getAttribute('data-action');

      if (action === 'plane') {
        launchMagicPlane("Magic Flight with Seilesh Sir! ✈️");
        showToast("✈️ Paper airplane taking flight with Chief!");
      } else if (action === 'heart') {
        sounds.playHeartTwinkle();
        spawnHeartExplosion();
        showToast("💖 Sending heart hugs to our CEO!");
      } else if (action === 'bubbles') {
        sounds.playBubblePop();
        for (let i = 0; i < 10; i++) {
          setTimeout(createSingleBubble, i * 150);
        }
        showToast("🫧 Rainbow soap bubbles flurry!");
      } else if (action === 'dream') {
        sounds.playCheerChime();
        triggerConfetti(80, 80);
        showToast("🌟 Dream Big & Reach New Heights with Ixly!");
      } else if (action === 'finger-heart') {
        sounds.playHeartTwinkle();
        spawnEmojiShower('🫰');
        showToast("🫰 Sending finger-hearts from Ixly Team!");
      } else if (action === 'swag') {
        sounds.playPop();
        launchMagicPlane("Boss Mode Activated! 🕶️🔥");
        spawnEmojiShower('🕶️');
        showToast("🕶️ Swag Boss Mode: 100% Cool!");
      }
    });
  });
}

function spawnHeartExplosion() {
  const count = 30;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.innerText = Math.random() > 0.5 ? '💖' : '❤️';
      heart.style.left = `${Math.random() * (window.innerWidth - 60) + 30}px`;
      heart.style.top = `${window.innerHeight - 50}px`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1600);
    }, i * 40);
  }
}

function spawnEmojiShower(emojiChar) {
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const floater = document.createElement('div');
      floater.className = 'floating-heart';
      floater.innerText = emojiChar;
      floater.style.left = `${Math.random() * (window.innerWidth - 60) + 30}px`;
      floater.style.top = `${window.innerHeight - 50}px`;
      document.body.appendChild(floater);
      setTimeout(() => floater.remove(), 1600);
    }, i * 60);
  }
}

// --- Interactive Chibi Squad Canvas Cropper & Action Handler ---
const chibiConfigs = [
  {
    id: 1,
    name: "The Dream Dancer",
    role: "Joyful Victory & Jump Dance",
    badge: "🕺 Dance Move",
    badgeColor: "#fbbf24",
    crop: { sx: 90, sy: 25, sw: 225, sh: 245 },
    animClass: "anim-dance-jump",
    sound: () => sounds.playChibiDanceBeat(),
    icon: "🕺",
    toast: "🕺 Dream Dancer Chibi is jumping with celebration energy!"
  },
  {
    id: 2,
    name: "The Smile Groover",
    role: "Bubble Floater & K-Heart Wave",
    badge: "🫰 Finger-Heart",
    badgeColor: "#06b6d4",
    crop: { sx: 485, sy: 20, sw: 240, sh: 275 },
    animClass: "anim-bubble-sway",
    sound: () => sounds.playChibiBubbleGroove(),
    icon: "🫰",
    toast: "🫧 Smile Groover Chibi sends glowing finger hearts!"
  },
  {
    id: 3,
    name: "The Action Rockstar",
    role: "Confident Point & Electric Power Riff",
    badge: "🎸 Hero Action",
    badgeColor: "#a855f7",
    crop: { sx: 45, sy: 335, sw: 235, sh: 255 },
    animClass: "anim-rock-action",
    sound: () => sounds.playChibiRockRiff(),
    icon: "🎸",
    toast: "🎸 Action Rockstar Chibi strikes the power pose!"
  },
  {
    id: 4,
    name: "The Heart Hugger",
    role: "Empathic Love & Pulsing Heartbeat",
    badge: "💖 Warm Hug",
    badgeColor: "#ec4899",
    crop: { sx: 500, sy: 355, sw: 240, sh: 260 },
    animClass: "anim-heart-hug",
    sound: () => sounds.playChibiHeartSong(),
    icon: "💖",
    toast: "💖 Heart Hugger Chibi wraps the entire team in warmth!"
  },
  {
    id: 5,
    name: "The Lo-Fi Thinker",
    role: "Smart Idea Sparks & Head-Nod Beat",
    badge: "💡 Brainstorm",
    badgeColor: "#10b981",
    crop: { sx: 125, sy: 690, sw: 245, sh: 265 },
    animClass: "anim-lofi-chill",
    sound: () => sounds.playChibiLoFiBeat(),
    icon: "💡",
    toast: "💡 Lo-Fi Thinker Chibi is coding the next big thing!"
  },
  {
    id: 6,
    name: "The Swag Aviator DJ",
    role: "Cool Sunglasses & Paper Plane Loop",
    badge: "✈️ Swag Flight",
    badgeColor: "#f59e0b",
    crop: { sx: 470, sy: 660, sw: 260, sh: 280 },
    animClass: "anim-swag-flight",
    sound: () => sounds.playChibiSwagBeat(),
    icon: "🕶️",
    toast: "✈️ Swag Aviator Chibi loops the paper airplane!"
  }
];

function initChibiSquad() {
  const masterImage = new Image();
  masterImage.src = 'assets/ceo_jolly.jpg';

  masterImage.onload = () => {
    chibiConfigs.forEach(conf => {
      const canvas = document.getElementById(`chibi-canvas-${conf.id}`);
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = 240;
      canvas.height = 240;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Circular clipping mask so NO outer rectangle cut edges ever show
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Draw only the focused Chibi
      ctx.drawImage(
        masterImage,
        conf.crop.sx, conf.crop.sy, conf.crop.sw, conf.crop.sh,
        0, 0, canvas.width, canvas.height
      );

      // 3. Smooth radial edge feathering/vignette to ensure soft blending
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.36,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.72, 'rgba(12, 16, 32, 0.2)');
      vignette.addColorStop(1, 'rgba(10, 14, 28, 0.95)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

      // 4. Clean glowing perimeter ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, Math.PI * 2);
      ctx.strokeStyle = conf.badgeColor || '#fbbf24';
      ctx.lineWidth = 4;
      ctx.shadowColor = conf.badgeColor || '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    });
  };

  // Attach individual Chibi triggers
  chibiConfigs.forEach(conf => {
    const card = document.getElementById(`chibi-card-${conf.id}`);
    const btn = document.getElementById(`btn-chibi-${conf.id}`);
    const canvas = document.getElementById(`chibi-canvas-${conf.id}`);

    const triggerAction = () => {
      sounds.init();
      conf.sound();

      // Remove existing animation and re-add
      if (canvas) {
        canvas.classList.remove(conf.animClass);
        void canvas.offsetWidth;
        canvas.classList.add(conf.animClass);
      }

      if (card) {
        card.classList.add('active');
        spawnNoteParticles(card);
      }

      setTimeout(() => {
        if (!isSquadPartyActive && card) {
          card.classList.remove('active');
        }
      }, 4000);
    };

    if (btn) btn.addEventListener('click', triggerAction);
    if (card) {
      card.addEventListener('click', (e) => {
        if (e.target !== btn && !btn?.contains(e.target)) {
          triggerAction();
        }
      });
    }
  });

  // Squad Dance Party Master Button
  const partyAllBtn = document.getElementById('btn-squad-party');
  if (partyAllBtn) {
    partyAllBtn.addEventListener('click', () => {
      triggerAllSquadParty();
    });
  }
}

let isSquadPartyActive = false;

function triggerAllSquadParty() {
  isSquadPartyActive = true;
  sounds.init();
  fullGrandCelebration();

  // Activate all 6 chibis simultaneously
  chibiConfigs.forEach((conf, idx) => {
    const canvas = document.getElementById(`chibi-canvas-${conf.id}`);
    const card = document.getElementById(`chibi-card-${conf.id}`);

    if (canvas) {
      canvas.classList.remove(conf.animClass);
      void canvas.offsetWidth;
      canvas.classList.add(conf.animClass);
    }

    if (card) {
      card.classList.add('active');
      setTimeout(() => spawnNoteParticles(card), idx * 300);
    }
  });

  // Launch paper plane with squad banner
  launchMagicPlane("🚀 SQUAD PARTY IN FULL EFFECT! 👑");

  setTimeout(() => {
    isSquadPartyActive = false;
  }, 12000);
}

function spawnNoteParticles(parentElement) {
  const notes = ['🎵', '🎶', '✨', '⭐', '💖', '🔥'];
  const rect = parentElement.getBoundingClientRect();

  for (let i = 0; i < 5; i++) {
    const note = document.createElement('div');
    note.className = 'music-note-particle';
    note.innerText = notes[Math.floor(Math.random() * notes.length)];

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + 60;

    note.style.left = `${cx}px`;
    note.style.top = `${cy}px`;

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 50;
    note.style.setProperty('--nx', `${Math.cos(angle) * dist}px`);
    note.style.setProperty('--ny', `${Math.sin(angle) * dist - 30}px`);

    document.body.appendChild(note);
    setTimeout(() => note.remove(), 1200);
  }
}

// --- True Automatic Background Music Controller (Zero Buttons, Zero Prompts) ---
function initMusicAutoplay() {
  const bgMusic = document.getElementById('bg-music') || new Audio('assets/bg_music.mp3');
  bgMusic.src = 'assets/bg_music.mp3';
  bgMusic.loop = true;
  bgMusic.volume = 0.95;
  bgMusic.setAttribute('playsinline', '');
  bgMusic.setAttribute('autoplay', '');

  let hasStarted = false;

  const startAudioPlayback = () => {
    if (hasStarted && !bgMusic.paused) return;

    sounds.init();
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        hasStarted = true;
        bgMusic.muted = false;
      }).catch(() => {
        // If browser blocks unmuted sound before any touch, start muted first so it is already running
        bgMusic.muted = true;
        bgMusic.play().then(() => {
          hasStarted = true;
        }).catch(() => {});
      });
    }
  };

  // 1. Immediate play on site open
  startAudioPlayback();
  document.addEventListener('DOMContentLoaded', startAudioPlayback);
  window.addEventListener('load', startAudioPlayback);
  window.addEventListener('pageshow', startAudioPlayback);
  window.addEventListener('focus', startAudioPlayback);

  // 2. Unmute and start full audio seamlessly on ANY natural screen touch, swipe, or scroll
  const onAnyNaturalGesture = () => {
    bgMusic.muted = false;
    startAudioPlayback();
    if (!bgMusic.paused && !bgMusic.muted) {
      ['touchstart', 'touchend', 'touchmove', 'scroll', 'pointerdown', 'pointermove', 'click', 'wheel', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, onAnyNaturalGesture, true);
        document.removeEventListener(evt, onAnyNaturalGesture, true);
      });
    }
  };

  ['touchstart', 'touchend', 'touchmove', 'scroll', 'pointerdown', 'pointermove', 'click', 'wheel', 'keydown'].forEach(evt => {
    window.addEventListener(evt, onAnyNaturalGesture, { passive: true, capture: true });
    document.addEventListener(evt, onAnyNaturalGesture, { passive: true, capture: true });
  });
}

// --- Wishes Filter Pills Smooth Auto-Sliding ---
function initFilterPillsAutoSlide() {
  const container = document.querySelector('.filter-pills');
  if (!container) return;

  let isInteracting = false;
  let resumeTimer = null;
  let direction = 1;
  const scrollStep = 0.75;

  function autoScrollLoop() {
    if (!isInteracting && container.scrollWidth > container.clientWidth) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 2) {
        direction = -1;
      } else if (container.scrollLeft <= 2) {
        direction = 1;
      }
      container.scrollLeft += direction * scrollStep;
    }
    requestAnimationFrame(autoScrollLoop);
  }
  requestAnimationFrame(autoScrollLoop);

  const pauseSliding = () => {
    isInteracting = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isInteracting = false;
    }, 4000);
  };

  container.addEventListener('touchstart', pauseSliding, { passive: true });
  container.addEventListener('touchmove', pauseSliding, { passive: true });
  container.addEventListener('wheel', pauseSliding, { passive: true });
  container.addEventListener('mousedown', pauseSliding);
  container.addEventListener('click', pauseSliding);
}

// --- Audio & Celebration Trigger Initialization ---
function initCelebrationControls() {
  const celebrateBtn = document.getElementById('global-celebrate-btn');

  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      fullGrandCelebration();
    });
  }

  // Periodic automatic magic plane flight every 35s
  setInterval(() => {
    if (!document.hidden && Math.random() > 0.3) {
      launchMagicPlane();
    }
  }, 35000);
}

// --- Mobile Navigation Drawer Controller ---
function initMobileNav() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileBtn || !mobileMenu) return;

  mobileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = mobileMenu.style.display === 'flex';
    mobileMenu.style.display = isVisible ? 'none' : 'flex';
  });

  const links = mobileMenu.querySelectorAll('.mobile-nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== mobileBtn) {
      mobileMenu.style.display = 'none';
    }
  });
}

// --- Moments of Excellence & Adventure Gallery Controller ---
function initMomentsGallery() {
  const galleryGrid = document.getElementById('moments-gallery-grid');
  if (!galleryGrid) return;

  const moments = [
    {
      id: 1,
      src: 'assets/gallery/chief_14_skydiving_palm_dubai.jpg',
      cat: 'adventure',
      title: 'Palm Jumeirah Flight, Dubai',
      tag: 'Skydiving 🪂',
      desc: 'Fearless aerial glide soaring above the iconic Palm Jumeirah in Dubai — fearless visionary leadership.'
    },
    {
      id: 2,
      src: 'assets/gallery/chief_13_skydiving_freefall.jpg',
      cat: 'adventure',
      title: 'Fearless Freefall 13,000ft',
      tag: 'Pure Adrenaline ⚡',
      desc: 'High-altitude adrenaline rush pushing beyond all boundaries and living life to the fullest.'
    },
    {
      id: 3,
      src: 'assets/gallery/chief_12_skydiving_ground.jpg',
      cat: 'adventure',
      title: 'Sky Mission Ready',
      tag: 'Pre-Flight 🛩️',
      desc: 'Gearing up for the skies with determination, passion, and a fearless spirit.'
    },
    {
      id: 4,
      src: 'assets/gallery/chief_4_mountains.jpg',
      cat: 'adventure',
      title: 'Alpine Mountain Camp',
      tag: 'Mountain Adventure 🏔️',
      desc: 'Conquering peaks, rugged outdoor trails, and embracing nature\'s grandest vistas.'
    },
    {
      id: 5,
      src: 'assets/gallery/chief_5_cycle.jpg',
      cat: 'adventure',
      title: 'Endurance & Vitality',
      tag: 'Fitness & Drive 🚴',
      desc: 'Cycling through endurance routes with high energy, discipline, and active fitness.'
    },
    {
      id: 6,
      src: 'assets/gallery/chief_10_tower_bridge.jpg',
      cat: 'global',
      title: 'Iconic Tower Bridge, London',
      tag: 'Global Traveler 🇬🇧',
      desc: 'Standing tall before London’s historic Tower Bridge — a global citizen shaping global vision.'
    },
    {
      id: 7,
      src: 'assets/gallery/chief_9_canary_wharf.jpg',
      cat: 'global',
      title: 'Canary Wharf Financial Hub',
      tag: 'Global Business 🏙️',
      desc: 'At the heart of London’s futuristic financial district, steering tech and international ventures.'
    },
    {
      id: 8,
      src: 'assets/gallery/chief_11_london_street.jpg',
      cat: 'global',
      title: 'Regent Street, London',
      tag: 'London Stride 🚶',
      desc: 'Effortless elegance walking the vibrant streets of London.'
    },
    {
      id: 9,
      src: 'assets/gallery/chief_8_family_baby.jpg',
      cat: 'family',
      title: 'Lifting Pure Joy',
      tag: 'Father\'s Love ❤️',
      desc: 'A heartwarming fatherhood moment filled with boundless warmth, smiles, and unconditional love.'
    },
    {
      id: 10,
      src: 'assets/gallery/chief_7_family_cafe.jpg',
      cat: 'family',
      title: 'Tender Bonding Moments',
      tag: 'Family Time ☕',
      desc: 'Sharing sweet, calm conversations and precious quality moments with family.'
    },
    {
      id: 11,
      src: 'assets/gallery/chief_6_heritage.jpg',
      cat: 'family',
      title: 'Roots & Heritage',
      tag: 'Tradition & Grace 🚪',
      desc: 'Rooted in tradition, values, and humility beside the timeless carved heritage entryway.'
    },
    {
      id: 12,
      src: 'assets/gallery/chief_1_profile.jpg',
      cat: 'vision',
      title: 'The Signature Profile',
      tag: 'Iconic Focus 👑',
      desc: 'A sharp, visionary executive profile representing focus, ambition, and sharp leadership.'
    },
    {
      id: 13,
      src: 'assets/gallery/chief_2_smile.jpg',
      cat: 'vision',
      title: 'Warmth & Radiance',
      tag: 'Inspiring Smile ✨',
      desc: 'Warm, approachable, and charismatic smile that inspires every team member at Ixly Technologies.'
    },
    {
      id: 14,
      src: 'assets/gallery/chief_3_vision.jpg',
      cat: 'vision',
      title: 'The Strategic Visionary',
      tag: 'Thought Leadership 💡',
      desc: 'Contemplating the next big leap — thoughtful strategist, entrepreneur, and mentor.'
    }
  ];

  let currentFilteredList = [...moments];
  let currentLightboxIdx = 0;

  function renderCards(filterCat = 'all') {
    galleryGrid.innerHTML = '';
    currentFilteredList = filterCat === 'all' 
      ? moments 
      : moments.filter(m => m.cat === filterCat);

    currentFilteredList.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.dataset.index = index;
      card.innerHTML = `
        <div class="gallery-card-img-wrap">
          <span class="gallery-card-badge">${item.tag}</span>
          <img class="gallery-card-img" src="${item.src}" alt="${item.title}" loading="lazy">
          <div class="gallery-card-overlay"></div>
        </div>
        <div class="gallery-card-info">
          <h3 class="gallery-card-title">${item.title}</h3>
          <p class="gallery-card-desc">${item.desc}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(index);
      });

      galleryGrid.appendChild(card);
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.dataset.cat);
    });
  });

  // Lightbox functionality
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const backdrop = lightbox ? lightbox.querySelector('.lightbox-backdrop') : null;

  function openLightbox(index) {
    if (!lightbox || !currentFilteredList[index]) return;
    currentLightboxIdx = index;
    const item = currentFilteredList[currentLightboxIdx];
    lightboxImg.src = item.src;
    lightboxCaption.textContent = `${item.title} — ${item.tag}`;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  function showNext() {
    if (currentFilteredList.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx + 1) % currentFilteredList.length;
    openLightbox(currentLightboxIdx);
  }

  function showPrev() {
    if (currentFilteredList.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx - 1 + currentFilteredList.length) % currentFilteredList.length;
    openLightbox(currentLightboxIdx);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  // Initial render
  renderCards('all');
}

// --- DOM Ready Hook ---
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initSoapBubbles();
  initCountdown();
  initPortrait3DTilt();
  initVibeActions();
  initChibiSquad();
  initCakeCeremony();
  initMomentsGallery();
  initWishesBoard();
  initCheerBlaster();
  initCelebrationControls();
  initMusicAutoplay();
  initFilterPillsAutoSlide();
  initMobileNav();
});
