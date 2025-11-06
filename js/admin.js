/* admin.js — simple admin page (client-side password) */
document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PASSWORD = "admin@tracker"; // change locally if required

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
    all.filter(e => {
      if(!q) return true;
      return e.name.toLowerCase().includes(q) || e.date.includes(q);
    }).forEach((e) => {
      const tr = document.createElement("tr");
      const violations = (e.violations || []).join(", ");
      tr.innerHTML = `
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.date)}</td>
        <td>${escapeHtml(String(e.screen ?? ""))}</td>
        <td>${escapeHtml(violations)}</td>
        <td>${escapeHtml(String(e.honesty ?? ""))}</td>
        <td>${escapeHtml(e.itemsList ?? "")}</td>
        <td>
          <button class="btn edit">Edit</button>
          <button class="btn danger delete">Delete</button>
        </td>
      `;
      // edit
      tr.querySelector(".edit").addEventListener("click", () => {
        const newScreen = prompt("Screen time (hrs):", e.screen ?? 0);
        const newHonesty = prompt("Honesty (1-5):", e.honesty ?? 5);
        if(newScreen === null || newHonesty === null) return;
        e.screen = parseFloat(newScreen) || e.screen;
        e.honesty = parseInt(newHonesty) || e.honesty;
        let data = loadAll();
        const i = data.findIndex(x => x.name === e.name && x.date === e.date);
        if(i >= 0){ data[i] = e; saveAll(data); renderTable(); }
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
