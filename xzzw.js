!function () {
    // 判断是否为桌面端（简单 UA 判断）
    var isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isDesktop) return;

    function getAttr(node, attr, defaultValue) {
        return node.getAttribute(attr) || defaultValue;
    }

    function createCanvasConfig() {
        const scripts = document.getElementsByTagName("script");
        const currentScript = scripts[scripts.length - 1];
        return {
            l: scripts.length,
            z: 10, // z-index 可自定义
            o: getAttr(currentScript, "opacity", 0.5),
            c: getAttr(currentScript, "color", "0,0,0"),
            n: parseInt(getAttr(currentScript, "count", 60))  // 点数量默认60
        };
    }

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // 高清屏支持
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
    }

    function lerpColor(color1, color2, t) {
        // 简单线性插值颜色，color为 [r,g,b]
        return color1.map((c, i) => Math.round(c + (color2[i] - c) * t));
    }

    function rgbToStr(rgb) {
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]}`;
    }

    // 预设两个线条渐变颜色，随距离插值
    const lineColorStart = [255, 100, 100]; // 红色调
    const lineColorEnd = [100, 150, 255];   // 蓝色调

    const config = createCanvasConfig();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let width, height;

    canvas.id = "canvas-nest";
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${config.z};opacity:${config.o};pointer-events:none`;
    document.body.insertBefore(canvas, document.body.firstChild);

    let points = [], allPoints;
    const mouse = { x: null, y: null, max: 20000 };
    const random = Math.random;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", function () {
        mouse.x = null;
        mouse.y = null;
    });

    // 初始化点，max增大让连线范围更广
    for (let i = 0; i < config.n; i++) {
        const x = random() * window.innerWidth;
        const y = random() * window.innerHeight;
        const vx = (random() * 2 - 1);
        const vy = (random() * 2 - 1);
        points.push({ x, y, vx, vy, max: 10000 });
    }

    allPoints = points.concat([mouse]);

    function drawLines() {
        // 拖尾效果：半透明白色覆盖
        ctx.fillStyle = `rgba(255,255,255,0.1)`;
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 500; // 用于线宽脉动

        points.forEach(function (p1, i) {
            p1.x += p1.vx;
            p1.y += p1.vy;

            if (p1.x > width || p1.x < 0) p1.vx *= -1;
            if (p1.y > height || p1.y < 0) p1.vy *= -1;

            // 画发光圆点
            ctx.beginPath();
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${config.c},0.8)`;
            ctx.fillStyle = `rgba(${config.c},1)`;
            ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            for (let j = i + 1; j < allPoints.length; j++) {
                const p2 = allPoints[j];
                if (p2.x == null || p2.y == null) continue;
                let xDist = p1.x - p2.x;
                let yDist = p1.y - p2.y;
                let distSq = xDist * xDist + yDist * yDist;

                if (distSq < p2.max) {
                    if (p2 === mouse && distSq >= p2.max / 2) {
                        p1.x -= 0.03 * xDist;
                        p1.y -= 0.03 * yDist;
                    }
                    let opacity = (p2.max - distSq) / p2.max;

                    // 线条颜色渐变，t=opacity
                    const rgb = lerpColor(lineColorStart, lineColorEnd, opacity);

                    ctx.beginPath();
                    // 线宽带脉动
                    ctx.lineWidth = (Math.sin(time + i + j) * 0.5 + 1) * opacity / 2;
                    ctx.strokeStyle = `${rgbToStr(rgb)},${opacity + 0.2})`;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `${rgbToStr(rgb)},${opacity + 0.5})`;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        });
        requestAnimationFrame(drawLines);
    }

    requestAnimationFrame(drawLines);
}();
