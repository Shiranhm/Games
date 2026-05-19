const canvas = document.querySelector("#racing-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const speedEl = document.querySelector("#speed");
const messageEl = document.querySelector("#message");
const startBtn = document.querySelector("#start-btn");
const restartBtn = document.querySelector("#restart-btn");
const leftBtn = document.querySelector("#left-btn");
const rightBtn = document.querySelector("#right-btn");
const brakeBtn = document.querySelector("#brake-btn");

let best = Number(localStorage.getItem("gamehub-racing-best") || 0);
let running = false;
let score = 0;
let speed = 5;
let keys = {};
let obstacles = [];
let roadOffset = 0;
let lastTime = 0;

const player = {
  x: canvas.width / 2 - 32,
  y: canvas.height - 118,
  width: 64,
  height: 92,
};

bestEl.textContent = best;

function resetGame() {
  running = true;
  score = 0;
  speed = 5;
  obstacles = [];
  roadOffset = 0;
  player.x = canvas.width / 2 - player.width / 2;
  messageEl.textContent = "Drive safely.";
}

function drawCar(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillRect(x + 12, y + 14, width - 24, 18);
  ctx.fillRect(x + 12, y + height - 30, width - 24, 12);
  ctx.fillStyle = "#05070d";
  ctx.fillRect(x - 5, y + 18, 8, 22);
  ctx.fillRect(x + width - 3, y + 18, 8, 22);
  ctx.fillRect(x - 5, y + height - 40, 8, 22);
  ctx.fillRect(x + width - 3, y + height - 40, 8, 22);
}

function drawRoad() {
  ctx.fillStyle = "#070b12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const roadX = canvas.width * 0.22;
  const roadW = canvas.width * 0.56;
  ctx.fillStyle = "#182235";
  ctx.fillRect(roadX, 0, roadW, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 6;
  ctx.setLineDash([34, 24]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#27d9ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(roadX, 0, roadW, canvas.height);
}

function spawnObstacle() {
  const roadX = canvas.width * 0.25;
  const roadW = canvas.width * 0.5;
  const width = 58;
  const x = roadX + Math.random() * (roadW - width);
  obstacles.push({ x, y: -120, width, height: 86 });
}

function hits(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endGame() {
  running = false;
  best = Math.max(best, Math.floor(score));
  localStorage.setItem("gamehub-racing-best", String(best));
  bestEl.textContent = best;
  messageEl.textContent = "Game over. Try again.";
}

function update(delta) {
  if (!running) return;
  const roadX = canvas.width * 0.22;
  const roadW = canvas.width * 0.56;
  const moveSpeed = 520 * delta;
  if (keys.ArrowLeft) player.x -= moveSpeed;
  if (keys.ArrowRight) player.x += moveSpeed;
  if (keys.Brake) speed = Math.max(4, speed - 4 * delta);
  speed += 0.35 * delta;
  player.x = Math.max(roadX + 8, Math.min(roadX + roadW - player.width - 8, player.x));
  roadOffset += speed * 8 * delta;
  score += speed * delta * 8;
  if (Math.random() < 0.018 + speed * 0.0015) spawnObstacle();
  obstacles.forEach((obstacle) => {
    obstacle.y += speed * 48 * delta;
  });
  obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height + 140);
  if (obstacles.some((obstacle) => hits(player, obstacle))) endGame();
}

function draw() {
  drawRoad();
  obstacles.forEach((obstacle) => drawCar(obstacle.x, obstacle.y, obstacle.width, obstacle.height, "#ff4f6d"));
  drawCar(player.x, player.y, player.width, player.height, "#a7f432");
  scoreEl.textContent = Math.floor(score);
  speedEl.textContent = Math.max(1, Math.floor(speed - 3));
}

function loop(time) {
  const delta = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

function holdButton(button, key) {
  button.addEventListener("pointerdown", () => {
    keys[key] = true;
  });
  button.addEventListener("pointerup", () => {
    keys[key] = false;
  });
  button.addEventListener("pointerleave", () => {
    keys[key] = false;
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") keys[event.key] = false;
});

startBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);
holdButton(leftBtn, "ArrowLeft");
holdButton(rightBtn, "ArrowRight");
holdButton(brakeBtn, "Brake");
draw();
requestAnimationFrame(loop);
