const EMOJIS = ['🦊','🐬','🦋','🌸','⚡','🍀','🎯','🔮','🦁','🌙','🎸','🍕','🚀','🎃','🦄','🌈','🍄','🎲'];

let cards = [], flipped = [], matched = 0, moves = 0, score = 0, combo = 1;
let canFlip = true, timer = 60, timerInterval = null, gameActive = false;
let currentLevel = 1;

const LEVELS = {
  1: { cols: 4, pairs: 8,  time: 60 },
  2: { cols: 5, pairs: 10, time: 75 },
  3: { cols: 6, pairs: 12, time: 90 }
};

function setLevel(lvl, btn) {
  currentLevel = lvl;
  document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('grid').style.gridTemplateColumns = `repeat(${LEVELS[lvl].cols}, 1fr)`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  const lvl = LEVELS[currentLevel];
  timer = lvl.time;
  moves = 0; score = 0; combo = 1; matched = 0;
  flipped = []; canFlip = true; gameActive = true;

  document.getElementById('grid').style.gridTemplateColumns = `repeat(${lvl.cols}, 1fr)`;

  const chosen = shuffle([...EMOJIS]).slice(0, lvl.pairs);
  cards = shuffle([...chosen, ...chosen].map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false
  })));

  renderGrid();
  updateHUD();
  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

function tick() {
  timer--;
  document.getElementById('timeEl').textContent = timer;
  document.getElementById('timerBar').style.width =
    (timer / LEVELS[currentLevel].time * 100) + '%';
  if (timer <= 0) { clearInterval(timerInterval); endGame(false); }
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  cards.forEach((card, idx) => {
    const el = document.createElement('div');
    el.className = 'card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
    el.innerHTML = `
      <div class="card-inner">
        <div class="card-back"></div>
        <div class="card-front">${card.emoji}</div>
      </div>`;
    el.addEventListener('click', () => flipCard(idx));
    grid.appendChild(el);
  });
}

function flipCard(idx) {
  if (!canFlip || !gameActive) return;
  const card = cards[idx];
  if (card.flipped || card.matched) return;
  if (flipped.length >= 2) return;

  card.flipped = true;
  flipped.push(idx);
  updateCardEl(idx);

  if (flipped.length === 2) {
    moves++;
    canFlip = false;
    const [a, b] = flipped;

    if (cards[a].emoji === cards[b].emoji) {
      setTimeout(() => {
        cards[a].matched = true;
        cards[b].matched = true;
        matched++;
        score += 100 * combo;
        showCombo(combo > 1 ? `COMBO x${combo}! 🔥` : `+${100 * combo}`);
        combo++;
        flipped = [];
        canFlip = true;
        updateCardEl(a);
        updateCardEl(b);
        updateHUD();
        if (matched === LEVELS[currentLevel].pairs) {
          clearInterval(timerInterval);
          endGame(true);
        }
      }, 400);
    } else {
      combo = 1;
      setTimeout(() => {
        cards[a].flipped = false;
        cards[b].flipped = false;
        flipped = [];
        canFlip = true;
        updateCardEl(a);
        updateCardEl(b);
        updateHUD();
      }, 900);
    }
    updateHUD();
  }
}

function updateCardEl(idx) {
  const els = document.getElementById('grid').querySelectorAll('.card');
  const card = cards[idx];
  els[idx].className = 'card' +
    (card.flipped ? ' flipped' : '') +
    (card.matched ? ' matched' : '');
}

function updateHUD() {
  document.getElementById('scoreEl').textContent = score;
  document.getElementById('movesEl').textContent = moves;
  document.getElementById('comboEl').textContent = 'x' + combo;
}

function showCombo(text) {
  const el = document.createElement('div');
  el.className = 'combo-flash';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 850);
}

function endGame(won) {
  gameActive = false;
  const stars = won
    ? (moves <= LEVELS[currentLevel].pairs + 2 ? '⭐⭐⭐'
      : moves <= LEVELS[currentLevel].pairs + 5 ? '⭐⭐' : '⭐')
    : '';
  document.querySelector('.ov-title').textContent = won ? 'TEBRİKLER! 🎉' : 'SÜRE DOLDU ⏰';
  document.querySelector('.ov-sub').innerHTML = won
    ? `<div class="stars-row">${stars}</div>SKOR: ${score}<br>HAMLE: ${moves}<br>KALAN SÜRE: ${timer}sn`
    : `SKOR: ${score}<br>HAMLE: ${moves}<br>Tekrar dene!`;
  document.querySelector('.ov-btn').textContent = 'YENİDEN ▶';
  document.getElementById('overlay').classList.remove('hidden');
}