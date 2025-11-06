/* js/app.js */
const form = document.getElementById("entryForm");
const saveBtn = document.getElementById("saveBtn");
const feedback = document.getElementById("saveFeedback");
const quoteEl = document.getElementById("dailyQuote");

// small daily quotes rotate
const QUOTES = [
  "Honesty helps you grow — be truthful today.",
  "Small steps — big results.",
  "One honest day at a time.",
  "Consistency beats intensity."
];
let qIdx = Math.floor(Math.random()*QUOTES.length);
quoteEl.textContent = QUOTES[qIdx];

// initialize date to today
document.getElementById("date").value = todayString();

// form submit
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  saveEntry();
});

function gatherEntry(){
  const rawName = document.getElementById("name").value;
  const name = normalizeName(rawName);
  const date = document.getElementById("date").value;
  const wake = document.getElementById("wake").value;
  const sleep = document.getElementById("sleep").value;
  const screen = parseFloat(document.getElementById("screen").value) || 0;
  const sugar = parseInt(document.getElementById("sugar").value || 0);
  const oily = parseInt(document.getElementById("oily").value || 0);
  const violations = Array.from(document.querySelectorAll(".violation:checked")).map(n=>n.value);
  const itemsList = document.getElementById("itemsList").value.trim();
  const honesty = parseInt(document.getElementById("honesty").value);
  const honestyNote = document.getElementById("honestyNote").value.trim();

  const sleepHours = calcSleepHours(wake, sleep);

  return { name, date, wake, sleep, screen, sugar, oily, violations, itemsList, honesty, honestyNote, sleepHours };
}

function saveEntry(){
  const entry = gatherEntry();
  if(!entry.name || !entry.date){
    feedback.textContent = "Name and Date required.";
    feedback.style.color = "var(--bad)";
    return;
  }

  // load, normalize and prevent duplicates for same name+date
  const data = loadAll();
  const prevIndex = data.findIndex(d => d.name === entry.name && d.date === entry.date);
  const previousEntry = findPreviousEntry(data, entry.name, entry.date);

  // compute points based on previous entry
  entry.points = calcPoints(entry, previousEntry);
  entry.score = entry.points; // same as points for now
  entry.createdAt = new Date().toISOString();

  if(prevIndex >= 0) data[prevIndex] = entry;
  else data.push(entry);

  saveAll(data);

  // UI
  feedback.textContent = `Saved • You earned ${entry.points} pts`;
  feedback.style.color = "var(--good)";
  renderSummary();
  form.reset();
  document.getElementById("date").value = todayString();
}

function renderSummary(){
  const data = loadAll().slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const tbody = document.querySelector("#summaryTable tbody");
  tbody.innerHTML = "";

  let total = 0;
  const participants = new Set();

  data.forEach(d=>{
    participants.add(d.name);
    total += (d.points || 0);
    const tr = document.createElement("tr");
    tr.className = d.points >= 90 ? "good" : d.points >= 60 ? "warn" : "bad";
    tr.innerHTML = `<td>${d.name}</td><td>${d.date}</td><td>${d.screen}</td><td>${(d.violations||[]).length}</td><td>${d.points}</td><td>${d.points}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("statAvg").textContent = data.length ? Math.round(total/data.length) : "—";
  document.getElementById("statParticipants").textContent = participants.size || "—";
  document.getElementById("statEntries").textContent = data.length || 0;

  // charts
  drawTrendChart(data, "trendCanvas");
  drawLeaderboardChart(data, "leaderCanvas");
}

// initial render
renderSummary();
