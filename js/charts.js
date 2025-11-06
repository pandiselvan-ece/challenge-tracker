// simple chart drawing using canvas (no external libs)

function drawScoreTrend(entries){
  const canvas = document.getElementById("scoreChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const sorted = entries.slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
  if(sorted.length===0){
    ctx.fillStyle="#64748b"; ctx.font="14px Inter"; ctx.fillText("No data to chart",20,40); return;
  }

  // group by date average score
  const byDate = {};
  sorted.forEach(e=>{
    if(!byDate[e.date]) byDate[e.date]={sum:0,c:0};
    byDate[e.date].sum += e.score; byDate[e.date].c++;
  });
  const dates = Object.keys(byDate).sort();
  const scores = dates.map(d => Math.round(byDate[d].sum / byDate[d].c));

  // draw simple line chart
  const w = canvas.width, h = canvas.height, pad=30;
  const max = Math.max(100, ...scores);
  const stepX = (w - pad*2) / (scores.length - 1 || 1);
  ctx.lineWidth = 2; ctx.strokeStyle="#2563eb"; ctx.beginPath();
  scores.forEach((s,i)=>{
    const x = pad + i*stepX;
    const y = h - pad - (s/max)*(h - pad*2);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    // dot
    ctx.fillStyle = s>=85 ? "#16a34a" : s>=60 ? "#f59e0b" : "#ef4444";
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
    // value
    ctx.fillStyle="#0f1724"; ctx.font="12px Inter"; ctx.fillText(s, x-10, y-10);
  });
  ctx.stroke();

  // x labels
  ctx.fillStyle="#475569"; ctx.font="12px Inter";
  dates.forEach((d,i)=>{ const x=pad + i*stepX; ctx.fillText(d, x-20, h - 6); });
}

function drawLeaderboardMap(data){
  const canvas = document.getElementById("leaderChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const map = computeCumulative(data);
  const items = Object.entries(map).sort((a,b)=> b[1]-a[1]); // [name,points]
  if(items.length===0){
    ctx.fillStyle="#64748b"; ctx.font="14px Inter"; ctx.fillText("No leaderboard data",20,40); return;
  }
  const w=canvas.width,h=canvas.height,pad=20;
  const barH = Math.min(28, (h - pad*2) / items.length - 8);
  const max = Math.max(...items.map(i=>i[1]), 1);
  items.forEach((it,idx)=>{
    const y = pad + idx*(barH+8);
    const x=120;
    const width = (it[1]/max)*(w - x - pad);
    ctx.fillStyle = idx===0? "#2563eb" : "#60a5fa";
    ctx.fillRect(x,y,width,barH);
    ctx.fillStyle="#0f1724"; ctx.font="13px Inter"; ctx.fillText(it[0], 8, y + barH/1.6);
    ctx.fillStyle="#0f1724"; ctx.fillText(it[1]+" pts", x + width + 8, y + barH/1.6);
  });
}
