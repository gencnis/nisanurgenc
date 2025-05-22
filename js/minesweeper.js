const rows = 9;
const cols = 9;
const mineCount = 10;
let board = [];
let revealed = [];
let flags = [];
let timer = 0;
let timerInterval;

function initGame() {
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flags = Array.from({ length: rows }, () => Array(cols).fill(false));
  document.getElementById('game-board').innerHTML = '';
  clearInterval(timerInterval);
  timer = 0;
  document.getElementById('timer').textContent = 'Time: 0';
  document.getElementById('mines-left').textContent = `Mines: ${mineCount}`;
  placeMines();
  calculateNumbers();
  renderBoard();
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById('timer').textContent = 'Time: ' + timer;
  }, 1000);
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (board[r][c] !== 'M') {
      board[r][c] = 'M';
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === 'M') {
            count++;
          }
        }
      }
      board[r][c] = count;
    }
  }
}

function renderBoard() {
  const boardEl = document.getElementById('game-board');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.addEventListener('click', () => revealCell(r, c));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });
      boardEl.appendChild(cell);
    }
  }
}

function revealCell(r, c) {
  const idx = r * cols + c;
  const cell = document.querySelectorAll('.cell')[idx];
  if (flags[r][c] || revealed[r][c]) return;
  revealed[r][c] = true;
  cell.classList.add('revealed');
  if (board[r][c] === 'M') {
    cell.textContent = '💣';
    clearInterval(timerInterval);
    alert('Game Over!');
  } else if (board[r][c] > 0) {
    cell.textContent = board[r][c];
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          revealCell(nr, nc);
        }
      }
    }
  }
}

function toggleFlag(r, c) {
  const idx = r * cols + c;
  const cell = document.querySelectorAll('.cell')[idx];
  if (revealed[r][c]) return;
  flags[r][c] = !flags[r][c];
  if (flags[r][c]) {
    cell.classList.add('flagged');
  } else {
    cell.classList.remove('flagged');
  }
}

window.onload = initGame;
