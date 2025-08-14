// 生成碎片点击和返回顶部的代码

document.addEventListener("DOMContentLoaded", () => {
    /** 
     * 1. 动态创建样式表 
     *   - 把原本 <style> 里的 CSS 全部放到一个字符串
     *   - 方便直接注入到任何页面，不依赖 HTML 原始结构
     */
    const style = document.createElement("style");
    style.textContent = `
        body {
            margin: 0;
            height: 200vh;
            background-color: #1a1a1a;
            font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: white;
        }
        .fragment {
            position: fixed;
            width: 10px;
            height: 10px;
            clip-path: polygon(0 0, 100% 0, 100% 100%);
            transform-origin: center;
            animation: shatter 1.5s ease-out forwards;
            pointer-events: none;
            z-index: 9988;
            background-color: rgba(255, 255, 255, 0.8);
        }
        @keyframes shatter {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--dx), var(--dy)) rotate(var(--angle)) scale(0.5);
                opacity: 0;
            }
        }
        #backToTop {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            background-color: transparent;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s, transform 0.3s;
            display: none;
        }
        #backToTop:hover {
            transform: scale(1.1);
        }
        #backToTop::before {
            content: "🚀";
            font-size: 24px;
            display: block;
            line-height: 60px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    /** 
     * 2. 创建返回顶部按钮
     */
    const backToTopButton = document.createElement("button");
    backToTopButton.id = "backToTop";
    document.body.appendChild(backToTopButton);

    /**
     * 3. 碎玻璃特效函数
     * @param {number} x - 鼠标点击位置的 X 坐标（视口坐标）
     * @param {number} y - 鼠标点击位置的 Y 坐标（视口坐标）
     */
    function createShatterEffect(x, y) {
        const fragmentCount = 20; // 碎片数量
        for (let i = 0; i < fragmentCount; i++) {
            const fragment = document.createElement("div");
            fragment.className = "fragment";

            // 生成随机角度与距离
            const angle = Math.random() * 360;
            const distance = Math.random() * 200 + 50; // 50~250 px
            const dx = Math.cos((angle * Math.PI) / 180) * distance;
            const dy = Math.sin((angle * Math.PI) / 180) * distance;

            // 设置碎片初始位置及动画变量
            fragment.style.left = `${x}px`;
            fragment.style.top = `${y}px`;
            fragment.style.setProperty("--dx", `${dx}px`);
            fragment.style.setProperty("--dy", `${dy}px`);
            fragment.style.setProperty("--angle", `${Math.random() * 720}deg`);

            document.body.appendChild(fragment);

            // 1.5秒后移除碎片，防止 DOM 堆积
            setTimeout(() => fragment.remove(), 1500);
        }
    }

    /**
     * 4. 点击页面时触发碎玻璃特效
     */
    document.addEventListener("click", (e) => {
        createShatterEffect(e.clientX, e.clientY);
    });

    /**
     * 5. 返回顶部按钮的显隐控制
     */
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    });

    /**
     * 6. 点击返回顶部按钮，平滑滚动至顶部
     */
    backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
