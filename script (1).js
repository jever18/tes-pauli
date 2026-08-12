let timerInterval = null;
let timeLeft = 30;
let columnsData = [];
const rowsPerColumn = 30; // 30 angka per-kolom (29 baris isian)

const setupScreen = document.getElementById('setup-screen');
const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');

const timeSelect = document.getElementById('time-select');
const colsSelect = document.getElementById('cols-select');
const startBtn = document.getElementById('start-btn');
const finishBtn = document.getElementById('finish-btn');
const restartBtn = document.getElementById('restart-btn');

const timerDisplay = document.getElementById('timer-display');
const answeredCountDisplay = document.getElementById('answered-count');
const pauliSheet = document.getElementById('pauli-sheet');

startBtn.addEventListener('click', startTest);
finishBtn.addEventListener('click', endTest);
restartBtn.addEventListener('click', resetTest);

function generateRandomNumbers(count) {
  const nums = [];
  for (let i = 0; i < count; i++) {
    nums.push(Math.floor(Math.random() * 9) + 1);
  }
  return nums;
}

function startTest() {
  timeLeft = parseInt(timeSelect.value, 10);
  const numCols = parseInt(colsSelect.value, 10);

  timerDisplay.textContent = timeLeft;
  answeredCountDisplay.textContent = '0';

  columnsData = [];
  for (let c = 0; c < numCols; c++) {
    columnsData.push(generateRandomNumbers(rowsPerColumn));
  }

  renderPauliSheet();

  setupScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  testScreen.classList.remove('hidden');

  const firstInput = pauliSheet.querySelector('.pauli-input');
  if (firstInput) firstInput.focus();

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      endTest();
    }
  }, 1000);
}

function renderPauliSheet() {
  pauliSheet.innerHTML = '';

  columnsData.forEach((colNumbers, colIdx) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'pauli-column';

    for (let r = 0; r < colNumbers.length; r++) {
      // Angka
      const numDiv = document.createElement('div');
      numDiv.className = 'num-cell';
      numDiv.textContent = colNumbers[r];
      colDiv.appendChild(numDiv);

      // Input kotak isian antara dua angka
      if (r < colNumbers.length - 1) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'pauli-input';
        input.dataset.col = colIdx;
        input.dataset.row = r;

        input.addEventListener('keydown', handleKeyDown);
        input.addEventListener('input', handleInput);

        colDiv.appendChild(input);
      }
    }

    pauliSheet.appendChild(colDiv);
  });
}

function handleInput(e) {
  const input = e.target;
  input.value = input.value.replace(/[^0-9]/g, '');

  if (input.value.length === 1) {
    updateAnsweredCount();
    navigateNext(input);
  }
}

function handleKeyDown(e) {
  const input = e.target;
  const col = parseInt(input.dataset.col, 10);
  const row = parseInt(input.dataset.row, 10);

  if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault(); // Hindari pemicu default browser tab
    navigateNext(input);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveFocus(col, row - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveFocus(col + 1, row);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveFocus(col - 1, row);
  }
}

function navigateNext(currentInput) {
  const col = parseInt(currentInput.dataset.col, 10);
  const row = parseInt(currentInput.dataset.row, 10);

  // Jika masih ada baris di bawah pada kolom yang sama
  if (row < rowsPerColumn - 2) {
    moveFocus(col, row + 1);
  } else {
    // Jika kolom habis, pindah ke baris pertama pada kolom di sebelahnya
    moveFocus(col + 1, 0);
  }
}

function moveFocus(col, row) {
  const target = pauliSheet.querySelector(`.pauli-input[data-col="${col}"][data-row="${row}"]`);
  if (target) {
    target.focus();
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updateAnsweredCount() {
  const inputs = pauliSheet.querySelectorAll('.pauli-input');
  let count = 0;
  inputs.forEach(inp => {
    if (inp.value !== '') count++;
  });
  answeredCountDisplay.textContent = count;
}

function endTest() {
  clearInterval(timerInterval);

  const inputs = pauliSheet.querySelectorAll('.pauli-input');
  let correct = 0;
  let wrong = 0;
  let totalAnswered = 0;

  inputs.forEach(input => {
    const col = parseInt(input.dataset.col, 10);
    const row = parseInt(input.dataset.row, 10);
    const num1 = columnsData[col][row];
    const num2 = columnsData[col][row + 1];
    const expected = (num1 + num2) % 10;

    input.disabled = true; // Kunci input agar tidak bisa diubah

    if (input.value !== '') {
      totalAnswered++;
      if (parseInt(input.value, 10) === expected) {
        correct++;
        input.classList.add('correct');
      } else {
        wrong++;
        input.classList.add('wrong');
      }
    }
  });

  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

  document.getElementById('res-total').textContent = totalAnswered;
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-wrong').textContent = wrong;
  document.getElementById('res-accuracy').textContent = `${accuracy}%`;

  // Tetap tampilkan lembar tes agar pengguna bisa me-review
  resultScreen.classList.remove('hidden');
}

function resetTest() {
  resultScreen.classList.add('hidden');
  testScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
}
