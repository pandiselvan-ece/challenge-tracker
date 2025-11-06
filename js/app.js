const form = document.getElementById("dailyForm");
const tbody = document.querySelector("#summaryTable tbody");
const reminder = document.getElementById("reminder");

let data = loadData();

window.onload = () => {
  document.getElementById("date").value = todayString();
  if (data.length) renderTable();
  checkReminder();
};

// --- Handle Form Submission ---
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    name: document.getElementById("name").value.trim(),
    date: document.getElementById("date").value,
    wake: document.getElementById("wake").value,
    sleep: document.getElementById("sleep").value,
    screen: parseFloat(document.getElementById("screen").value),
    sugar: parseInt(document.getElementById("sugar").value || 0),
    oily: parseInt(document.getElementById("oily").value || 0),
    violations: [...document.querySelectorAll(".violation:checked")].map(v => v.value)
  };

  const sleepH = calcSleepHours(entry.wake, entry.sleep);
  entry.sleepHours = sleepH;
  entry.score = calcScore(entry);

  // Prevent duplicate date
  const existing = data.find(d => d.date === entry.date && d.name === entry.name);
  if (existing) {
    Object.assign(existing, entry);
  } else {
    data.push(entry);
  }

  saveData(data);
  renderTable();
  form.reset();
  document.getElementById("date").value = todayString();
  checkReminder();
});

// --- Helpers ---
function calcSleepHours(wake, sleep) {
  if (!wake || !sleep) return 0;
  const [wh, wm] = wake.split(":").map(Number);
  const [sh, sm] = sleep.split(":").map(Number);
  let diff = (sh + sm / 60) - (wh + wm / 60);
  if (diff < 0) diff += 24;
  return diff;
}

function renderTable() {
  tbody.innerHTML = "";
  data.sort((a,b)=> new Date(a.date)-new Date(b.date))
      .forEach(entry => {
        const tr = document.createElement("tr");
        tr.className = entry.score >= 85 ? "good" : entry.score >= 60 ? "warn" : "bad";
        tr.innerHTML = `
          <td>${entry.name}</td>
          <td>${entry.date}</td>
          <td>${entry.screen}</td>
          <td>${entry.violations.length}</td>
          <td>${entry.score}</td>
        `;
        tbody.appendChild(tr);
      });
  drawChart(data);
}

function checkReminder() {
  const today = todayString();
  const filled = data.some(d => d.date === today);
  reminder.classList.toggle("hidden", filled);
}

// --- Export / Import / Reset ---
document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "challenge_data.json";
  a.click();
};

document.getElementById("importBtn").onclick = () => {
  document.getElementById("importFile").click();
};

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    data = JSON.parse(ev.target.result);
    saveData(data);
    renderTable();
  };
  reader.readAsText(file);
});

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Clear all challenge data?")) {
    localStorage.removeItem("challengeData");
    data = [];
    renderTable();
    checkReminder();
  }
};
