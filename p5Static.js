import p5 from 'https://cdn.skypack.dev/p5';

new p5((p) => {
  p.setup = () => {
    const canvas = p.createCanvas(document.getElementById('p5-canvas-1').offsetWidth, 400);
    canvas.parent('p5-canvas-1');
    p.noLoop();
    p.noStroke();
    p.background('#f4f4f4');

    // Grid layout
    const cols = 5;
    const rows = 3;
    const spacingX = p.width / (cols + 1);
    const spacingY = p.height / (rows + 1);

    const palette = ['#FF595E', '#1982C4', '#FFCA3A', '#6A4C93'];

    for (let i = 1; i <= cols; i++) {
      for (let j = 1; j <= rows; j++) {
        const x = i * spacingX;
        const y = j * spacingY;
        const shapeType = p.int(p.random(3));
        const c = p.random(palette);

        p.fill(c);

        if (shapeType === 0) {
          p.circle(x, y, 60);
        } else if (shapeType === 1) {
          p.square(x - 30, y - 30, 60);
        } else {
          p.triangle(x - 30, y + 30, x, y - 30, x + 30, y + 30);
        }
      }
    }
  };
});
