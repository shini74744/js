!function () {
    // 判断是否为移动设备（用于点数自适应）
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const defaultCount = isMobile ? 20 : 60;  // 手机端减少点数，电脑端为80

    // 获取 <script> 属性的工具函数
    function getAttr(node, attr, defaultValue) {
        return node.getAttribute(attr) || defaultValue;
    }

    // 初始化配置项
    function createCanvasConfig() {
        const scripts = document.getElementsByTagName("script");
        const currentScript = scripts[scripts.length - 1];  // 获取当前脚本
        return {
            z: 0,  // 修改 z-index 层级为0，确保在视频背景下方
            o: getAttr(currentScript, "opacity", 0.5), // 透明度
            n: parseInt(getAttr(currentScript, "count", defaultCount))  // 点的数量（默认根据设备）
        };
    }

    // 处理高清屏 + canvas 尺寸自适应
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
    }

    // 颜色插值函数：从红色渐变到蓝色
    function lerpColor(c1, c2, t) {
        return c1.map((c, i) => Math.round(c + (c2[i] - c) * t));
    }

    // RGB 数组转字符串（不含 alpha）
    function rgbToStr(rgb) {
        return `rgba(${rgb[0]},${rgb[1]},${rgb[2]}`;
    }

    // 渐变颜色：红 → 蓝
    const red = [255, 100, 100];
    const blue = [100, 150, 255];

    const config = createCanvasConfig();  // 初始化配置
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let width, height;

    // 设置 canvas 样式并插入页面
    canvas.id = "canvas-nest";
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${config.z};opacity:${config.o};pointer-events:none`;
    document.body.appendChild(canvas);  // 改为appendChild，放到body最后面，确保视频背景在canvas上方

    const points = [];
    const mouse = { x: null, y: null, max: 20000 };  // 鼠标点：用于吸引效果
    const random = Math.random;

    // 动画主循环
    function draw() {
        // 半透明背景制造拖尾
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, width, height);

        points.forEach(function (p1, i) {
            // 移动点的位置
            p1.x += p1.vx;
            p1.y += p1.vy;

            // 边界反弹
            if (p1.x > width || p1.x < 0) p1.vx *= -1;
            if (p1.y > height || p1.y < 0) p1.vy *= -1;

            // 绘制发光白色圆点
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,0.8)`;
            ctx.shadowColor = `rgba(255,255,255,0.5)`;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            // 与其他点之间连线
            for (let j = i + 1; j < allPoints.length; j++) {
                const p2 = allPoints[j];
                if (!p2.x || !p2.y) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < p2.max) {
                    // 鼠标靠近吸引效果
                    if (p2 === mouse && distSq > p2.max / 2) {
                        p1.x -= dx * 0.03;
                        p1.y -= dy * 0.03;
                    }

                    const opacity = (p2.max - distSq) / p2.max;
                    const color = lerpColor(red, blue, opacity);  // 红蓝渐变
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

        requestAnimationFrame(draw);  // 循环调用动画
    }

    // 初始化
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

    // 创建初始点
    for (let i = 0; i < config.n; i++) {
        const x = random() * window.innerWidth;
        const y = random() * window.innerHeight;
        const vx = (random() * 2 - 1);
        const vy = (random() * 2 - 1);
        points.push({ x, y, vx, vy, max: 6000 }); // 点之间最大连线距离
    }

    const allPoints = points.concat([mouse]); // 加入鼠标点
    requestAnimationFrame(draw); // 启动动画
}();
