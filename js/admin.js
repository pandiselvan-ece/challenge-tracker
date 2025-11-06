/* admin.js — admin view (client-side password: admin@123) */
document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PASSWORD = "admin@123"; // as requested
  const loginCard = document.getElementById("loginCard");
  const dashboard = document.getElementById("dashboard");
  const adminTableBody = document.querySelector("#adminTable tbody");
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const adminPassword = document.getElementById("adminPassword");
  const logoutBtn = document.getElementById("logoutBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const searchInput = document.getElementById("searchInput");

  function showDashboard(){
    loginCard.classList.add("hidden");
    dashboard.classList.remove("hidden");
    renderTable();
  }
  function hideDashboard(){
    dashboard.classList.add("hidden");
    loginCard.classList.remove("hidden");
  }

  adminLoginBtn.addEventListener("click", () => {
    if(adminPassword.value === ADMIN_PASSWORD){
      localStorage.setItem("ct_isAdmin", "1");
      adminPassword.value = "";
      showDashboard();
    } else alert("Wrong password");
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("ct_isAdmin");
    hideDashboard();
  });

  clearDataBtn.addEventListener("click", () => {
    if(!confirm("Clear ALL entries? This cannot be undone.")) return;
    saveAll([]);
    renderTable();
  });

  searchInput.addEventListener("input", () => renderTable());

  function renderTable(){
    const all = loadAll().slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
    const q = (searchInput.value || "").toLowerCase().trim();
    adminTableBody.innerHTML = "";

    // compute totals for leaderboard
    const totals = {};
    all.forEach(e => {
      if(!totals[e.name]) totals[e.name] = 0;
      totals[e.name] += Number(e.score) || 0;
    });

    // top scorer highlight: find max
    const maxPoints = Object.values(totals).length ? Math.max(...Object.values(totals)) : 0;
    const topNames = Object.keys(totals).filter(n => totals[n] === maxPoints);

    all.filter(e => {
      if(!q) return true;
      return e.name.toLowerCase().includes(q) || e.date.includes(q);
    }).forEach(e => {
      const tr = document.createElement("tr");
      const score = Number(e.score) || 0;
      const isTop = topNames.includes(e.name) && score === maxPoints;
      tr.innerHTML = `
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.date)}</td>
        <td>${escapeHtml(String(e.screen || ""))}</td>
        <td>${escapeHtml(e.consumed || "")}</td>
        <td><strong>${score}</strong></td>
        <td>
          <button class="btn edit">Edit</button>
          <button class="btn danger delete">Delete</button>
        </td>
      `;
      if(isTop) tr.style.background = "linear-gradient(90deg, rgba(10,154,117,0.06), rgba(15,111,255,0.03))";

      // edit: allow editing consumed or screen time
      tr.querySelector(".edit").addEventListener("click", () => {
        const newScreen = prompt("Screen time (hrs):", e.screen ?? 0);
        const newConsumed = prompt("Consumed (text):", e.consumed ?? "");
        if(newScreen === null || newConsumed === null) return;
        e.screen = parseFloat(newScreen) || e.screen;
        e.consumed = newConsumed.trim();
        e.score = calcScoreForEntry(e); // recalc
        const data = loadAll();
        const idx = data.findIndex(x => x.name === e.name && x.date === e.date);
        if(idx >= 0){ data[idx] = e; saveAll(data); renderTable(); }
      });

      // delete
      tr.querySelector(".delete").addEventListener("click", () => {
        if(!confirm(`Delete entry for ${e.name} on ${e.date}?`)) return;
        let data = loadAll();
        data = data.filter(x => !(x.name === e.name && x.date === e.date));
        saveAll(data); renderTable();
      });

      adminTableBody.appendChild(tr);
    });
  }

  function escapeHtml(s){ return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

  // auto-show dashboard if previously logged in
  if(localStorage.getItem("ct_isAdmin") === "1") showDashboard();
});
