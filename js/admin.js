
const ADMIN_PASSWORD = "admin@tracker"; // change here locally if desired

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const adminPwd = document.getElementById("adminPwd");
const logoutBtn = document.getElementById("logoutBtn");
const clearBtn = document.getElementById("clearBtn");
const adminTableBody = document.querySelector("#adminTable tbody");
const searchInput = document.getElementById("searchInput");
const sortPointsBtn = document.getElementById("sortPointsBtn");
const awardsWrap = document.getElementById("awardsWrap");

let adminData = [];

function showDashboard(){
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadAndRender();
}

function hideDashboard(){
  dashboard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

// login
loginBtn.addEventListener("click", ()=>{
  if(adminPwd.value === ADMIN_PASSWORD){
    localStorage.setItem("ct_isAdmin", "1");
    showDashboard();
  } else {
    alert("Wrong password");
  }
});

// logout
logoutBtn && logoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem("ct_isAdmin");
  adminPwd.value = "";
  hideDashboard();
});

// clear all data (admin)
clearBtn.addEventListener("click", ()=>{
  if(!confirm("Clear ALL challenge data? This cannot be undone.")) return;
  saveAll([]);
  loadAndRender();
});

// search & sort
searchInput.addEventListener("input", ()=> loadAndRender());
let sortDesc = true;
sortPointsBtn.addEventListener("click", ()=>{
  sortDesc = !sortDesc;
  sortPointsBtn.textContent = sortDesc ? "Sort by Points ↓" : "Sort by Points ↑";
  loadAndRender();
});

// loads data and renders admin table and charts
function loadAndRender(){
  adminData = loadAll();
  renderAdminTable(adminData);
  renderAwards(adminData);
  drawTrendChart(adminData, "adminTrend");
  drawLeaderboardChart(adminData, "adminLeader");
}

function renderAdminTable(data){
  const q = (searchInput.value || "").toLowerCase().trim();
  let filtered = data.filter(d => {
    if(!q) return true;
    return (d.name||"").toLowerCase().includes(q) || (d.date||"").includes(q);
  });

  // compute cumulative for sorting
  const cum = computeCumulative(data);
  // create rows
  adminTableBody.innerHTML = "";
  // attach points as cell, include edit/delete
  filtered.sort((a,b)=>{
    if(sortDesc){
      return (b.points||0) - (a.points||0);
    } else return (a.points||0) - (b.points||0);
  }).forEach((d, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.name}</td><td>${d.date}</td><td>${d.wake||""}</td><td>${d.sleep||""}</td><td>${d.screen||0}</td><td>${(d.violations||[]).join(", ")}</td><td>${d.honesty||5}</td><td>${d.points}</td><td>${d.points}</td>
      <td>
        <button class="btn edit" data-i="${idx}">Edit</button>
        <button class="btn danger delete" data-date="${d.date}" data-name="${d.name}">Delete</button>
      </td>`;
    adminTableBody.appendChild(tr);
  });

  // attach delete handlers
  document.querySelectorAll(".delete").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const name = btn.dataset.name;
      const date = btn.dataset.date;
      if(!confirm(`Delete entry for ${name} on ${date}?`)) return;
      let arr = loadAll();
      arr = arr.filter(x => !(x.name === name && x.date === date));
      saveAll(arr);
      loadAndRender();
    });
  });

  // edit handlers (simple: prompt fields)
  document.querySelectorAll(".edit").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const rowIdx = parseInt(btn.dataset.i);
      const entries = loadAll();
      const entry = entries[rowIdx];
      if(!entry) { alert("Unable to find entry."); return; }
      // simple prompt edit for screen & honesty
      const newScreen = prompt("Screen time (hrs):", entry.screen);
      const newHonesty = prompt("Honesty (1-5):", entry.honesty);
      if(newScreen === null || newHonesty === null) return;
      entry.screen = parseFloat(newScreen) || entry.screen;
      entry.honesty = parseInt(newHonesty) || entry.honesty;
      // recalc sleepHours and points using previous entry for this user and date
      entry.sleepHours = calcSleepHours(entry.wake, entry.sleep);
      const prev = findPreviousEntry(entries, entry.name, entry.date);
      entry.points = calcPoints(entry, prev);
      entries[rowIdx] = entry;
      saveAll(entries);
      loadAndRender();
    });
  });
}

function renderAwards(data){
  awardsWrap.innerHTML = "";
  const cum = computeCumulative(data);
  const arr = Object.entries(cum).map(([name, o]) => ({ name, points: o.points, entries: o.entries, avg: o.entries? Math.round(o.sumScore / o.entries):0 }));
  arr.sort((a,b)=> b.points - a.points);
  // show top 3 with medals
  const medals = ["🥇","🥈","🥉"];
  arr.slice(0,3).forEach((p,i)=>{
    const div = document.createElement("div");
    div.className = "award";
    div.innerHTML = `<div class="medal">${medals[i] || ""}</div><div><strong>${p.name||"—"}</strong><div class="muted">${p.points} pts • ${p.entries} entries</div></div>`;
    awardsWrap.appendChild(div);
  });
  if(arr.length===0) awardsWrap.textContent = "No data yet";
}

// on load: if admin flag present, show dashboard automatically
if(localStorage.getItem("ct_isAdmin") === "1"){
  showDashboard();
}
