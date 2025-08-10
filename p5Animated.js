const PALETTE = ["#ff006f", "#000000", "#dddddd"];



new p5((p) => {
    let particles = [];
    let glow = false;
  
    class Particle {
      constructor(x, y) {
        this.pos = p.createVector(x ?? p.random(p.width), y ?? p.random(p.height));
        this.vel = p5.Vector.random2D().mult(p.random(0.5, 2));
        this.acc = p.createVector(0, 0);
        this.r = p.random(2, 4);
        this.maxSpeed = p.random(1.5, 3);
        this.col = p.color(PALETTE[Math.floor(p.random(PALETTE.length))]);
      }
      applyForce(f) { this.acc.add(f); }
      update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        // bounce
        if (this.pos.x < 0 || this.pos.x > p.width) this.vel.x *= -1;
        if (this.pos.y < 0 || this.pos.y > p.height) this.vel.y *= -1;
        this.pos.x = p.constrain(this.pos.x, 0, p.width);
        this.pos.y = p.constrain(this.pos.y, 0, p.height);
      }
      draw() {
        if (glow) {
          p.drawingContext.shadowBlur = 12;
          p.drawingContext.shadowColor = "#ff006f";
        }
        p.noStroke();
        p.fill(this.col);
        p.circle(this.pos.x, this.pos.y, this.r * 2);
        if (glow) {
          p.drawingContext.shadowBlur = 0;
        }
      }
    }
  
    function spawnBurst(x, y, count = 20) {
      for (let i = 0; i < count; i++) {
        const pt = new Particle(x, y);
        pt.vel = p5.Vector.random2D().mult(p.random(2, 5));
        particles.push(pt);
      }
    }
  
    function resize() {
      const w = document.getElementById("p5-canvas-2").offsetWidth || 600;
      const h = 400;
      p.resizeCanvas(w, h);
    }
  
    p.setup = () => {
      const w = document.getElementById("p5-canvas-2").offsetWidth || 600;
      const c = p.createCanvas(w, 400);
      c.parent("p5-canvas-2");
      p.noStroke();
      p.background("#ffffff");
      for (let i = 0; i < 120; i++) particles.push(new Particle());
    };
  
    p.windowResized = () => resize();
  
    p.mouseDragged = () => spawnBurst(p.mouseX, p.mouseY, 1);
    p.mousePressed = () => spawnBurst(p.mouseX, p.mouseY, 1);
  
    p.keyPressed = () => {
      if (p.key === " ") {
        particles = [];
        p.background("#ffffff");
      }
      if (p.key.toLowerCase() === "g") glow = !glow;
    };
  
    p.draw = () => {
      // Motion trails
      p.background(225, 225, 225, 22); // #dddddd with alpha
  
      // Mouse gravity/repel
      const mouse = p.createVector(p.mouseX, p.mouseY);
      const isInside = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  
      for (const pt of particles) {
        if (isInside) {
          const dir = p5.Vector.sub(mouse, pt.pos);
          const d = p.constrain(dir.mag(), 1, 160);
          dir.normalize();
          // left click attract, right click repel (or hold shift to repel)
          const attracting = p.mouseIsPressed && !p.keyIsDown(p.SHIFT);
          const repel = p.mouseIsPressed && p.keyIsDown(p.SHIFT);
          const strength = attracting ? 120 : repel ? -120 : 60;
          dir.mult(strength / (d * d)); // inverse-square
          pt.applyForce(dir);
        }
  
        // Cohesion / avoid overcrowding
        let neighbors = 0;
        let center = p.createVector(0, 0);
        for (const other of particles) {
          if (other === pt) continue;
          const d2 = p.dist(pt.pos.x, pt.pos.y, other.pos.x, other.pos.y);
          if (d2 < 40) {
            center.add(other.pos);
            neighbors++;
            // simple separation
            const push = p5.Vector.sub(pt.pos, other.pos).setMag(0.01);
            pt.applyForce(push);
          }
        }
        if (neighbors > 0) {
          center.div(neighbors);
          const steer = p5.Vector.sub(center, pt.pos).mult(0.002);
          pt.applyForce(steer);
        }
  
        pt.update();
        pt.draw();
      }
  
      // Connect near neighbors with lines
      p.stroke("#00000022");
      p.strokeWeight(1);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i].pos;
          const b = particles[j].pos;
          const d = p.dist(a.x, a.y, b.x, b.y);
          if (d < 70) {
            p.line(a.x, a.y, b.x, b.y);
          }
        }
      }
  
      // UI hint
      p.noStroke();
      p.fill("#000000");
      p.textSize(12);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("Click/drag = burst • G = glow • Space = clear", 12, p.height - 10);
    };
  });