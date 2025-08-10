const PALETTE = ["#ff006f", "#000000", "#dddddd"];

/* =========================
   Canvas 1: Interactive Grid
   ========================= */
new p5((p) => {
  let tiles = [];
  let cols, rows, spacingX, spacingY;
  let speed = 0.6; // scroll wheel adjusts this
  let t = 0;

  function makeGrid() {
    tiles = [];
    const w = document.getElementById("p5-canvas-1").offsetWidth || 600;
    const h = 400;
    p.resizeCanvas(w, h);

    // responsive density
    cols = Math.max(6, Math.floor(w / 100));
    rows = Math.max(3, Math.floor(h / 100));
    spacingX = w / (cols + 1);
    spacingY = h / (rows + 1);

    for (let i = 1; i <= cols; i++) {
      for (let j = 1; j <= rows; j++) {
        const x = i * spacingX;
        const y = j * spacingY;
        tiles.push({
          x, y,
          baseX: x,
          baseY: y,
          rot: p.random(p.TWO_PI),
          size: p.random(44, 72),
          mode: Math.floor(p.random(3)), // 0 circle, 1 square, 2 triangle
          col: PALETTE[Math.floor(p.random(PALETTE.length))],
          wobble: p.random(1000),
        });
      }
    }
  }

  p.setup = () => {
    const w = document.getElementById("p5-canvas-1").offsetWidth || 600;
    const c = p.createCanvas(w, 400);
    c.parent("p5-canvas-1");
    p.noStroke();
    p.angleMode(p.RADIANS);
    p.rectMode(p.CENTER);
    makeGrid();
  };

  p.windowResized = () => makeGrid();

  p.mouseWheel = (e) => {
    // Adjust animation speed with scroll
    speed = p.constrain(speed + (e.deltaY > 0 ? -0.05 : 0.05), 0.1, 2.0);
  };

  p.mousePressed = () => {
    // Toggle shape on nearest tile
    let nearest = null, bestD = Infinity;
    for (const tile of tiles) {
      const d = p.dist(p.mouseX, p.mouseY, tile.x, tile.y);
      if (d < bestD) { bestD = d; nearest = tile; }
    }
    if (nearest) nearest.mode = (nearest.mode + 1) % 3;
  };

  p.draw = () => {
    // soft background
    p.background("#ffffff");
    t += 0.005 * speed;

    for (const tile of tiles) {
      // Perlin wobble
      const n = p.noise(tile.wobble + t);
      const wob = p.map(n, 0, 1, -10, 10);
      const rotN = p.noise(tile.wobble + 100 + t) * p.TWO_PI * 0.1;

      // Hover magnetism
      const d = p.dist(p.mouseX, p.mouseY, tile.baseX, tile.baseY);
      const influence = p.constrain(1 - d / 180, 0, 1);
      const dir = p.createVector(tile.baseX - p.mouseX, tile.baseY - p.mouseY);
      dir.setMag(30 * influence);
      tile.x = tile.baseX + wob + dir.x * -0.2; // slight attraction
      tile.y = tile.baseY + wob + dir.y * -0.2;

      // Size pulse on proximity
      const size = tile.size * (1 + 0.25 * influence * Math.sin(t * 6 + tile.wobble));

      // Rotate steadily + noise
      const rot = tile.rot + rotN + t * 0.8 * (influence + 0.1);

      // Color flip when close
      const colorNear = influence > 0.5 ? PALETTE[0] : tile.col;
      p.push();
      p.translate(tile.x, tile.y);
      p.rotate(rot);
      p.fill(colorNear);

      if (tile.mode === 0) {
        // circle -> squircle-ish by blending ellipse & rect corners
        p.ellipse(0, 0, size, size);
        p.fill(PALETTE[1]);
        p.ellipse(0, 0, size * 0.3, size * 0.3);
      } else if (tile.mode === 1) {
        p.rect(0, 0, size, size, size * 0.28);
        p.fill(PALETTE[2]);
        p.rect(0, 0, size * 0.4, size * 0.4, size * 0.2);
      } else {
        const s = size * 0.9;
        p.triangle(-s * 0.6, s * 0.5, 0, -s * 0.6, s * 0.6, s * 0.5);
        p.fill(PALETTE[1]);
        p.circle(0, 0, s * 0.25);
      }
      p.pop();
    }

    // Subtle grid lines for structure
    p.push();
    p.stroke("#00000011");
    p.strokeWeight(1);
    for (let i = 1; i <= cols; i++) p.line(i * spacingX, 0, i * spacingX, p.height);
    for (let j = 1; j <= rows; j++) p.line(0, j * spacingY, p.width, j * spacingY);
    p.pop();
  };
});