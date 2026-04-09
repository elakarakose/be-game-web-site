// =============================================
// SABİTLER VE AYARLAR
// =============================================

const CELL_SIZE  = 18;      // Her karenin piksel boyutu
const COLS       = 20;      // Yatay kare sayısı  (20 × 18 = 360px)
const ROWS       = 20;      // Dikey kare sayısı
const BASE_SPEED = 140;     // Başlangıç hızı (ms cinsinden adım aralığı)
const SPEED_STEP = 5;       // Her 5 puanda hız kaç ms azalsın

// Renk paleti — Koyu retro teması
const COLOR = {
  bg:       '#0d0d14',
  grid:     'rgba(255,255,255,0.03)',
  head:     '#00ff88',               // Yılan kafası: parlak yeşil
  body:     '#00aa55',               // Yılan gövdesi: koyu yeşil
  food:     '#ffaa00',               // Yiyecek: turuncu
  foodGlow: 'rgba(255,170,0,0.35)',  // Yiyecek hale rengi
  textMain: '#00ff88',
  textSub:  '#e0e0e0',
  overlay:  'rgba(13,13,20,0.88)',   // Ekran üzeri yarı saydam örtü
};

// =============================================
// CANVAS VE CONTEXT AYARLARI
// =============================================

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');   // 2D çizim bağlamı

const scoreDisplay = document.getElementById('scoreDisplay');
const bestDisplay  = document.getElementById('bestDisplay');

// =============================================
// OYUN DURUM DEĞİŞKENLERİ
// =============================================

let snake;            // Yılanın vücut segmentleri: [{x,y}, ...]
let direction;        // Mevcut hareket yönü {x, y}
let nextDirection;    // Bir sonraki adımda uygulanacak yön (input buffering)
let food;             // Yiyeceğin konumu {x, y}
let score;            // Mevcut oyun skoru
let bestScore  = 0;   // Tüm oyunlardaki en yüksek skor
let gameInterval;     // setInterval referansı (oyun döngüsü)
let isRunning  = false;
let isGameOver = false;
let foodPulse  = 0;   // Yiyeceğin titreme animasyonu için sayaç

// =============================================
// YARDIMCI FONKSİYONLAR
// =============================================

/** 0 ile (max-1) arasında rastgele tam sayı döndürür */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

/** Yeni bir yiyecek konumu üretir (yılanın üzerine gelmemesini sağlar) */
function spawnFood() {
  let pos;
  do {
    pos = { x: randInt(COLS), y: randInt(ROWS) };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  food = pos;
}

/** Mevcut skora göre oyun hızını hesaplar (skor arttıkça hızlanır) */
function getCurrentSpeed() {
  const reduction = Math.floor(score / 5) * SPEED_STEP;
  return Math.max(60, BASE_SPEED - reduction); // En hızlı 60ms
}

// =============================================
// OYUNU BAŞLATMA / SIFIRLAMA
// =============================================

function initGame() {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);

  // Yılanı ortada 3 segmentle başlat
  snake = [
    { x: cx,     y: cy },  // Kafa
    { x: cx - 1, y: cy },  // Orta
    { x: cx - 2, y: cy },  // Kuyruk
  ];

  direction     = { x: 1, y: 0 }; // Başlangıçta sağa git
  nextDirection = { x: 1, y: 0 };
  score         = 0;
  isGameOver    = false;
  scoreDisplay.textContent = 0;

  spawnFood();
}

// =============================================
// ÇİZİM FONKSİYONLARI
// =============================================

