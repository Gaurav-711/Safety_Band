// ── CUSTOM CURSOR ──────────────────────────────────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 4 + 'px';
  cursor.style.top  = my - 4 + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx - 16 + 'px';
  cursorRing.style.top  = ry - 16 + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// ── ECG CANVAS ──────────────────────────────────────────────
const canvas = document.getElementById('ecgCanvas');
const ctx    = canvas.getContext('2d');
let ecgPoints  = [];
let ecgX       = 0;
const ECG_SPEED = 3;
const CANVAS_H  = 200;

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = CANVAS_H;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Generates a realistic ECG-like waveform value for position x
function ecgWave(x) {
  const period = 120;
  const t = (x % period) / period;
  if (t < 0.1)  return Math.sin(t * Math.PI * 10) * 0.1;
  if (t < 0.15) return -0.15;
  if (t < 0.2)  return Math.sin((t - 0.15) / 0.05 * Math.PI) * 0.8;  // P wave
  if (t < 0.3)  return Math.sin((t - 0.2)  / 0.1  * Math.PI) * 0.3;
  if (t < 0.35) return -0.4;                                            // Q
  if (t < 0.4)  return 1.0;                                             // R peak
  if (t < 0.45) return -0.5;                                            // S
  if (t < 0.5)  return 0.1;
  if (t < 0.65) return Math.sin((t - 0.5) / 0.15 * Math.PI) * 0.25;  // T wave
  return 0.05 * Math.sin(t * Math.PI * 8);
}

// ── VITALS STATE ────────────────────────────────────────────
let stressMode  = false;
let stressTimer = 0;
let currentHR   = 76;
let targetHR    = 76;
let currentSPO2 = 98;
let targetSPO2  = 98;

function updateVitals() {
  // Occasionally trigger a simulated stress event for demo purposes
  stressTimer++;
  if (stressTimer > 400 && Math.random() < 0.005) {
    stressMode  = true;
    stressTimer = 0;
    targetHR    = 115 + Math.random() * 20;
    targetSPO2  = 94  + Math.random() * 2;
  }
  if (stressMode && stressTimer > 200) {
    stressMode = false;
    targetHR   = 70 + Math.random() * 15;
    targetSPO2 = 97 + Math.random() * 2;
  }

  // Lerp toward targets
  currentHR   += (targetHR   - currentHR)   * 0.02;
  currentSPO2 += (targetSPO2 - currentSPO2) * 0.02;
  currentHR    = Math.round(currentHR);
  currentSPO2  = Math.min(100, Math.max(90, Math.round(currentSPO2 * 10) / 10));

  // DOM refs
  const hrEl       = document.getElementById('liveHR');
  const spo2El     = document.getElementById('liveSPO2');
  const heroHR     = document.getElementById('heroHR');
  const heroSPO2   = document.getElementById('heroSPO2');
  const fsHR       = document.getElementById('fsHR');
  const hrStatus   = document.getElementById('hrStatus');
  const spo2Status = document.getElementById('spo2Status');
  const safetyVal  = document.getElementById('safetyValue');
  const spo2Ring   = document.getElementById('spo2Ring');

  if (hrEl)     hrEl.textContent     = currentHR;
  if (spo2El)   spo2El.textContent   = currentSPO2;
  if (heroHR)   heroHR.textContent   = currentHR;
  if (heroSPO2) heroSPO2.textContent = `SpO₂ ${currentSPO2}%`;
  if (fsHR)     fsHR.textContent     = currentHR;

  // SpO2 ring arc
  if (spo2Ring) {
    const pct    = currentSPO2 / 100;
    const circum = 314;
    spo2Ring.style.strokeDashoffset = circum - pct * circum;
  }

  // HR status label
  if (currentHR > 105) {
    if (hrStatus) { hrStatus.textContent = 'Elevated';     hrStatus.style.color = 'var(--warn-amber)'; }
    if (safetyVal) { safetyVal.textContent = 'MONITORING'; safetyVal.style.color = 'var(--warn-amber)'; }
  } else {
    if (hrStatus) { hrStatus.textContent = 'Normal Range'; hrStatus.style.color = 'var(--safe-green)'; }
    if (safetyVal) { safetyVal.textContent = 'SAFE';        safetyVal.style.color = 'var(--safe-green)'; }
  }

  // SpO2 status label
  if (currentSPO2 < 95) {
    if (spo2Status) { spo2Status.textContent = 'Low — Monitor'; spo2Status.style.color = 'var(--warn-amber)'; }
  } else if (currentSPO2 < 97) {
    if (spo2Status) { spo2Status.textContent = 'Acceptable';    spo2Status.style.color = 'rgba(255,255,255,0.5)'; }
  } else {
    if (spo2Status) { spo2Status.textContent = 'Excellent';     spo2Status.style.color = 'var(--spo2-color)'; }
  }
}

