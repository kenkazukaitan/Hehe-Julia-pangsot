/**
 * Surprise Digital Letter for Julia
 * Vanilla JavaScript: Canvas Petals, 3D Envelope Physics, Web Audio Synthesizer,
 * Interactive Vouchers, and Keepsake Controls.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Initial State & DOM Element Caching
  // ==========================================================================
  const envelopeScene = document.getElementById('envelope-scene');
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const letterCard = document.getElementById('letter-card');
  const musicBtn = document.getElementById('music-btn');
  const replayBtn = document.getElementById('replay-btn');
  const printBtn = document.getElementById('print-btn');
  const promptHint = document.getElementById('prompt-hint');
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');
  const toastIcon = document.getElementById('toast-icon');
  const displayDate = document.getElementById('display-date');
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');

  let isEnvelopeOpen = false;
  let toastTimeout = null;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Format Current Date
  if (displayDate) {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    displayDate.textContent = `Forever & Always • ${now.toLocaleDateString('en-US', options)}`;
  }

  // Create ambient starry particles in background
  createAmbientParticles();

  function createAmbientParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    const count = 35;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1.5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDuration = `${Math.random() * 8 + 6}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.background = Math.random() > 0.5 ? '#93c5fd' : '#fecdd3';
      container.appendChild(p);
    }
  }

  // ==========================================================================
  // 2. Web Audio API Ambient Synthesizer & Sound Effects
  // ==========================================================================
  class AmbientAudioSystem {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timerId = null;
      this.masterGain = null;
      this.filter = null;
      this.step = 0;

      // Romantic chord progression: Fmaj7 -> Gsus4 -> Em7 -> Am9 (Dreamy ambient frequencies)
      this.chords = [
        [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj7
        [196.00, 246.94, 293.66, 392.00, 523.25], // G
        [164.81, 196.00, 246.94, 329.63, 392.00], // Em7
        [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      ];
    }

    init() {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      // Lowpass filter for warm, dreamy velvet feel
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.masterGain.connect(this.filter);
      this.filter.connect(this.ctx.destination);
    }

    toggle() {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
      return this.isPlaying;
    }

    play() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.step = 0;
      this.scheduleLoop();
    }

    stop() {
      this.isPlaying = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }

    scheduleLoop() {
      if (!this.isPlaying) return;
      this.playChord(this.chords[this.step % this.chords.length]);
      this.step++;
      this.timerId = setTimeout(() => this.scheduleLoop(), 4200);
    }

    playChord(freqs) {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Warm blend of sine and triangle waves
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Subtle detune for shimmer
        osc.frequency.setValueAtTime(freq + (Math.random() * 1.5 - 0.75), now);

        // Soft bell-like envelope with slow bloom
        const startTime = now + idx * 0.12;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.06 / (idx * 0.4 + 1), startTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 4.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 4.6);
      });
    }

    // Envelope open sound effect: soft chime swell
    playOpenSound() {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99]; // E, G, B, D, E, G

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.3);
      });
    }

    // Seal break crackle
    playSealBreakSound() {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    }

    // Voucher claim chime
    playClaimSound() {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph

      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 1.6);
      });
    }
  }

  const audioSystem = new AmbientAudioSystem();

  // Music Pill Toggle Listener
  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isPlaying = audioSystem.toggle();
      if (isPlaying) {
        musicBtn.classList.add('playing');
        showToast('Music On', 'Ambient melody playing softly 🎶', '✨');
      } else {
        musicBtn.classList.remove('playing');
        showToast('Music Paused', 'Ambient chimes silenced', '🌙');
      }
    });
  }

  // ==========================================================================
  // 3. Floating Petals Canvas Effect (Crimson & Sapphire)
  // ==========================================================================
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = 42;
  const mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
  let lastMouseX = -1000;
  let lastMouseY = -1000;

  window.addEventListener('mousemove', (e) => {
    mouse.vx = e.clientX - lastMouseX;
    mouse.vy = e.clientY - lastMouseY;
    lastMouseX = mouse.x = e.clientX;
    lastMouseY = mouse.y = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouse.vx = touch.clientX - lastMouseX;
      mouse.vy = touch.clientY - lastMouseY;
      lastMouseX = mouse.x = touch.clientX;
      lastMouseY = mouse.y = touch.clientY;
    }
  }, { passive: true });

  const petalColors = [
    { start: 'rgba(251, 113, 133, 0.75)', end: 'rgba(225, 29, 72, 0.45)', type: 'crimson' },
    { start: 'rgba(255, 175, 189, 0.7)', end: 'rgba(244, 63, 94, 0.4)', type: 'rose' },
    { start: 'rgba(147, 197, 253, 0.75)', end: 'rgba(37, 99, 235, 0.45)', type: 'sapphire' },
    { start: 'rgba(191, 219, 254, 0.7)', end: 'rgba(59, 130, 246, 0.4)', type: 'sky' }
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20 - Math.random() * 50;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.025;
      this.oscillationSpeed = Math.random() * 0.02 + 0.01;
      this.oscillationOffset = Math.random() * Math.PI * 2;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.aspectRatio = Math.random() * 0.4 + 0.6; // ovalness
      this.opacity = Math.random() * 0.35 + 0.55;
    }

    update() {
      this.angle += this.spin;
      this.oscillationOffset += this.oscillationSpeed;
      this.x += this.speedX + Math.sin(this.oscillationOffset) * 0.8;
      this.y += this.speedY;

      // Mouse gentle breeze reaction
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (1 - dist / 140) * 2;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      // Recycle when falling past screen
      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(1, this.aspectRatio * Math.cos(this.angle));

      // Draw graceful petal curve
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);

      const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
      grad.addColorStop(0, this.color.start);
      grad.addColorStop(1, this.color.end);

      ctx.fillStyle = grad;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    requestAnimationFrame(animatePetals);
  }
  requestAnimationFrame(animatePetals);

  // ==========================================================================
  // 4. Interactive Opening Sequence
  // ==========================================================================
  function triggerEnvelopeOpen() {
    if (isEnvelopeOpen) return;
    isEnvelopeOpen = true;

    // Start background harmony softly if not already playing
    if (!audioSystem.isPlaying) {
      audioSystem.play();
      if (musicBtn) musicBtn.classList.add('playing');
    }

    // Play sound effects
    audioSystem.playSealBreakSound();
    setTimeout(() => {
      audioSystem.playOpenSound();
    }, 300);

    // Burst particles at seal position
    const rect = waxSeal.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);

    // Envelope animations: top flap unfolds and preview slides up
    envelope.classList.add('opening');
    if (promptHint) promptHint.style.opacity = '0';

    // Transition from envelope to expanded letter card
    setTimeout(() => {
      envelopeScene.classList.add('fade-out');

      setTimeout(() => {
        envelopeScene.style.display = 'none';
        letterCard.classList.remove('hidden');

        // Allow DOM reflow then trigger bloom and text reveal
        requestAnimationFrame(() => {
          letterCard.classList.add('blooming');
          letterCard.classList.add('revealed');
          if (window.lucide) window.lucide.createIcons();

          // Smooth scroll to top of letter card
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }, 700);
    }, 950);
  }

  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerEnvelopeOpen();
  });

  envelope.addEventListener('click', () => {
    if (!isEnvelopeOpen) {
      triggerEnvelopeOpen();
    }
  });

  // ==========================================================================
  // 5. Interactive Vouchers / Coupons
  // ==========================================================================
  const voucherCards = document.querySelectorAll('.voucher-card');

  voucherCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const isClaimed = card.classList.contains('claimed');
      const messageToCopy = card.getAttribute('data-message');
      const voucherName = card.querySelector('.voucher-name').textContent;

      if (!isClaimed) {
        // Mark as claimed
        card.classList.add('claimed');
        audioSystem.playClaimSound();

        // Stamp confetti burst
        const rect = card.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);

        // Copy message to clipboard
        copyToClipboard(messageToCopy, () => {
          showToast(
            `"${voucherName}" Claimed!`,
            'Copied message to clipboard! Send it to Michael ❤️',
            '🎫'
          );
        });
      } else {
        // Already claimed, re-copy message
        copyToClipboard(messageToCopy, () => {
          showToast(
            'Message Re-copied! ✨',
            'Ready to paste into your chat with Michael!',
            '💌'
          );
        });
      }
    });
  });

  function copyToClipboard(text, callback) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(callback).catch(() => {
        fallbackCopy(text, callback);
      });
    } else {
      fallbackCopy(text, callback);
    }
  }

  function fallbackCopy(text, callback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (err) {
      console.error('Copy fallback failed', err);
    }
    document.body.removeChild(textArea);
  }

  // ==========================================================================
  // 6. Confetti & Heart Particles Burst
  // ==========================================================================
  function burstConfetti(originX, originY, count = 20) {
    const symbols = ['❤️', '💙', '✨', '🌸', '🌹', '💖'];
    const colors = ['#e11d48', '#2563eb', '#fb7185', '#60a5fa', '#fbbf24'];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const isEmoji = Math.random() > 0.45;

      el.style.position = 'fixed';
      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      el.style.userSelect = 'none';

      if (isEmoji) {
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.fontSize = `${Math.random() * 12 + 12}px`;
      } else {
        const size = Math.random() * 8 + 6;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      }

      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 95 + 40;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 20;

      const animation = el.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy + 60}px) scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 600 + 700,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      });

      animation.onfinish = () => el.remove();
    }
  }

  // ==========================================================================
  // 7. Toast Notifications
  // ==========================================================================
  function showToast(title, desc, icon = '✨') {
    if (!toast) return;
    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toastIcon.textContent = icon;

    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ==========================================================================
  // 8. Replay & Print Keepsake Handlers
  // ==========================================================================
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      // Smooth reset
      letterCard.classList.remove('revealed');
      letterCard.classList.remove('blooming');
      letterCard.classList.add('hidden');

      envelopeScene.style.display = 'flex';
      envelopeScene.classList.remove('fade-out');
      envelope.classList.remove('opening');

      if (promptHint) promptHint.style.opacity = '1';
      isEnvelopeOpen = false;

      // Reset vouchers
      voucherCards.forEach(card => card.classList.remove('claimed'));

      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Replayed', 'Experience the envelope once more ❤️', '💌');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      showToast('Preparing Keepsake', 'Opening print preview...', '🖨️');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }

})();
