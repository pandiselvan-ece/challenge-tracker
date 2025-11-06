/* app.js — user submission logic */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const resultMsg = document.getElementById("resultMsg");
  const dateInput = document.getElementById("date");

  // set today
  dateInput.value = todayString();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resultMsg.className = "resultMsg hidden";

    // gather inputs
    const rawName = document.getElementById("name").value;
    const name = normalizeName(rawName);
    const date = document.getElementById("date").value;
    const wake = document.getElementById("wake").value;
    const sleep = document.getElementById("sleep").value;
    const screen = parseFloat(document.getElementById("screen").value || 0);
    const consumed = document.getElementById("consumed").value.trim();

    if(!name || !date){
      showResult("Please enter name and date.", "error");
      return;
    }

    const entry = {
      name, date, wake, sleep, screen,
      consumed, createdAt: new Date().toISOString()
    };

    // calculate and store score but only admin sees it; still store score
    entry.score = calcScoreForEntry(entry);

    // save, replacing same name+date
    const data = loadAll();
    const idx = data.findIndex(d => d.name === name && d.date === date);
    if(idx >= 0) data[idx] = entry; else data.push(entry);
    saveAll(data);

    // show success, then reset to original template (clear all fields)
    showResult("✅ Your entry has been saved successfully!", "success");

    // fully reset form (original template)
    setTimeout(() => {
      form.reset();
      document.getElementById("date").value = todayString();
      // clear message after short delay
      setTimeout(()=> resultMsg.className = "resultMsg hidden", 2000);
    }, 1000);
  });

  function showResult(msg, type){
    resultMsg.textContent = msg;
    resultMsg.className = "resultMsg " + (type === "success" ? "success" : "error");
  }
});
