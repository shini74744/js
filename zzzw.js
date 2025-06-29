!function () {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const defaultCount = isMobile ? 20 : 60;

    function getAttr(node, attr, defaultValue) {
        return node.getAttribute(attr) || defaultValue;
    }

    function createCanvasConfig() {
        const scripts = document.getElementsByTagName("script");
        const currentScript = scripts[scripts.length - 1];
        return {
            z: -1,  // ✅ 保证在最底层，避免遮挡
            o: getAttr(currentScript, "opacity", 0.4),  // 可调透明度
            n: parseInt(getAttr(currentScript, "count", defaultCount))
        };
    }

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
    }

    function lerpColor(c1, c2, t) {
        return c1.map((c, i) => Math.round(c + (c2[i] - c) * t));
    }

    function rgbToStr(rgb) {
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]}`;
    }

    const red = [255, 100, 100];
    const blue = [100, 150, 255];

    const config = createCanvasConfig();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let width, height;

    canvas.id = "canvas-nest";
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${config.z};opacity:${config.o};pointer-events:none`;
    document.body.insertBefore(canvas, document.body.firstChild);  // ✅ 插入最底部

    const points = [];
    const mouse = { x: null, y: null, max: 20000 };
    const random = Math.random;

    function draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, width, height);

        points.forEach(function (p1, i) {
            p1.x += p1.vx;
            p1.y += p1.vy;

            if (p1.x > width || p1.x < 0) p1.vx *= -1;
            if (p1.y > height || p1.y < 0) p1.vy *= -1;

            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,0.8)`;
            ctx.shadowColor = `rgba(255,255,255,0.5)`;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            for (let j = i + 1; j < allPoints.length; j++) {
                const p2 = allPoints[j];
                if (!p2.x || !p2.y) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < p2.max) {
                    if (p2 === mouse && distSq > p2.max / 2) {
                        p1.x -= dx * 0.03;
                        p1.y -= dy * 0.03;
                    }

                    const opacity = (p2.max - distSq) / p2.max;
                    const color = lerpColor(red, blue, opacity);
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = `${rgbToStr(color)},${opacity})`;
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = `${rgbToStr(color)},${opacity})`;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        });

        requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    for (let i = 0; i < config.n; i++) {
        const x = random() * window.innerWidth;
        const y = random() * window.innerHeight;
        const vx = (random() * 2 - 1);
        const vy = (random() * 2 - 1);
        points.push({ x, y, vx, vy, max: 6000 });
    }

    const allPoints = points.concat([mouse]);
    requestAnimationFrame(draw);
}();
