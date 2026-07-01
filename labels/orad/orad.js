const body = document.body;
const canvas = document.getElementById("oradCanvas");
const ctx = canvas.getContext("2d");
const navButtons = Array.from(document.querySelectorAll("[data-view]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
const copyBlocks = Array.from(document.querySelectorAll("[data-copy]"));
const systemButtons = Array.from(document.querySelectorAll("[data-system]"));
const systemDetails = Array.from(document.querySelectorAll("[data-system-detail]"));
const signalFill = document.getElementById("signalFill");
const signalCount = document.getElementById("signalCount");
const signalHint = document.getElementById("signalHint");
const SIGNAL_TARGET = 50;
const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let dpr = 1;
let pointerX = 0.5;
let pointerY = 0.5;
let currentView = "home";
let signal = 0;
let pulse = 0;
let frame = 0;
let activeLetter = null;
let lastPointer = null;
let bursts = [];
let clueParticles = [];
let screenShards = [];
let clueUnlocked = false;
let clueFlash = 0;
let clueAge = 0;
let currentSystem = "sound";
let currentLang = "zh";
let effectScale = 1;
let lastSignalPercent = -1;
let lastSignalText = "";
let lastSignalHint = "";

const views = ["home", "about", "system", "signal"];
const letters = ["O", "R", "A", "D"].map((char, index) => ({
  char,
  index,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  vx: 0,
  vy: 0,
  scale: 1,
  scaleVelocity: 0,
  rotation: 0,
  rotationVelocity: 0,
  width: 120,
  height: 150,
  dragging: false,
}));

function resize() {
  const rawDpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  effectScale = reduceMotionQuery?.matches ? 0.36 : width < 720 ? 0.52 : width < 1180 ? 0.68 : 0.82;
  dpr = Math.min(rawDpr, width < 720 ? 1.35 : 1.65);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  placeLetters(!activeLetter);
}

function letterSize() {
  if (currentView === "home") return Math.min(width * 0.24, height * 0.36, 310);
  return Math.min(width * 0.078, 98);
}

function placeLetters(force = false) {
  const size = letterSize();
  const compact = currentView !== "home";
  const gap = compact ? size * 0.48 : size * 0.72;
  const centerX = width * 0.5;
  const centerY = compact ? (width < 600 ? 82 : 100) : height * 0.56;
  const spread = [-1.5, -0.5, 0.5, 1.5];

  letters.forEach((letter, index) => {
    letter.tx = centerX + spread[index] * gap;
    letter.ty = centerY + (compact ? Math.sin(index * 1.2) * 5 : Math.sin(index * 1.7) * 22);
    letter.width = size * (letter.char === "I" ? 0.52 : 0.78);
    letter.height = size;
    if (force || (!letter.x && !letter.y)) {
      letter.x = letter.tx;
      letter.y = letter.ty;
    }
  });
}

function setView(view) {
  if (!views.includes(view)) return;
  currentView = view;
  activeLetter = null;
  lastPointer = null;
  if (view !== "signal") {
    clueParticles = [];
    screenShards = [];
    clueFlash = 0;
    clueAge = 0;
    body.classList.remove("is-clue-blast");
  }
  body.className = body.className.replace(/\borad-mode-\w+\b/g, "").trim();
  body.classList.add(`orad-mode-${view}`);
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === view);
  });
  letters.forEach((letter) => {
    letter.dragging = false;
    letter.scaleVelocity += view === "home" ? 0.08 : -0.02;
  });
  placeLetters();
}

function setLang(lang) {
  currentLang = lang;
  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  copyBlocks.forEach((block) => {
    block.hidden = block.dataset.copy !== lang;
  });
}

function setSystem(system) {
  currentSystem = system;
  systemButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.system === system);
  });
  systemDetails.forEach((detail) => {
    detail.classList.toggle("is-active", detail.dataset.systemDetail === system);
  });
}

