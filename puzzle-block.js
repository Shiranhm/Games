const boardEl = document.querySelector("#sudoku-board");
const levelSelect = document.querySelector("#level-select");
const levelLabelEl = document.querySelector("#level-label");
const mistakesEl = document.querySelector("#mistakes");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");
const newGameBtn = document.querySelector("#new-game-btn");
const checkBtn = document.querySelector("#check-btn");
const hintBtn = document.querySelector("#hint-btn");
const resetBtn = document.querySelector("#reset-btn");

const puzzles = {
  easy: {
    label: "Easy",
    puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  medium: {
    label: "Medium",
    puzzle: "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
    solution: "435269781682571493197834562826195347374682915951743628519326874248957136763418259",
  },
  hard: {
    label: "Hard",
    puzzle: "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
    solution: "462831957795426183381795426173984265659312748248567319926178534834259671517643892",
  },
  expert: {
    label: "Expert",
    puzzle: "500070002070005008008002000050060003020050090700020006001007000200010005005000109",
    solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  master: {
    label: "Master",
    puzzle: "400000080000500000100030002000100040000600005001000600010000800040000100700010009",
    solution: "435269781682571493197834562826195347374682915951743628519326874248957136763418259",
  },
};

let currentLevel = "easy";
let currentPuzzle = puzzles.easy.puzzle;
let currentSolution = puzzles.easy.solution;
let mistakes = 0;

function renderBoard() {
  boardEl.innerHTML = "";
  [...currentPuzzle].forEach((value, index) => {
    const input = document.createElement("input");
    input.className = "sudoku-cell";
    input.inputMode = "numeric";
    input.maxLength = 1;
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Sudoku cell ${index + 1}`);
    input.dataset.index = String(index);

    if (value !== "0") {
      input.value = value;
      input.readOnly = true;
      input.classList.add("given");
    } else {
      input.addEventListener("input", handleInput);
      input.addEventListener("focus", () => highlightRelated(index));
    }

    boardEl.appendChild(input);
  });
}

function handleInput(event) {
  const input = event.target;
  input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
  input.classList.remove("error", "correct");

  if (!input.value) {
    statusEl.textContent = "Playing";
    return;
  }

  const index = Number(input.dataset.index);
  if (input.value === currentSolution[index]) {
    input.classList.add("correct");
    messageEl.textContent = "Good move.";
  } else {
    input.classList.add("error");
    mistakes += 1;
    mistakesEl.textContent = mistakes;
    messageEl.textContent = "That number does not fit.";
  }

  checkWin();
}

function highlightRelated(index) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3);
  const boxCol = Math.floor(col / 3);

  [...boardEl.children].forEach((cell, cellIndex) => {
    const cellRow = Math.floor(cellIndex / 9);
    const cellCol = cellIndex % 9;
    const sameRow = cellRow === row;
    const sameCol = cellCol === col;
    const sameBox = Math.floor(cellRow / 3) === boxRow && Math.floor(cellCol / 3) === boxCol;
    cell.style.borderColor = sameRow || sameCol || sameBox ? "rgba(39, 217, 255, 0.55)" : "";
  });
}

function getBoardValue() {
  return [...boardEl.children].map((cell) => cell.value || "0").join("");
}

function checkPuzzle() {
  let emptyCount = 0;
  let wrongCount = 0;

  [...boardEl.children].forEach((cell, index) => {
    cell.classList.remove("error", "correct");
    if (!cell.value) {
      emptyCount += 1;
      return;
    }
    if (cell.value !== currentSolution[index]) {
      wrongCount += 1;
      cell.classList.add("error");
    } else if (!cell.classList.contains("given")) {
      cell.classList.add("correct");
    }
  });

  if (wrongCount > 0) {
    statusEl.textContent = "Check again";
    messageEl.textContent = `${wrongCount} cell${wrongCount === 1 ? "" : "s"} need fixing.`;
    return;
  }

  if (emptyCount > 0) {
    statusEl.textContent = "Almost";
    messageEl.textContent = `${emptyCount} empty cell${emptyCount === 1 ? "" : "s"} left.`;
    return;
  }

  statusEl.textContent = "Solved";
  messageEl.textContent = "Excellent. Sudoku complete.";
}

function checkWin() {
  if (getBoardValue() === currentSolution) {
    statusEl.textContent = "Solved";
    messageEl.textContent = "Excellent. Sudoku complete.";
  }
}

function giveHint() {
  const emptyCells = [...boardEl.children].filter((cell) => !cell.value && !cell.readOnly);
  if (emptyCells.length === 0) {
    messageEl.textContent = "No empty cells left.";
    return;
  }

  const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const index = Number(cell.dataset.index);
  cell.value = currentSolution[index];
  cell.classList.add("correct");
  messageEl.textContent = "Hint added.";
  checkWin();
}

function loadLevel(level) {
  currentLevel = level;
  currentPuzzle = puzzles[level].puzzle;
  currentSolution = puzzles[level].solution;
  mistakes = 0;
  levelLabelEl.textContent = puzzles[level].label;
  mistakesEl.textContent = "0";
  statusEl.textContent = "Ready";
  messageEl.textContent = `${puzzles[level].label} level loaded.`;
  renderBoard();
}

levelSelect.addEventListener("change", () => loadLevel(levelSelect.value));
newGameBtn.addEventListener("click", () => loadLevel(levelSelect.value));
resetBtn.addEventListener("click", () => loadLevel(currentLevel));
checkBtn.addEventListener("click", checkPuzzle);
hintBtn.addEventListener("click", giveHint);

loadLevel("easy");
