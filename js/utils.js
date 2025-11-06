/* utils.js — storage, normalization, small helpers */
const STORAGE_KEY = "challenge_v3_data";

function loadAll(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch(e){ return []; }
}
function saveAll(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function normalizeName(name){
  if(!name) return "Anonymous";
  return name.trim().toLowerCase().split(/\s+/).map(w => w[0]?.toUpperCase()+w.slice(1)).join(" ");
}

function todayString(){
  return new Date().toISOString().split("T")[0];
}

function calcSleepHours(wake, sleep){
  if(!wake || !sleep) return 0;
  const [wh,wm] = wake.split(":").map(Number);
  const [sh,sm] = sleep.split(":").map(Number);
  let start = wh + wm/60;
  let end = sh + sm/60;
  let diff = end - start;
  if(diff < 0) diff += 24;
  return Math.round(diff*100)/100;
}
