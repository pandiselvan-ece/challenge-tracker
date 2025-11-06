/* app.js — submission page logic (no charts) */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const resultMsg = document.getElementById("resultMsg");
  const dateInput = document.getElementById("date");

  // init date
  dateInput.value = todayString();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resultMsg.className = "resultMsg hidden";

    const rawName = document.getElementById("name").value;
    const name = normalizeName(rawName);
    const date = document.getElementById("date").value;
    const wake = document.getElementById("wake").value;
    const sleep = document.getElementById("sleep").value;
    const screen = parseFloat(document.getElementById("screen").value || 0);
    const sugar = parseInt(document.getElementById("sugar").value || 0);
    const oily = parseInt(document.getElementById("oily").value || 0);
    const violations = Array.from(document.querySelectorAll(".violation:checked")).map(n => n.value);
    const itemsList = document.getElementById("itemsList").value.trim();
    const honesty = parseInt(document.getElementById("honesty").value);
    const honestyNote = document.getElementById("honestyNote").value.trim();
    const sleepHours = calcSleepHours(wake, sleep);

    if(!name || !date){
      showResult("Please enter name and date.", "error");
      return;
    }

    const entry = { name, date, wake, sleep, screen, sugar, oily, violations, itemsList, honesty, honestyNote, sleepHours, createdAt: new Date().toISOString() };

    // store, replace existing same name+date
    const data = loadAll();
    const idx = data.findIndex(d => d.name === name && d.date === date);
    if(idx >= 0) data[idx] = entry; else data.push(entry);
    saveAll(data);

    showResult("✅ Your entry has been saved successfully!", "success");

    // keep name, reset others
    const keepName = document.getElementById("name").value;
    form.reset();
    document.getElementById("name").value = keepName;
    document.getElementById("date").value = todayString();

    // hide message after 3.5s
    setTimeout(() => { resultMsg.className = "resultMsg hidden"; }, 3500);
  });

  function showResult(msg, type){
    resultMsg.textContent = msg;
    resultMsg.className = "resultMsg " + (type === "success" ? "success" : "error");
  }
});
