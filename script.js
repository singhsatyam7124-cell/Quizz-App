// ---------- Data: array of objects ----------
const QUESTIONS = [
  { question: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>", "<heading>"], answer: "<h1>" },
  { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System", "Colorful Style Sheets"], answer: "Cascading Style Sheets" },
  { question: "Which CSS property changes the text colour of an element?", options: ["font-color", "text-style", "color", "foreground"], answer: "color" },
  { question: "Which keyword declares a variable that cannot be reassigned?", options: ["var", "let", "const", "static"], answer: "const" },
  { question: "What does typeof null return in JavaScript?", options: ["\"null\"", "\"object\"", "\"undefined\"", "\"number\""], answer: "\"object\"" },
  { question: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: "push()" },
  { question: "Which symbol selects an element by id in CSS?", options: [".", "#", "*", "&"], answer: "#" },
  { question: "Which method finds the first element matching a CSS selector?", options: ["getElement()", "querySelector()", "findOne()", "selectFirst()"], answer: "querySelector()" },
  { question: "What is the result of 5 + \"5\" in JavaScript?", options: ["10", "\"10\"", "\"55\"", "NaN"], answer: "\"55\"" },
  { question: "Which CSS layout module is built for one-dimensional rows or columns?", options: ["Flexbox", "Float", "Table", "Position"], answer: "Flexbox" },
  { question: "Which attribute makes an image accessible to screen readers?", options: ["title", "src", "alt", "name"], answer: "alt" },
  { question: "Which event fires when a user clicks an element?", options: ["onpress", "click", "tap", "select"], answer: "click" }
];
console.log(QUESTIONS);

// ---------- State ----------
const TIME_PER_QUESTION = 20;
let questions = [];      // shuffled copy used for the current game
let currentIndex = 0;
let score = 0;
let answers = [];        // the user's chosen option text (or null when time ran out)
let locked = false;      // true once the current question is answered
let timerId = null;
let timeLeft = TIME_PER_QUESTION;

// ---------- Element references ----------
const $ = (selector) => document.querySelector(selector);
const screens = { start: $("#startScreen"), quiz: $("#quizScreen"), result: $("#resultScreen") };
const optionsBox = $("#options"), nextBtn = $("#nextBtn"), feedback = $("#feedback");

// ---------- Helpers (functions with parameters and return values) ----------
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
const getPercent = (correct, total) => Math.round((correct / total) * 100);

function getMessage(percent) {
  if (percent === 100) return "Perfect score. Flawless.";
  if (percent >= 80) return "Great job!";
  if (percent >= 50) return "Good effort. A little more practice and you're there.";
  return "Try again. You'll do better next time.";
}
function show(name) {
  for (const key in screens) screens[key].classList.toggle("hidden", key !== name);
}
function readBest() {
  try { return Number(localStorage.getItem("quiz-best")) || 0; } catch (e) { return 0; }
}
function saveBest(value) {
  try { localStorage.setItem("quiz-best", String(value)); } catch (e) { /* storage unavailable */ }
}
function showBest() {
  const best = readBest();
  $("#bestScore").textContent = best ? "Best score: " + best + " / " + QUESTIONS.length : "No best score yet. Set one.";
}

// ---------- Theme (remembered in localStorage) ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("#themeBtn").textContent = theme === "dark" ? "Light mode" : "Dark mode";
  try { localStorage.setItem("quiz-theme", theme); } catch (e) { /* ignore */ }
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("quiz-theme"); } catch (e) { /* ignore */ }
  const prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}
$("#themeBtn").addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ---------- Timer ----------
function stopTimer() { clearInterval(timerId); timerId = null; }
function renderTimer() {
  $("#timerText").textContent = timeLeft + "s";
  $("#timeFill").style.width = (timeLeft / TIME_PER_QUESTION) * 100 + "%";
  $("#timeBar").classList.toggle("low", timeLeft <= 5);
}
function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  $("#timeFill").style.transition = "none";
  renderTimer();
  requestAnimationFrame(() => { $("#timeFill").style.transition = ""; });
  timerId = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) handleTimeout();
  }, 1000);
}
function handleTimeout() {
  if (locked) return;
  checkAnswer(null);
  feedback.textContent = "Time's up. The correct answer is highlighted.";
  setTimeout(() => { if (locked && screens.quiz.offsetParent) goNext(); }, 1800);
}

