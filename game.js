// Word Siege: words march toward your gate from the right. Type them to destroy them.
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const GATE_X = 70;
const MAX_HP = 5;
const WORDS = {
  easy: ["bow", "ant", "sun", "map", "key", "ash", "oak", "ice", "owl", "fog", "gem", "rune"],
  mid: ["archer", "shield", "castle", "dragon", "banner", "knight", "cannon", "arrow", "fortress", "stone"],
  hard: ["catapult", "battlement", "portcullis", "trebuchet", "drawbridge", "cavalry", "garrison", "ambush"],
};

let state; // everything that changes during a game lives here

function newGame() {
  state = { words: [], typed: "", hp: MAX_HP, wave: 1, score: 0, combo: 0,
            killed: 0, spawnTimer: 0, running: true, particles: [] };
  setMsg("Type the words!");
}

// ----- word creation -----
function pickWord() {
  const wave = state.wave;
  const pool = wave < 3 ? WORDS.easy : wave < 6 ? WORDS.easy.concat(WORDS.mid) : WORDS.mid.concat(WORDS.hard);
  return pool[Math.floor(Math.random() * pool.length)];
}
function spawn() {
  state.words.push({
    text: pickWord(),
    x: canvas.width + 10,
    y: 40 + Math.random() * (canvas.height - 80),
    speed: 0.5 + state.wave * 0.12 + Math.random() * 0.3,
  });
}

// ----- game loop -----
let last = 0;
function loop(t) {
  const dt = Math.min((t - last) / 16.67, 3); // 1 = one frame at 60fps
  last = t;
  if (state && state.running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawn();
    state.spawnTimer = Math.max(25, 110 - state.wave * 9);
  }
  for (const w of state.words) w.x -= w.speed * dt;

  // words that reach the gate damage it and break the combo
  const breached = state.words.filter((w) => w.x <= GATE_X);
  if (breached.length) {
    state.hp -= breached.length;
    state.combo = 0;
    state.typed = "";
    state.words = state.words.filter((w) => w.x > GATE_X);
    shake = 10;
    if (state.hp <= 0) gameOver();
  }
  state.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  state.particles = state.particles.filter((p) => p.life > 0);
  updateHud();
}

// ----- typing -----
function onKey(e) {
  if (e.key === "Enter" && (!state || !state.running)) { newGame(); return; }
  if (!state || !state.running) return;
  if (e.key === "Backspace") { state.typed = state.typed.slice(0, -1); return; }
  if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
  e.preventDefault();

  const attempt = state.typed + e.key.toLowerCase();
  // choose the closest-to-gate word that matches what has been typed so far
  const match = state.words.filter((w) => w.text.startsWith(attempt)).sort((a, b) => a.x - b.x)[0];
  if (!match) { state.combo = 0; return; } // wrong key: combo resets, typed text is kept

  state.typed = attempt;
  if (attempt === match.text) destroy(match);
}

function destroy(word) {
  state.words = state.words.filter((w) => w !== word);
  state.typed = "";
  state.combo++;
  state.killed++;
  state.score += word.text.length * 10 * (1 + Math.floor(state.combo / 5));
  for (let i = 0; i < 14; i++) {
    state.particles.push({ x: word.x, y: word.y, vx: (Math.random() - 0.5) * 6,
                           vy: (Math.random() - 0.5) * 6, life: 25 });
  }
  if (state.killed % 10 === 0) { state.wave++; setMsg("Wave " + state.wave + "! They move faster."); }
}

function gameOver() {
  state.running = false;
  const best = Math.max(state.score, getBest());
  saveBest(best);
  setMsg("The gate has fallen. Score " + state.score + ". Press Enter to try again.");
}

// ----- drawing -----
let shake = 0;
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, 0); shake *= 0.85; }
  if (!state) return;

  // gate
  ctx.fillStyle = state.hp <= 2 ? "#e5533d" : "#c9a227";
  ctx.fillRect(GATE_X - 12, 0, 12, canvas.height);

  ctx.font = "22px 'Courier New', monospace";
  ctx.textBaseline = "middle";
  const target = state.words.filter((w) => state.typed && w.text.startsWith(state.typed))
                            .sort((a, b) => a.x - b.x)[0];
  for (const w of state.words) {
    const done = w === target ? state.typed.length : 0;
    const typedPart = w.text.slice(0, done);
    ctx.fillStyle = "#6fcf97";
    ctx.fillText(typedPart, w.x, w.y);
    ctx.fillStyle = w === target ? "#ffffff" : "#e9e4d6";
    ctx.fillText(w.text.slice(done), w.x + ctx.measureText(typedPart).width, w.y);
  }
  ctx.fillStyle = "#c9a227";
  for (const p of state.particles) ctx.fillRect(p.x, p.y, 3, 3);
}

// ----- HUD and storage -----
function updateHud() {
  document.getElementById("hp").textContent = "♥".repeat(Math.max(0, state.hp));
  document.getElementById("wave").textContent = state.wave;
  document.getElementById("score").textContent = state.score;
  document.getElementById("combo").textContent = state.combo;
  document.getElementById("best").textContent = Math.max(getBest(), state.score);
}
function setMsg(text) { document.getElementById("msg").textContent = text; }
function getBest() { try { return Number(localStorage.getItem("word-siege-best")) || 0; } catch { return 0; } }
function saveBest(n) { try { localStorage.setItem("word-siege-best", n); } catch {} }

document.addEventListener("keydown", onKey);
document.getElementById("best").textContent = getBest();
document.getElementById("hp").textContent = "♥".repeat(MAX_HP);
requestAnimationFrame(loop);