/** Oyun alanını komple yeniden çizer */
function draw() {
  // Arka planı temizle
  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Izgara çizgileri (çok soluk)
  ctx.strokeStyle = COLOR.grid;
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, ROWS * CELL_SIZE);
    ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * CELL_SIZE);
    ctx.lineTo(COLS * CELL_SIZE, j * CELL_SIZE);
    ctx.stroke();
  }

  // Yiyeceği çiz (nabız gibi büyüyüp küçülen daire)
  foodPulse += 0.08;
  const pulse = Math.sin(foodPulse) * 2;
  const fx = food.x * CELL_SIZE + CELL_SIZE / 2;
  const fy = food.y * CELL_SIZE + CELL_SIZE / 2;
  const fr = CELL_SIZE / 2 - 2 + pulse;

  // Hale efekti
  ctx.beginPath();
  ctx.arc(fx, fy, fr + 4, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.foodGlow;
  ctx.fill();

  // Asıl yiyecek
  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, Math.PI * 2);
  ctx.fillStyle = COLOR.food;
  ctx.fill();

  // Yılanı çiz
  snake.forEach((seg, index) => {
    const x = seg.x * CELL_SIZE + 1;
    const y = seg.y * CELL_SIZE + 1;
    const w = CELL_SIZE - 2;
    const h = CELL_SIZE - 2;

    ctx.fillStyle = index === 0 ? COLOR.head : COLOR.body;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4); // Yuvarlak köşeli dikdörtgen
    ctx.fill();

    // Kafaya göz ekle
    if (index === 0) {
      ctx.fillStyle = '#0d0d14';
      const ex = x + w / 2 + direction.x * 3;
      const ey = y + h / 2 + direction.y * 3;
      ctx.beginPath();
      ctx.arc(ex - direction.y * 3, ey + direction.x * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + direction.y * 3, ey - direction.x * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * Ekrana metin katmanı çizer (başlangıç veya oyun bitti ekranı)
 * @param {string} state - 'idle' | 'over'
 */
function drawOverlay(state) {
  ctx.fillStyle = COLOR.overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  if (state === 'idle') {
    ctx.fillStyle = COLOR.textMain;
    ctx.font = '700 14px "Press Start 2P"';
    ctx.fillText('OYNAMAK İÇİN', canvas.width / 2, canvas.height / 2 - 16);
    ctx.fillText('▶ BUTONUNA BAS', canvas.width / 2, canvas.height / 2 + 14);
  } else if (state === 'over') {
    ctx.fillStyle = '#ff4444';
    ctx.font = '700 16px "Press Start 2P"';
    ctx.fillText('OYUN BİTTİ', canvas.width / 2, canvas.height / 2 - 28);
    ctx.fillStyle = COLOR.textSub;
    ctx.font = '400 9px "Press Start 2P"';
    ctx.fillText('SKOR: ' + score, canvas.width / 2, canvas.height / 2 + 4);
    ctx.fillText('TEKRAR: ▶ BUTON', canvas.width / 2, canvas.height / 2 + 26);
  }
}

// =============================================
// OYUN DÖNGÜSÜ
// =============================================

function gameStep() {
  direction = nextDirection;

  // Yeni kafa konumunu hesapla
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Çarpışma kontrolü: duvar veya kendine çarpma
  const hitWall = newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS;
  const hitSelf = snake.some(seg => seg.x === newHead.x && seg.y === newHead.y);

  if (hitWall || hitSelf) {
    clearInterval(gameInterval);
    isRunning  = false;
    isGameOver = true;

    // En yüksek skoru güncelle
    if (score > bestScore) {
      bestScore = score;
      bestDisplay.textContent = bestScore;
    }

    draw();
    drawOverlay('over');
    return;
  }

  // Yeni kafayı en öne ekle
  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    // Yiyecek yenildi: skor artır, yeni yiyecek oluştur, hızı güncelle
    score++;
    scoreDisplay.textContent = score;
    spawnFood();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameStep, getCurrentSpeed());
  } else {
    // Yiyecek yenilmedi: kuyruğu sil (yılan uzamaz)
    snake.pop();
  }

  draw();
}

// =============================================
// OYUNU BAŞLAT
// =============================================

function startGame() {
  if (isRunning) return;
  isRunning = true;
  initGame();
  draw();
  gameInterval = setInterval(gameStep, getCurrentSpeed());
}

// =============================================
// YÖN DEĞİŞTİRME (tersine gitmeyi önler)
// =============================================

function changeDirection(dx, dy) {
  if (dx !== 0 && direction.x !== 0) return; // Yatay eksen çakışması
  if (dy !== 0 && direction.y !== 0) return; // Dikey eksen çakışması
  nextDirection = { x: dx, y: dy };
}

// =============================================
// KLAVYE KONTROLÜ
// =============================================

document.addEventListener('keydown', (e) => {
  if (!isRunning) {
    const starters = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'];
    if (starters.includes(e.key)) { startGame(); return; }
  }
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); changeDirection( 0, -1); break;
    case 'ArrowDown':  e.preventDefault(); changeDirection( 0,  1); break;
    case 'ArrowLeft':  e.preventDefault(); changeDirection(-1,  0); break;
    case 'ArrowRight': e.preventDefault(); changeDirection( 1,  0); break;
  }
});

// =============================================
// MOBİL BUTON KONTROLÜ
// =============================================

document.getElementById('btnUp').addEventListener('click',    () => changeDirection( 0, -1));
document.getElementById('btnLeft').addEventListener('click',  () => changeDirection(-1,  0));
document.getElementById('btnRight').addEventListener('click', () => changeDirection( 1,  0));
document.getElementById('btnStart').addEventListener('click', startGame);

// =============================================
// SAYFA YÜKLENİNCE İLK ÇİZİMİ YAP
// =============================================

initGame();           // Başlangıç durumunu hazırla
draw();               // Bir kere çiz
drawOverlay('idle');  // "Başlamak için bas" yazısını göster