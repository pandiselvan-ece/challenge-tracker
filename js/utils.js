/* js/utils.js
   Helper functions, storage, normalization & scoring logic.
   Scoring rules:
   - base 100 points
   - each violation (tea/sugar/oily/reels) => -25
   - each sugary item => -4 points
   - each oily item => -4 points
   - screen time: first 2 hours free; each extra hour (or part) => -6
   - honesty < 3 => -15
   - improvement bonuses vs user's previous day:
       * if screen time reduced -> +10
       * if violations reduced -> +10
   - perfect day (no violations, honesty 5) -> +10 bonus
   - points are clamped to [0, 130]
*/

const STORAGE_KEY = "ct_v2_challengeData";

function saveAll(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadAll(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch(e){ return []; }
}

function normalizeName(raw){
  if(!raw) return "Anonymous";
  raw = raw.trim();
  // lowercase then title-case each word
  return raw.toLowerCase().split(/\s+/).map(w => w[0]?.toUpperCase()+w.slice(1)).join(" ");
}

function todayString(){
  return new Date().toISOString().split("T")[0];
}

// compute difference in hours wake->sleep (supports overnight)
function calcSleepHours(wake, sleep){
  if(!wake || !sleep) return 0;
  const [wh, wm] = wake.split(":").map(Number);
  const [sh, sm] = sleep.split(":").map(Number);
  let start = wh + wm/60;
  let end = sh + sm/60;
  let diff = end - start;
  if(diff < 0) diff += 24;
  return Math.round(diff*100)/100;
}

// find previous entry date for same user (closest earlier date)
function findPreviousEntry(data, name, date){
  const entries = data.filter(e => e.name === name && e.date < date).sort((a,b)=> new Date(b.date)-new Date(a.date));
  return entries[0] || null;
}

// scoring logic
function calcPoints(entry, previousEntry){
  let pts = 100;

  // violations count list length passed in entry.violations
  const vcount = (entry.violations || []).length;
  pts -= vcount * 25;

  // sugary/oily
  pts -= (entry.sugar || 0) * 4;
  pts -= (entry.oily || 0) * 4;

  // screen time: first 2 hours free
  if(entry.screen > 2){
    const extra = Math.ceil((entry.screen - 2));
    pts -= extra * 6;
  }

  // short sleep
  if((entry.sleepHours || 0) < 6) pts -= 6;

  // honesty
  if((entry.honesty || 5) < 3) pts -= 15;

  // improvement bonuses if previous exists
  if(previousEntry){
    if(entry.screen < (previousEntry.screen || 0)) pts += 10;
    if((entry.violations || []).length < (previousEntry.violations || []).length) pts += 10;
  }

  // perfect day bonus
  if(vcount === 0 && (entry.honesty || 5) === 5) pts += 10;

  // clamp
  pts = Math.round(Math.max(0, Math.min(130, pts)));
  return pts;
}

// compute cumulative points per user
function computeCumulative(data){
  const map = {};
  data.forEach(d=>{
    if(!map[d.name]) map[d.name] = {points:0, entries:0, sumScore:0};
    map[d.name].points += (d.points || 0);
    map[d.name].entries += 1;
    map[d.name].sumScore += (d.points || 0);
  });
  return map;
}