function updateSignalUi() {
  const percent = Math.round(Math.min(100, (signal / SIGNAL_TARGET) * 100));
  const progress = percent / 100;
  const countText = `${Math.round(signal)} / ${SIGNAL_TARGET}`;
  const hintText = clueUnlocked || signal >= SIGNAL_TARGET ? "HOERA / 5CR34M" : "LOCKED";
  if (percent !== lastSignalPercent) {
    signalFill.parentElement.style.setProperty("--signal-progress", progress.toFixed(2));
    lastSignalPercent = percent;
  }
  if (countText !== lastSignalText) {
    signalCount.textContent = countText;
    lastSignalText = countText;
  }
  if (hintText !== lastSignalHint) {
    signalHint.textContent = hintText;
    lastSignalHint = hintText;
  }
}

function addPulse(amount = 1) {
  if (currentView !== "signal") setView("signal");
  const previousSignal = signal;
  signal = Math.min(SIGNAL_TARGET, signal + amount);
  pulse = Math.min(1, pulse + (clueUnlocked ? 0.18 : 0.45));
  if (signal >= SIGNAL_TARGET && previousSignal < SIGNAL_TARGET) {
    triggerClueExplosion();
  } else if (clueUnlocked && clueParticles.length < 80 && screenShards.length < 34) {
    triggerClueAftershock();
  }
  updateSignalUi();
}

function clueOrigin() {
  return {
    x: width * 0.5,
    y: height - Math.max(42, height * 0.055),
  };
}

function sprayClueParticles(count = 96) {
  const text = "Hoera5CR34M";
  const origin = clueOrigin();
  const total = Math.max(8, Math.round(count * effectScale));
  for (let i = 0; i < total; i += 1) {
    const targetX = width * (0.02 + Math.random() * 0.96);
    const targetY = height * (0.02 + Math.random() * 0.82);
    const dx = targetX - origin.x;
    const dy = targetY - origin.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = 34 + Math.random() * 62;
    clueParticles.push({
      char: text[i % text.length],
      x: origin.x + (Math.random() - 0.5) * Math.min(width * 0.42, 420),
      y: origin.y + (Math.random() - 0.5) * 26,
      vx: (dx / distance) * speed + (Math.random() - 0.5) * 24,
      vy: (dy / distance) * speed - 24 - Math.random() * 30,
      rotation: (Math.random() - 0.5) * 1.2,
      spin: (Math.random() - 0.5) * 0.14,
      size: 16 + Math.random() * Math.min(72, width * 0.075),
      gravity: 0.92 + Math.random() * 0.42,
      age: 0,
      life: 88 + Math.random() * 38,
      color: Math.random() > 0.42 ? "#050505" : "#d9d6cb",
    });
  }
}