// ── ECG DRAW ────────────────────────────────────────────────
function drawECG() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth   = 1;
  for (let gx = 0; gx < canvas.width; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke();
  }
  for (let gy = 0; gy < CANVAS_H; gy += 40) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
  }

  // Advance the waveform
  const speed = stressMode ? ECG_SPEED * 1.4 : ECG_SPEED;
  ecgX += speed;

  const mid = CANVAS_H / 2;
  const amp = stressMode ? 60 : 45;

  for (let i = 0; i < speed; i++) {
    const y = mid - ecgWave(ecgX - speed + i) * amp;
    ecgPoints.push({ x: ecgX - speed + i, y });
  }

  // Trim to visible width
  const maxPoints = canvas.width + 20;
  if (ecgPoints.length > maxPoints) {
    ecgPoints = ecgPoints.slice(ecgPoints.length - maxPoints);
  }

  // Draw waveform path
  const offset = ecgPoints[0]?.x || 0;
  ctx.beginPath();
  ctx.strokeStyle  = stressMode ? 'rgba(231,76,60,0.9)' : 'rgba(231,76,60,0.8)';
  ctx.lineWidth    = 2;
  ctx.shadowColor  = 'rgba(231,76,60,0.5)';
  ctx.shadowBlur   = 6;

  ecgPoints.forEach((p, i) => {
    const px = p.x - offset;
    if (i === 0) ctx.moveTo(px, p.y);
    else         ctx.lineTo(px, p.y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ── HISTORY BARS ────────────────────────────────────────────
function buildHistoryBars() {
  const wrap   = document.getElementById('historyBars');
  const labels = document.getElementById('historyLabels');
  if (!wrap) return;
  wrap.innerHTML = ''; labels.innerHTML = '';

  const hrs   = [];
  const times = [];
  const now   = new Date();

  for (let i = 23; i >= 0; i--) {
    const h   = new Date(now - i * 3600000);
    const bpm = 60 + Math.floor(Math.random() * 40);
    hrs.push(bpm);
    times.push(h.getHours().toString().padStart(2, '0') + ':00');
  }

  const max = Math.max(...hrs);
  const avg = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length);
  const avgEl = document.getElementById('avgHR');
  if (avgEl) avgEl.textContent = avg;

  hrs.forEach((bpm, i) => {
    const pct   = bpm / max;
    const color = bpm > 100 ? 'var(--warn-amber)'
                : bpm > 90  ? 'rgba(231,76,60,0.7)'
                :              'rgba(231,76,60,0.4)';

    const bar = document.createElement('div');
    bar.className        = 'history-bar';
    bar.style.height     = `${pct * 100}%`;
    bar.style.background = color;
    bar.title            = `${times[i]}: ${bpm} BPM`;
    wrap.appendChild(bar);

    const lbl = document.createElement('span');
    lbl.className   = 'hl-item';
    lbl.textContent = (i % 6 === 0) ? times[i].split(':')[0] : '';
    labels.appendChild(lbl);
  });
}
buildHistoryBars();

// ── CLOCK ────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const t   = now.toTimeString().split(' ')[0];
  const el  = document.getElementById('ecgTime');
  const el2 = document.getElementById('statusTime');
  if (el)  el.textContent  = t;
  if (el2) el2.textContent = t.substring(0, 5);
}

// ── MAIN ANIMATION LOOP ──────────────────────────────────────
let frameCount = 0;
function loop() {
  drawECG();
  frameCount++;
  if (frameCount % 30 === 0) {
    updateVitals();
    updateClock();
  }
  requestAnimationFrame(loop);
}
loop();

// ── SCROLL REVEAL ────────────────────────────────────────────
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
    }
  }),
  { threshold: 0.1 }
);

document.querySelectorAll(
  '.pipeline-step, .model-card, .fact-card, .feature-item'
).forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
