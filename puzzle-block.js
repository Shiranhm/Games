const boardEl = document.querySelector("#puzzle-board");
const movesEl = document.querySelector("#moves");
const bestEl = document.querySelector("#best");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");
const shuffleBtn = document.querySelector("#shuffle-btn");
const solveBtn = document.querySelector("#solve-btn");

const solvedTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
let tiles = [...solvedTiles];
let moves = 0;
let best = Number(localStorage.getItem("gamehub-puzzle-best") || 0);

bestEl.textContent = best || "-";

function render() {
  boardEl.innerHTML = "";
  tiles.forEach((tile, index) => {
    const button = document.createElement("button");
    button.className = tile === 0 ? "tile empty" : "tile";
    button.type = "button";
    button.textContent = tile === 0 ? "" : tile;
    button.setAttribute("aria-label", tile === 0 ? "Empty tile" : `Tile ${tile}`);
    button.addEventListener("click", () => moveTile(index));
    boardEl.appendChild(button);
  });
  movesEl.textContent = moves;
  statusEl.textContent = isSolved() ? "Solved" : "Playing";
}

function isSolved() {
  return tiles.every((tile, index) => tile === solvedTiles[index]);
}

function canMove(index) {
  const empty = tiles.indexOf(0);
  const row = Math.floor(index / 4);
  const col = index % 4;
  const emptyRow = Math.floor(empty / 4);
  const emptyCol = empty % 4;
  return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
}

function moveTile(index) {
  if (!canMove(index)) return;
  const empty = tiles.indexOf(0);
  [tiles[index], tiles[empty]] = [tiles[empty], tiles[index]];
  moves += 1;
  if (isSolved()) {
    messageEl.textContent = "Solved. Nice work.";
    if (!best || moves < best) {
      best = moves;
      localStorage.setItem("gamehub-puzzle-best", String(best));
      bestEl.textContent = best;
    }
  } else {
    messageEl.textContent = "Keep going.";
  }
  render();
}

function shuffle() {
  tiles = [...solvedTiles];
  moves = 0;
  let lastEmpty = -1;
  for (let i = 0; i < 180; i += 1) {
    const empty = tiles.indexOf(0);
    const candidates = [empty - 4, empty + 4, empty - 1, empty + 1].filter((candidate) => {
      if (candidate < 0 || candidate >= 16 || candidate === lastEmpty) return false;
      const row = Math.floor(candidate / 4);
      const col = candidate % 4;
      const emptyRow = Math.floor(empty / 4);
      const emptyCol = empty % 4;
      return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    });
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    lastEmpty = empty;
    [tiles[next], tiles[empty]] = [tiles[empty], tiles[next]];
  }
  messageEl.textContent = "Puzzle shuffled.";
  render();
}

shuffleBtn.addEventListener("click", shuffle);
solveBtn.addEventListener("click", () => {
  tiles = [...solvedTiles];
  moves = 0;
  messageEl.textContent = "Solved layout shown.";
  render();
});

render();
