import p5 from 'https://cdn.skypack.dev/p5';

new p5((p) => {
    let circles = [];

    p.setup = () => {
        const canvas = p.createCanvas(document.getElementById('p5-canvas-2').offsetWidth, 400);
        canvas.parent('p5-canvas-2');
        p.noStroke();

        for (let i = 0; i < 60; i++) {
            circles.push({
                x: p.random(p.width),
                y: p.random(p.height),
                r: p.random(10, 30),
                dx: p.random(-1.5, 1.5),
                dy: p.random(-1.5, 1.5),
                color: p.color(p.random(100, 255), p.random(100, 255), p.random(255), 150)
            });
        }
    };

    p.draw = () => {
        p.background(245, 245, 250, 40);

        for (let c of circles) {
            p.fill(c.color);
            p.ellipse(c.x, c.y, c.r);

            c.x += c.dx;
            c.y += c.dy;

            // bounce
            if (c.x < 0 || c.x > p.width) c.dx *= -1;
            if (c.y < 0 || c.y > p.height) c.dy *= -1;
        }

        // pointer interaction
        if (p.mouseIsPressed) {
            circles.push({
                x: p.mouseX,
                y: p.mouseY,
                r: p.random(10, 25),
                dx: p.random(-1, 1),
                dy: p.random(-1, 1),
                color: p.color(p.random(200, 255), p.random(80, 200), p.random(255), 180)
            });
        }
    };
});
