// UTILITIES: storage + helpers

const STORAGE_KEY = "challengeData_v2";
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function loadData(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }catch(e){ return []; } }
function todayString(){ return new Date().toISOString().split("T")[0]; }

// Calculate sleep hours between wake and sleep times (supports overnight)
function calcSleepHours(wake, sleep){
  if(!wake||!sleep) return 0;
  const [wh,wm] = wake.split(":").map(Number);
  const [sh,sm] = sleep.split(":").map(Number);
  let start = wh + wm/60;
  let end = sh + sm/60;
  let diff = end - start;
  if(diff < 0) diff += 24;
  return Math.round(diff * 100) / 100;
}

// Score calculation (0 - 100). Start at 100, deduct per rule.
function calcScore(entry){
  let score = 100;
  // penalties (tunable)
  score -= (entry.sugar || 0) * 5;       // each sugary item -5
  score -= (entry.oily || 0) * 5;        // each oily item -5
  // screen time: first 2 hours free, then -6 points per extra hour (partial)
  if(entry.screen > 2) score -= Math.ceil((entry.screen - 2)) * 6;
  // violations
  score -= (entry.violations ? entry.violations.length : 0) * 10;
  // short sleep
  if((entry.sleepHours || 0) < 6) score -= 10;
  // honesty: if honesty less than 3, small penalty
  if((entry.honesty || 5) < 3) score -= 8;

  score = Math.round(Math.max(0, Math.min(100, score)));
  return score;
}

// compute cumulative points per user
function computeCumulative(data){
  const map = {};
  data.forEach(d=>{
    if(!map[d.name]) map[d.name]=0;
    map[d.name]+= (d.points || 0);
  });
  return map; // {name: points}
}
