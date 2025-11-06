// Utility helpers
function calcScore(entry) {
  let score = 100;
  const penalties = {
    sugar: 10,
    oily: 10,
    screen: 10,
    violation: 10,
    sleep: 5
  };

  score -= entry.sugar * penalties.sugar;
  score -= entry.oily * penalties.oily;

  if (entry.screen > 3) score -= (entry.screen - 3) * penalties.screen;
  score -= entry.violations.length * penalties.violation;

  const sleepHours = entry.sleepHours;
  if (sleepHours < 6) score -= penalties.sleep;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function saveData(data) {
  localStorage.setItem("challengeData", JSON.stringify(data));
}

function loadData() {
  return JSON.parse(localStorage.getItem("challengeData") || "[]");
}

function todayString() {
  const t = new Date();
  return t.toISOString().split("T")[0];
}
