let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let streak = Number(localStorage.getItem("streak")) || 0;
let freeze = Number(localStorage.getItem("freeze")) || 1;
let lastDay = localStorage.getItem("lastDay");

const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const freezeEl = document.getElementById("freeze");
const levelBar = document.getElementById("levelBar");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function requiredXP() {
  return level * 500;
}

function updateUI() {
  xpEl.textContent = xp;
  levelEl.textContent = level;
  streakEl.textContent = streak;
  freezeEl.textContent = freeze;
  levelBar.style.width = Math.min(100, (xp / requiredXP()) * 100) + "%";
}

function checkLevelUp() {
  while (xp >= requiredXP()) {
    xp -= requiredXP();
    level++;
    alert("🎉 Level Up! Yeni Level: " + level);
  }
}

function checkStreak() {
  const t = today();
  if (lastDay === t) return;

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);

  if (lastDay === yesterday) {
    streak++;
  } else if (lastDay && lastDay !== t) {
    if (freeze > 0) {
      freeze--;
    } else {
      streak = 0;
    }
  }
  lastDay = t;
}

function saveDaily(v) {
  let d = JSON.parse(localStorage.getItem("daily") || "{}");
  d[today()] = (d[today()] || 0) + v;
  localStorage.setItem("daily", JSON.stringify(d));
}

function addXP(v) {
  checkStreak();
  xp = Math.max(0, xp + v);
  saveDaily(v);
  checkLevelUp();
  saveAll();
  renderWeekly();
}

function saveAll() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("streak", streak);
  localStorage.setItem("freeze", freeze);
  localStorage.setItem("lastDay", lastDay);
  updateUI();
}

/* TASKS */
function taskKey() {
  return "tasks-" + today();
}

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;
  let tasks = JSON.parse(localStorage.getItem(taskKey()) || "[]");
  tasks.push({ text: input.value, done: false });
  localStorage.setItem(taskKey(), JSON.stringify(tasks));
  input.value = "";
  loadTasks();
}

function loadTasks() {
  const ul = document.getElementById("taskList");
  ul.innerHTML = "";
  let tasks = JSON.parse(localStorage.getItem(taskKey()) || "[]");
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.text;
    li.className = t.done ? "done" : "";
    li.onclick = () => {
      t.done = !t.done;
      localStorage.setItem(taskKey(), JSON.stringify(tasks));
      loadTasks();
    };
    ul.appendChild(li);
  });
}

/* WEEKLY */
function renderWeekly() {
  const stats = document.getElementById("weeklyStats");
  let d = JSON.parse(localStorage.getItem("daily") || "{}");
  let total = 0;
  let best = 0;
  let values = [];

  for (let i = 6; i >= 0; i--) {
    let day = new Date();
    day.setDate(day.getDate() - i);
    let k = day.toISOString().slice(0, 10);
    let v = d[k] || 0;
    values.push(v);
    total += v;
    best = Math.max(best, v);
  }

  stats.innerHTML =
    "Toplam XP: " + total +
    "<br>Günlük Ortalama: " + Math.round(total / 7) +
    "<br>En İyi Gün: " + best;

  drawChart(values);
}

function drawChart(arr) {
  const c = document.getElementById("chart");
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const max = Math.max(...arr, 100);
  const w = c.width / 7;

  arr.forEach((v, i) => {
    const h = (v / max) * c.height;
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(i * w + 6, c.height - h, w - 12, h);
  });
}

loadTasks();
renderWeekly();
updateUI();
