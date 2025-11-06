// CORE APP
let data = loadData();

const form = document.getElementById("dailyForm");
const tbody = document.querySelector("#summaryTable tbody");
const fullTableBody = document.querySelector("#fullTable tbody");
const avgScoreEl = document.getElementById("avgScore");
const participantsEl = document.getElementById("participants");
const totalEntriesEl = document.getElementById("totalEntries");
const topHeadline = document.getElementById("topHeadline");
const adminBtn = document.getElementById("adminBtn");
const adminModal = document.getElementById("adminModal");
const adminPanel = document.getElementById("adminPanel");

const ADMIN_PASSWORD = "admin123"; // change this locally if you want

// rotating honesty headlines
const HONESTY_HEADLINES = [
  "Honesty fuels trust — be truthful today.",
  "A small truth each day builds character.",
  "Honesty: the habit we practice daily.",
  "Being honest helps you improve faster."
];
let headlineIdx = Math.floor(Math.random()*HONESTY_HEADLINES.length);
topHeadline.textContent = HONESTY_HEADLINES[headlineIdx];

// init
window.addEventListener("load", ()=>{
  document.getElementById("date").value = todayString();
  renderAll();
});

// form submit
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  const entry = {
    name: document.getElementById("name").value.trim() || "Anonymous",
    date: document.getElementById("date").value,
    wake: document.getElementById("wake").value,
    sleep: document.getElementById("sleep").value,
    screen: parseFloat(document.getElementById("screen").value) || 0,
    sugar: parseInt(document.getElementById("sugar").value || 0),
    oily: parseInt(document.getElementById("oily").value || 0),
    violations: Array.from(document.querySelectorAll(".violation:checked")).map(n=>n.value),
    itemsList: document.getElementById("itemsList").value.trim(),
    honesty: parseInt(document.getElementById("honesty").value || 5),
    honestyNote: document.getElementById("honestyNote").value.trim()
  };
  entry.sleepHours = calcSleepHours(entry.wake, entry.sleep);
  entry.score = calcScore(entry);
  entry.points = entry.score; // each day's points = score out of 100

  // replace existing entry for same name+date
  const idx = data.findIndex(d=> d.name === entry.name && d.date === entry.date);
  if(idx >= 0) data[idx] = entry;
  else data.push(entry);

  saveData(data);
  form.reset();
  document.getElementById("date").value = todayString();
  renderAll();
});

// RENDER
function renderAll(){
  // summary table (limited public view)
  tbody.innerHTML = "";
  // compute cumulative
  const cum = computeCumulative(data);

  // sorted by date desc
  const sorted = data.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  sorted.forEach(entry=>{
    const tr = document.createElement("tr");
    tr.className = entry.score >= 85 ? "good" : entry.score >= 60 ? "warn" : "bad";
    tr.innerHTML = `
      <td>${entry.name}</td>
      <td>${entry.date}</td>
      <td>${entry.screen}</td>
      <td>${(entry.violations||[]).length}</td>
      <td>${entry.score}</td>
      <td>${cum[entry.name] || entry.points}</td>
    `;
    tbody.appendChild(tr);
  });

  // small stats
  totalEntriesEl.textContent = data.length || 0;
  const participants = Array.from(new Set(data.map(d=>d.name))).length;
  participantsEl.textContent = participants || 0;
  avgScoreEl.textContent = data.length ? Math.round(data.reduce((s,e)=>s+e.score,0)/data.length) : "--";

  // admin full table
  fullTableBody.innerHTML = "";
  const byDateAsc = data.slice().sort((a,b)=> new Date(a.date) - new Date(b.date));
  byDateAsc.forEach(e=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.name}</td><td>${e.date}</td><td>${e.wake}</td><td>${e.sleep}</td><td>${e.screen}</td><td>${escapeHtml(e.itemsList||"")}</td><td>${(e.violations||[]).join(", ")}</td><td>${e.honesty} ${e.honestyNote?("- "+escapeHtml(e.honestyNote)):""}</td><td>${e.score}</td>`;
    fullTableBody.appendChild(tr);
  });

  // charts
  drawScoreTrend(data);
  drawLeaderboardMap(data);

  // rotate headline slowly
  headlineIdx = (headlineIdx + 1) % HONESTY_HEADLINES.length;
  setTimeout(()=> topHeadline.textContent = HONESTY_HEADLINES[headlineIdx], 8000);
}

// Admin login flow
adminBtn.addEventListener("click", ()=> adminModal.classList.remove("hidden"));
document.getElementById("adminClose").addEventListener("click", ()=> adminModal.classList.add("hidden"));
document.getElementById("adminLogin").addEventListener("click", ()=>{
  const pw = document.getElementById("adminPassword").value;
  if(pw === ADMIN_PASSWORD){
    localStorage.setItem("isAdmin", "1");
    adminModal.classList.add("hidden");
    showAdmin();
  } else {
    alert("Wrong password");
  }
});

function showAdmin(){
  if(localStorage.getItem("isAdmin") === "1"){
    adminPanel.classList.remove("hidden");
    // render leaderboard list
    const cum = computeCumulative(data);
    const arr = Object.entries(cum).sort((a,b)=> b[1]-a[1]);
    const wrap = document.getElementById("leaderboardWrap");
    wrap.innerHTML = "<ol>" + arr.map(i=>`<li><strong>${i[0]}</strong> — ${i[1]} pts</li>`).join("") + "</ol>";
  } else adminPanel.classList.add("hidden");
}

document.getElementById("adminLogout").addEventListener("click", ()=>{
  localStorage.removeItem("isAdmin");
  adminPanel.classList.add("hidden");
});

// small helpers
function escapeHtml(s){ return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

// initial admin check
if(localStorage.getItem("isAdmin")==="1") showAdmin();
