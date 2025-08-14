// ------------------ 纯 JS 雪花飘落效果 ------------------

// 1. 创建雪花样式（等同于原来的 <style> 标签内容）
const snowflakeStyle = document.createElement('style');
snowflakeStyle.textContent = `
    body {
        margin: 0;
        background: transparent;
        overflow-x: hidden;
        position: relative;
    }

    .snowflake {
        position: fixed;
        top: -10px;
        color: white;
        font-size: 10px;
        animation: fall linear infinite;
        opacity: 0.8;
        z-index: 9988; /* 确保雪花在最上层 */
        pointer-events: none; /* 防止雪花挡住点击 */
    }

    @keyframes fall {
        0% {
            transform: translateX(0px) translateY(0px);
            opacity: 0.8;
        }
        50% {
            transform: translateX(20px) translateY(50vh);
        }
        100% {
            transform: translateX(-20px) translateY(100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(snowflakeStyle);

// 2. 创建单个雪花
function createSnowflake() {
    const snowflake = document.createElement("div");
    const snowflakeCharacters = ["✼", "✽", "❄"]; // 雪花符号

    // 设置类名
    snowflake.className = "snowflake";

    // 随机选择雪花符号
    snowflake.textContent = snowflakeCharacters[Math.floor(Math.random() * snowflakeCharacters.length)];

    // 随机位置（水平）
    snowflake.style.left = Math.random() * 100 + "vw";

    // 随机下落时间（4-8秒）
    snowflake.style.animationDuration = (4 + Math.random() * 4) + "s";

    // 随机字体大小（10-30px）
    snowflake.style.fontSize = (10 + Math.random() * 20) + "px";

    // 随机透明度（0.5-1）
    snowflake.style.opacity = (0.5 + Math.random() * 0.5);

    // 添加到页面
    document.body.appendChild(snowflake);

    // 动画结束后移除雪花
    snowflake.addEventListener("animationend", () => {
        snowflake.remove();
    });
}

// 3. 控制雪花生成
function initializeSnowflakes(maxCount) {
    const interval = 2000; // 每 2 秒生成一批雪花
    let activeSnowflakes = 0;

    const createBatch = () => {
        if (activeSnowflakes < maxCount) {
            createSnowflake();
            activeSnowflakes++;
        }
    };

    // 每隔一段时间生成雪花
    setInterval(createBatch, interval);
}

// 4. 判断设备类型，控制雪花数量
const isMobile = window.innerWidth <= 768;
const snowflakeCount = isMobile ? 20 : 40; // 移动端 20 个，PC 40 个

// 5. 初始化雪花效果
initializeSnowflakes(snowflakeCount);
