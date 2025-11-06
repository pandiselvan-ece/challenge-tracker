function drawChart(data) {
  const canvas = document.getElementById("scoreChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scores = data.map(e => e.score);
  const barWidth = 40, gap = 10;
  const maxH = Math.max(...scores, 100);
  scores.forEach((val, i) => {
    const x = 50 + i * (barWidth + gap);
    const h = (val / maxH) * 100;
    ctx.fillStyle = val >= 85 ? "#22c55e" : val >= 60 ? "#facc15" : "#ef4444";
    ctx.fillRect(x, 130 - h, barWidth, h);
    ctx.fillStyle = "#fff";
    ctx.fillText(val, x + 8, 140);
  });
}