function createScreenShards(count = 120) {
  const glyphs = ["H", "O", "E", "R", "A", "5", "C", "R", "3", "4", "M", "/", "·", "+"];
  const total = Math.max(16, Math.round(count * effectScale));
  const wordMarks = [
    {
      text: "Hoera",
      x: width * (0.18 + Math.random() * 0.18),
      y: height * (0.16 + Math.random() * 0.22),
      size: Math.min(width * 0.135, 132) * (0.88 + Math.random() * 0.28),
      rotation: -0.22 + Math.random() * 0.18,
    },
    {
      text: "5CR34M",
      x: width * (0.54 + Math.random() * 0.24),
      y: height * (0.38 + Math.random() * 0.22),
      size: Math.min(width * 0.118, 116) * (0.86 + Math.random() * 0.26),
      rotation: 0.14 + Math.random() * 0.2,
    },
  ];
  screenShards = [];
  wordMarks.forEach((mark, index) => {
    screenShards.push({
      ...mark,
      delay: 4 + index * 9,
      vx: (index === 0 ? -1 : 1) * (2.6 + Math.random() * 2.4),
      vy: -16 - Math.random() * 13,
      gravity: 0.72 + Math.random() * 0.26,
      life: 92 + Math.random() * 24,
      outline: false,
      layer: 3,
      slant: index === 0 ? -0.08 : 0.1,
      word: true,
      fill: index === 0 ? "rgba(44,46,42,.82)" : "rgba(220,217,204,.76)",
      stroke: "rgba(255,255,255,.54)",
    });
  });
  for (let i = 0; i < total; i += 1) {
    const sideBias = i % 5;
    const text = glyphs[i % glyphs.length];
    const x =
      sideBias === 0 ? Math.random() * width :
      sideBias === 1 ? Math.random() * width :
      sideBias === 2 ? Math.random() * width * 0.28 :
      sideBias === 3 ? width * (0.72 + Math.random() * 0.28) :
      width * (0.14 + Math.random() * 0.72);
    const y =
      sideBias === 0 ? height * (0.02 + Math.random() * 0.18) :
      sideBias === 1 ? height * (0.72 + Math.random() * 0.2) :
      height * (0.08 + Math.random() * 0.76);
    screenShards.push({
      text,
      x,
      y,
      delay: Math.random() * 28,
      size: 16 + Math.random() * Math.min(96, width * 0.082),
      rotation: (Math.random() - 0.5) * 1.35,
      vx: (Math.random() - 0.5) * 11,
      vy: -14 - Math.random() * 24,
      gravity: 0.92 + Math.random() * 0.62,
      life: 84 + Math.random() * 36,
      outline: Math.random() > 0.42,
      layer: Math.floor(Math.random() * 3),
      slant: (Math.random() - 0.5) * 0.22,
      word: false,
      fill: Math.random() > 0.46 ? "rgba(30,31,29,.86)" : "rgba(224,221,207,.74)",
      stroke: Math.random() > 0.5 ? "rgba(255,255,255,.56)" : "rgba(5,5,5,.58)",
    });
  }
}

function triggerClueAftershock() {
  clueAge = 0;
  clueFlash = Math.max(clueFlash, 0.54);
  body.classList.add("is-clue-blast");
  canvas.offsetWidth;
  createScreenShards(32);
  sprayClueParticles(58);
}

function triggerClueExplosion() {
  clueUnlocked = true;
  clueAge = 0;
  clueFlash = 1;
  pulse = 1;
  bursts = [];
  clueParticles = [];
  body.classList.add("is-clue-blast");
  canvas.offsetWidth;
  createScreenShards(86);
  letters.forEach((letter, index) => {
    letter.scaleVelocity += 0.92 + index * 0.12;
    letter.vy -= 28 + index * 6;
    letter.vx += (index - 1.5) * 14;
    bursts.push({
      x: width * 0.5 + (index - 1.5) * Math.min(width * 0.16, 180),
      y: height - Math.max(54, height * 0.075),
      r: Math.max(letter.width, letter.height) * 1.6,
      age: -index * 4,
    });
  });
  sprayClueParticles(260);
}

function inflateLetter(letter, amount = 0.22) {
  letter.scaleVelocity += amount;
  letter.rotationVelocity += (Math.random() - 0.5) * 0.04;
  pulse = Math.min(1, pulse + 0.15);
  bursts.push({
    x: letter.x,
    y: letter.y,
    r: Math.max(letter.width, letter.height) * letter.scale * 0.62,
    age: 0,
  });
}

function inflateAll(amount = 0.18) {
  letters.forEach((letter, index) => {
    setTimeout(() => inflateLetter(letter, amount), index * 42);
  });
}

