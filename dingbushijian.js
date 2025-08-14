// ------------------ 网站运行时间统计 ------------------

// 1. 设置网站启动时间（可以根据实际修改）
const startTime = new Date('2024-11-28'); // 网站上线时间

// 2. 将时间差格式化为字符串
function formatRuntime(diff) {
    // diff 单位为毫秒
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); // 天数
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24); // 小时数
    const minutes = Math.floor((diff / (1000 * 60)) % 60); // 分钟数
    const seconds = Math.floor((diff / 1000) % 60); // 秒数

    // 返回格式化后的描述
    return `专业服务，术先行；网站已运行${days}天${hours}小时${minutes}分${seconds}秒`;
}

// 3. 更新运行时间
function updateRuntime() {
    const now = new Date(); // 当前时间
    const diff = now - startTime; // 计算时间差（毫秒）
    window.CustomDesc = formatRuntime(diff); // 将描述保存到全局变量
}

// 4. 初始化并每秒更新一次
updateRuntime(); // 页面加载时立即更新一次
setInterval(updateRuntime, 1000); // 每秒更新
