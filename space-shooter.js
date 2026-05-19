const canvas = document.querySelector("#space-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const livesEl = document.querySelector("#lives");
const messageEl = document.querySelector("#message");
const startBtn = document.querySelector("#start-btn");
const restartBtn = document.querySelector("#restart-btn");
const leftBtn = document.querySelector("#left-btn");
const rightBtn = document.querySelector("#right-btn");
const shootBtn = document.querySelector("#shoot-btn");

let best = Number(localStorage.getItem("gamehub-space-best") || 0);
let running = false;
let score = 0;
let lives = 3;
let keys = {};
let bullets = [];
let rocks = [];
let stars = [];
let lastTime = 0;
let shootCooldown = 0;

const ship = {
  x: canvas.width / 2,
  y: canvas.height - 82,
  width: 54,
  height: 58,
};

bestEl.textContent = best;

function resetGame() {
  running = true;
  score = 0;
  lives = 3;
  bullets = [];
  rocks = [];
  stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 40 + Math.random() * 120,
  }));
  ship.x = canvas.width / 2;
  messageEl.textContent = "Defend your ship.";
}

function shoot() {
  if (!running || shootCooldown > 0) return;
  bullets.push({ x: ship.x, y: ship.y - 30, width: 6, height: 18 });
  shootCooldown = 0.18;
}

function spawnRock() {
  rocks.push({
    x: 34 + Math.random() * (canvas.width - 68),
    y: -40,
    radius: 18 + Math.random() * 18,
    speed: 90 + Math.random() * 110 + score * 0.03,
  });
}

function drawShip() {
  ctx.fillStyle = "#a7f432";
  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y - ship.height / 2);
  ctx.lineTo(ship.x - ship.width / 2, ship.y + ship.height / 2);
  ctx.lineTo(ship.x, ship.y + ship.height / 3);
  ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#27d9ff";
  ctx.fillRect(ship.x - 8, ship.y - 8, 16, 22);
}

function drawBackground(delta) {
  ctx.fillStyle = "#070b12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  stars.forEach((star) => {
    star.y += star.speed * delta;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.fillRect(star.x, star.y, 2, 2);
  });
}

function circleRectHit(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function endGame() {
  running = false;
  best = Math.max(best, score);
  localStorage.setItem("gamehub-space-best", String(best));
  bestEl.textContent = best;
  messageEl.textContent = "Game over. Start again.";
}

function update(delta) {
  shootCooldown = Math.max(0, shootCooldown - delta);
  if (!running) return;
  if (keys.ArrowLeft) ship.x -= 430 * delta;
  if (keys.ArrowRight) ship.x += 430 * delta;
  if (keys.Space) shoot();
  ship.x = Math.max(34, Math.min(canvas.width - 34, ship.x));
  if (Math.random() < 0.018 + score * 0.00008) spawnRock();
  bullets.forEach((bullet) => {
    bullet.y -= 520 * delta;
  });
  rocks.forEach((rock) => {
    rock.y += rock.speed * delta;
  });
  bullets = bullets.filter((bullet) => bullet.y > -30);
  rocks = rocks.filter((rock) => rock.y < canvas.height + 70);
  rocks.forEach((rock) => {
    bullets.forEach((bullet) => {
      if (!rock.hit && circleRectHit(rock, bullet)) {
        rock.hit = true;
        bullet.hit = true;
        score += 10;
      }
    });
    if (!rock.hit && circleRectHit(rock, {
      x: ship.x - ship.width / 2,
      y: ship.y - ship.height / 2,
      width: ship.width,
      height: ship.height,
    })) {
      rock.hit = true;
      lives -= 1;
      if (lives <= 0) endGame();
    }
  });
  bullets = bullets.filter((bullet) => !bullet.hit);
  rocks = rocks.filter((rock) => !rock.hit);
}

function draw(delta) {
  drawBackground(delta);
  ctx.fillStyle = "#27d9ff";
  bullets.forEach((bullet) => ctx.fillRect(bullet.x - 3, bullet.y, bullet.width, bullet.height));
  rocks.forEach((rock) => {
    ctx.fillStyle = "#ff4fd8";
    ctx.beginPath();
    ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
  });
  drawShip();
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function loop(time) {
  const delta = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(delta);
  draw(delta);
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
  if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    keys[event.key === " " ? "Space" : event.key] = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    keys[event.key === " " ? "Space" : event.key] = false;
  }
});

startBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);
shootBtn.addEventListener("click", shoot);
holdButton(leftBtn, "ArrowLeft");
holdButton(rightBtn, "ArrowRight");
stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  speed: 40 + Math.random() * 120,
}));
requestAnimationFrame(loop);