function drawBackground() {
  ctx.fillStyle = currentView === "signal" ? "#e8f1ee" : "#f4f4f0";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = currentView === "signal" ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.052)";
  ctx.lineWidth = 1;
  const grid = width < 600 ? 72 : 132;
  for (let x = 0; x < width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawParticles() {
  if (body.classList.contains("is-clue-blast")) return;
  const count = currentView === "signal" ? 30 : 20;
  for (let i = 0; i < count; i += 1) {
    const seed = i * 91.7;
    const x = (Math.sin(frame * 0.006 + seed) * 0.5 + 0.5) * width;
    const y = (Math.cos(frame * 0.004 + seed) * 0.5 + 0.5) * height;
    const r = 1.5 + ((i * 7) % 18) / 10 + pulse * 8;
    ctx.beginPath();
    ctx.strokeStyle = currentView === "signal" ? "rgba(0,0,0,.42)" : "rgba(0,0,0,.24)";
    ctx.lineWidth = 1;
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
  }
}

function drawSignalWave() {
  if (currentView !== "signal" || body.classList.contains("is-clue-blast")) return;
  ctx.save();
  ctx.translate(0, 72);
  ctx.strokeStyle = "rgba(0,0,0,.66)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 10) {
    const amp = 14 + signal * 1.1 + pulse * 42;
    const y = Math.sin(x * 0.025 + frame * 0.14) * amp * Math.sin((x / width) * Math.PI);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBursts() {
  bursts.forEach((burst) => {
    const progress = Math.max(0, burst.age / 34);
    const alpha = Math.max(0, 1 - progress);
    ctx.save();
    ctx.translate(burst.x, burst.y);
    ctx.scale(1 + progress * 0.26, 1 + progress * 0.42);
    ctx.strokeStyle = `rgba(5,5,5,${0.22 * alpha})`;
    ctx.lineWidth = 2 + progress * 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, burst.r, burst.r * 0.72, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    burst.age += 1;
  });
  bursts = bursts.filter((burst) => burst.age < 34);
}

function drawClueExplosion() {
  if (currentView !== "signal") return;
  if (!clueUnlocked && clueParticles.length === 0) return;
  clueAge += 1;

  screenShards.forEach((shard) => {
    const localAge = clueAge - shard.delay;
    if (localAge <= 0 || localAge > shard.life) return;
    shard.vy += shard.gravity;
    shard.vx *= 0.988;
    shard.x += shard.vx;
    shard.y += shard.vy;
    shard.rotation += shard.vx * 0.006;
    const appear = Math.min(1, localAge / 12);
    const fade = Math.max(0, 1 - Math.max(0, localAge - 54) / 36);
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.rotation + Math.sin(localAge * 0.04) * 0.18);
    ctx.transform(1, 0, shard.slant, 1, 0, 0);
    ctx.globalAlpha = Math.min(1, appear * fade * (shard.word ? 0.74 : shard.layer === 0 ? 0.48 : 0.82));
    ctx.font = `${shard.outline ? 900 : 950} ${shard.size * (shard.word ? 0.9 + appear * 0.16 : 0.84 + appear * 0.22)}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(1.2, shard.size * (shard.word ? 0.028 : shard.outline ? 0.045 : 0.07));
    ctx.shadowColor = shard.word ? "rgba(5,5,5,.14)" : "transparent";
    ctx.shadowBlur = shard.word ? 7 : 0;
    if (shard.word) {
      ctx.strokeStyle = shard.stroke;
      ctx.strokeText(shard.text, 0, 0);
      ctx.fillStyle = shard.fill;
      ctx.fillText(shard.text, 0, 0);
      ctx.globalAlpha *= 0.42;
      ctx.lineWidth = Math.max(1, shard.size * 0.012);
      ctx.strokeStyle = "rgba(5,5,5,.56)";
      ctx.strokeText(shard.text, shard.size * 0.018, shard.size * 0.018);
    } else if (shard.outline) {
      ctx.strokeStyle = shard.stroke;
      ctx.strokeText(shard.text, 0, 0);
      ctx.fillStyle = shard.layer === 0 ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.36)";
      ctx.fillText(shard.text, 0, 0);
    } else {
      ctx.strokeStyle = shard.stroke;
      ctx.strokeText(shard.text, 0, 0);
      ctx.fillStyle = shard.fill;
      ctx.fillText(shard.text, 0, 0);
    }
    ctx.restore();
  });
  screenShards = screenShards.filter((shard) => {
    const localAge = clueAge - shard.delay;
    return localAge < shard.life && shard.y < height + shard.size * 0.8;
  });

  clueParticles.forEach((particle) => {
    particle.age += 1;
    particle.vy += particle.gravity;
    particle.vx *= 0.982;
    particle.vy *= 0.992;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;

    const fade = Math.max(0, 1 - Math.max(0, particle.age - 62) / 42);
    const pop = Math.min(1, particle.age / 12);
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = Math.min(1, fade * 1.25);
    ctx.font = `950 ${particle.size * pop}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(1.2, particle.size * 0.045);
    ctx.strokeStyle = "rgba(255,255,255,.58)";
    if (particle.size > 26) ctx.strokeText(particle.char, 0, 0);
    ctx.fillStyle = particle.color;
    ctx.fillText(particle.char, 0, 0);
    ctx.restore();
  });

  clueParticles = clueParticles.filter((particle) => (
    particle.age < particle.life && particle.y < height + particle.size * 0.9
  ));

  if (clueFlash > 0.01) {
    ctx.save();
    ctx.globalAlpha = clueFlash * 0.28;
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    clueFlash *= 0.9;
  }

  if (clueParticles.length === 0 && screenShards.length === 0) {
    body.classList.remove("is-clue-blast");
  }
}

function updateLetters() {
  placeLetters();
  const compact = currentView !== "home";

  letters.forEach((letter) => {
    if (!letter.dragging) {
      const spring = compact ? 0.09 : 0.018;
      letter.vx += (letter.tx - letter.x) * spring;
      letter.vy += (letter.ty - letter.y) * spring;
      letter.vx *= compact ? 0.76 : 0.94;
      letter.vy *= compact ? 0.76 : 0.94;
      letter.x += letter.vx;
      letter.y += letter.vy;
    }

    letter.scaleVelocity += (1 - letter.scale) * 0.11;
    letter.scaleVelocity *= 0.82;
    letter.scale = Math.max(0.72, Math.min(1.62, letter.scale + letter.scaleVelocity));
    letter.rotationVelocity += (0 - letter.rotation) * 0.02;
    letter.rotationVelocity *= 0.84;
    letter.rotation += letter.rotationVelocity;
  });

  if (currentView === "home") {
    for (let i = 0; i < letters.length; i += 1) {
      for (let j = i + 1; j < letters.length; j += 1) {
        const a = letters[i];
        const b = letters[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const minDist = (a.width + b.width) * 0.38;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.018;
          const nx = dx / dist;
          const ny = dy / dist;
          a.vx -= nx * push;
          a.vy -= ny * push;
          b.vx += nx * push;
          b.vy += ny * push;
        }
      }
    }
  }
}

function drawLetter(letter) {
  const size = letter.height;
  const inflate = Math.max(0, letter.scale - 1);
  const stretchX = letter.dragging ? 1.12 + inflate * 0.2 : 1.04 + Math.sin(frame * 0.018 + letter.index) * 0.012;
  const stretchY = letter.dragging ? 0.95 + inflate * 0.1 : 1.05 + Math.cos(frame * 0.015 + letter.index) * 0.012;

  ctx.save();
  ctx.translate(letter.x, letter.y);
  ctx.rotate(letter.rotation);
  ctx.scale(letter.scale * stretchX, letter.scale * stretchY);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size}px Impact, Haettenschweiler, Arial Black, sans-serif`;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const metal = ctx.createLinearGradient(-letter.width, -size * 0.7, letter.width, size * 0.65);
  metal.addColorStop(0, "#3f4240");
  metal.addColorStop(0.15, "#f7f5eb");
  metal.addColorStop(0.34, "#8e918d");
  metal.addColorStop(0.5, "#e5e2d5");
  metal.addColorStop(0.72, "#515551");
  metal.addColorStop(1, "#f2f0e6");

  ctx.shadowColor = "rgba(0,0,0,.2)";
  ctx.shadowBlur = currentView === "home" ? 22 : 11;
  ctx.shadowOffsetY = currentView === "home" ? 16 : 7;
  ctx.strokeStyle = "rgba(255,255,255,.72)";
  ctx.lineWidth = Math.max(10, size * 0.11);
  ctx.strokeText(letter.char, 0, 0);
  ctx.strokeStyle = "rgba(5,5,5,.32)";
  ctx.lineWidth = Math.max(6, size * 0.058);
  ctx.strokeText(letter.char, 0, 0);
  ctx.fillStyle = metal;
  ctx.fillText(letter.char, 0, 0);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.fillText(letter.char, size * 0.018, size * 0.025);
  ctx.restore();
}

function drawLetters() {
  letters.forEach(drawLetter);
}

function hitLetter(x, y) {
  for (let i = letters.length - 1; i >= 0; i -= 1) {
    const letter = letters[i];
    const rx = Math.abs(x - letter.x);
    const ry = Math.abs(y - letter.y);
    if (rx < letter.width * letter.scale * 0.58 && ry < letter.height * letter.scale * 0.56) {
      return letter;
    }
  }
  return null;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function render() {
  frame += 1;
  pulse *= 0.92;
  if (currentView !== "signal" && !clueUnlocked) signal = Math.max(0, signal - 0.08);
  updateSignalUi();

  updateLetters();
  drawBackground();
  drawParticles();
  drawSignalWave();
  drawBursts();
  drawLetters();
  drawClueExplosion();
  requestAnimationFrame(render);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLang(button.dataset.lang));
});

systemButtons.forEach((button) => {
  button.addEventListener("click", () => setSystem(button.dataset.system));
});

canvas.addEventListener("pointerdown", (event) => {
  if (currentView !== "home") return;
  const point = getCanvasPoint(event);
  const letter = hitLetter(point.x, point.y);
  if (!letter) return;
  activeLetter = letter;
  activeLetter.dragging = true;
  activeLetter.offsetX = point.x - activeLetter.x;
  activeLetter.offsetY = point.y - activeLetter.y;
  activeLetter.vx = 0;
  activeLetter.vy = 0;
  activeLetter.scaleVelocity += 0.28;
  lastPointer = { x: point.x, y: point.y, time: performance.now() };
  canvas.setPointerCapture(event.pointerId);
  inflateLetter(activeLetter, 0.1);
});

canvas.addEventListener("pointermove", (event) => {
  pointerX = event.clientX / Math.max(1, width);
  pointerY = event.clientY / Math.max(1, height);
  if (!activeLetter || currentView !== "home") return;
  const point = getCanvasPoint(event);
  const now = performance.now();
  const dt = Math.max(16, now - (lastPointer?.time || now));
  activeLetter.vx = ((point.x - (lastPointer?.x || point.x)) / dt) * 16;
  activeLetter.vy = ((point.y - (lastPointer?.y || point.y)) / dt) * 16;
  activeLetter.x = point.x - activeLetter.offsetX;
  activeLetter.y = point.y - activeLetter.offsetY;
  activeLetter.rotationVelocity += activeLetter.vx * 0.0005;
  activeLetter.scaleVelocity += 0.008;
  lastPointer = { x: point.x, y: point.y, time: now };
});

canvas.addEventListener("pointerup", (event) => {
  if (!activeLetter) return;
  activeLetter.dragging = false;
  activeLetter.scaleVelocity += 0.18;
  inflateLetter(activeLetter, 0.12);
  activeLetter = null;
  lastPointer = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointercancel", () => {
  if (!activeLetter) return;
  activeLetter.dragging = false;
  activeLetter = null;
  lastPointer = null;
});

window.addEventListener("click", (event) => {
  if (event.target.closest("button, a")) return;
  if (currentView === "signal") addPulse(1);
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (event.target.closest("input, textarea, select, button, a")) return;
    event.preventDefault();
    if (currentView === "home") inflateAll(0.24);
    else addPulse(1);
  }
});

window.addEventListener("resize", resize);

resize();
setView("home");
setLang("zh");
setSystem(currentSystem);
requestAnimationFrame(render);
