// ---------- 1. Select elements ----------
const currentEl = document.getElementById("current");
const previousEl = document.getElementById("previous");
const keys = document.querySelector(".keys");

// ---------- 2. State ----------
let current = "0";        // number being typed (as text)
let previous = "";        // first number, stored when an operator is pressed
let operator = null;      // + - * /
let justCalculated = false; // true right after "=" is pressed

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ---------- 3. Math ----------
function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  let result;
  if (op === "+") result = a + b;
  if (op === "-") result = a - b;
  if (op === "*") result = a * b;
  if (op === "/") {
    if (b === 0) return null;          // divide by zero
    result = a / b;
  }
  // round to avoid 0.1 + 0.2 = 0.30000000000000004
  return parseFloat(result.toFixed(10));
}

// ---------- 4. Update the screen ----------
function updateDisplay() {
  currentEl.textContent = current;
  previousEl.textContent = operator ? `${previous} ${symbols[operator]}` : "";
}

// ---------- 5. Actions ----------
function inputNumber(num) {
  if (justCalculated) {          // start fresh after "="
    current = "0";
    justCalculated = false;
  }
  if (current === "Error") current = "0";
  if (current.replace(/[-.]/g, "").length >= 15) return; // max digits
  current = current === "0" ? num : current + num;
  updateDisplay();
}

function inputDecimal() {
  if (justCalculated || current === "Error") {
    current = "0";
    justCalculated = false;
  }
  if (current === "") current = "0";   // pressed "." right after an operator
  if (!current.includes(".")) current += ".";
  updateDisplay();
}

function chooseOperator(op) {
  if (current === "Error") return;
  if (operator && !justCalculated && previous !== "") {
    // chaining: 2 + 3 + ... -> calculate 2 + 3 first
    if (current === "" ) { operator = op; updateDisplay(); return; }
    const result = calculate(previous, current, operator);
    if (result === null) return showError();
    previous = String(result);
  } else {
    previous = current;
  }
  operator = op;
  current = "";
  justCalculated = false;
  updateDisplay();
  if (current === "") currentEl.textContent = previous;
}

function equals() {
  if (!operator || current === "") return;
  const result = calculate(previous, current, operator);
  if (result === null) return showError();
  previousEl.textContent = `${previous} ${symbols[operator]} ${current} =`;
  current = String(result);
  previous = "";
  operator = null;
  justCalculated = true;
  currentEl.textContent = current;
}

function clearAll() {
  current = "0";
  previous = "";
  operator = null;
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (justCalculated || current === "Error") return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  updateDisplay();
}

function percent() {
  if (current === "" || current === "Error") return;
  current = String(parseFloat((parseFloat(current) / 100).toFixed(10)));
  updateDisplay();
}

function showError() {
  current = "Error";
  previous = "";
  operator = null;
  justCalculated = true;
  updateDisplay();
}

// ---------- 6. Button clicks ----------
keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.number !== undefined) inputNumber(btn.dataset.number);
  else if (btn.dataset.operator) chooseOperator(btn.dataset.operator);
  else if (btn.dataset.action === "decimal") inputDecimal();
  else if (btn.dataset.action === "equals") equals();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "delete") deleteLast();
  else if (btn.dataset.action === "percent") percent();
});

// ---------- 7. Keyboard support (Bonus) ----------
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(e.key)) {
    e.preventDefault();          // stop "/" opening Firefox quick-find
    chooseOperator(e.key);
  }
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    equals();
  }
  else if (e.key === "Backspace") deleteLast();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
  else if (e.key === "%") percent();
});

updateDisplay();