// ---------- Quiz flow ----------
function startQuiz() {
  // shuffle questions, then shuffle the options inside each question
  questions = shuffle(QUESTIONS).map((q) => ({ ...q, options: shuffle(q.options) }));
  currentIndex = 0;
  score = 0;
  answers = [];
  show("quiz");
  showQuestion();
}

function showQuestion() {
  const q = questions[currentIndex];
  locked = false;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.disabled = true;
  nextBtn.textContent = currentIndex === questions.length - 1 ? "See result" : "Next";

  $("#counter").textContent = "Question " + (currentIndex + 1) + " of " + questions.length;
  $("#progressFill").style.width = (currentIndex / questions.length) * 100 + "%";
  $("#questionText").textContent = q.question;

  optionsBox.textContent = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt";
    btn.dataset.value = text;
    const key = document.createElement("span");
    key.className = "key";
    key.textContent = i + 1;
    const label = document.createElement("span");
    label.textContent = text;
    btn.append(key, label);
    btn.addEventListener("click", () => checkAnswer(text));
    optionsBox.appendChild(btn);
  });
  startTimer();
}

function checkAnswer(chosen) {
  if (locked) return;           // stops the user scoring twice
  locked = true;
  stopTimer();
  const q = questions[currentIndex];
  answers[currentIndex] = chosen;

  optionsBox.querySelectorAll(".opt").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.value === q.answer) btn.classList.add("correct");
    else if (btn.dataset.value === chosen) btn.classList.add("wrong");
  });

  if (chosen === q.answer) {
    score++;
    feedback.textContent = "Correct!";
    feedback.className = "feedback good";
  } else if (chosen !== null) {
    feedback.textContent = "Not quite. The right answer is " + q.answer;
    feedback.className = "feedback bad";
  }
  $("#progressFill").style.width = ((currentIndex + 1) / questions.length) * 100 + "%";
  nextBtn.disabled = false;
}

function goNext() {
  if (!locked) return;
  currentIndex++;
  if (currentIndex < questions.length) showQuestion();
  else showResult();
}

function showResult() {
  stopTimer();
  const percent = getPercent(score, questions.length);
  $("#resultMessage").textContent = getMessage(percent);
  $("#scoreNum").textContent = score + " / " + questions.length;
  $("#scorePct").textContent = percent + "%";

  const best = readBest();
  if (score > best) {
    saveBest(score);
    $("#bestNote").textContent = best ? "New best score! The old one was " + best + "." : "Your first best score is saved.";
  } else {
    $("#bestNote").textContent = "Best score: " + best + " / " + questions.length;
  }

  // Review list
  const list = $("#reviewList");
  list.textContent = "";
  questions.forEach((q, i) => {
    const mine = answers[i];
    const li = document.createElement("li");
    li.className = mine === q.answer ? "ok" : "no";
    const qp = document.createElement("p");
    qp.className = "q";
    qp.textContent = (i + 1) + ". " + q.question;
    const ap = document.createElement("p");
    ap.className = "a";
    ap.textContent = mine === q.answer
      ? "Your answer: " + mine + " (correct)"
      : "Your answer: " + (mine === null ? "no answer (time ran out)" : mine) + ". Correct answer: " + q.answer;
    li.append(qp, ap);
    list.appendChild(li);
  });
  show("result");
  window.scrollTo({ top: 0 });
}

// ---------- Events ----------
$("#startBtn").addEventListener("click", startQuiz);
$("#restartBtn").addEventListener("click", () => { showBest(); startQuiz(); });
nextBtn.addEventListener("click", goNext);

// Keyboard shortcuts: 1-4 choose an option, Enter goes to the next question
document.addEventListener("keydown", (e) => {
  if (screens.quiz.classList.contains("hidden")) return;
  if (e.key >= "1" && e.key <= "4") {
    const btn = optionsBox.querySelectorAll(".opt")[Number(e.key) - 1];
    if (btn) btn.click();
  } else if (e.key === "Enter" && locked) {
    e.preventDefault();
    goNext();
  }
});

initTheme();
showBest();
