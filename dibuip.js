// 底部ip查询的显示代码
// ------------------ 纯 JS 版本：底部 IP iframe ------------------

// 创建 iframe 容器
const ipIframeWrapper = document.createElement('div');
ipIframeWrapper.id = 'ip-iframe';
ipIframeWrapper.style.cssText = `
    position: fixed;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    width: 90%;
    max-width: 650px;
    height: 125px;
    z-index: 9988;
    opacity: 0;
    transition: opacity 0.5s ease, transform 0.5s ease;
    pointer-events: none;
`;

// 创建 iframe 元素
const ipIframe = document.createElement('iframe');
ipIframe.src = 'https://ip.skk.moe/simple-dark';
ipIframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

// 添加 iframe 到容器
ipIframeWrapper.appendChild(ipIframe);

// 添加容器到页面
document.body.appendChild(ipIframeWrapper);

// 判断是否为桌面设备
function isDesktop() {
    return !/Mobi|Android/i.test(navigator.userAgent);
}

// 如果是移动端，直接隐藏整个容器
if (!isDesktop()) {
    ipIframeWrapper.style.display = 'none';
}

// 保存计时器和上一次滚动位置
let timeoutId = null;
let lastScrollY = window.scrollY;

// 监听滚动事件
window.addEventListener('scroll', function () {
    const currentScrollY = window.scrollY;
    const pageHeight = document.documentElement.scrollHeight; // 页面总高度
    const viewportHeight = window.innerHeight; // 视口高度
    const scrolledToBottom = viewportHeight + currentScrollY >= pageHeight - 2; // 允许 2px 误差

    if (currentScrollY < lastScrollY) {
        // 向上滚动 → 立即隐藏
        clearTimeout(timeoutId);
        hideIframe();
    } else {
        // 向下滚动且到达底部 → 显示
        if (isDesktop() && scrolledToBottom) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // 再次确认仍然在底部
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                    showIframe();
                }
            }, 300); // 延迟 300ms，避免误触
        } else {
            // 没到达底部 → 隐藏
            clearTimeout(timeoutId);
            hideIframe();
        }
    }

    // 更新上一次的滚动位置
    lastScrollY = currentScrollY;
});

// 显示 iframe
function showIframe() {
    ipIframeWrapper.style.opacity = '1';
    ipIframeWrapper.style.transform = 'translateX(-50%) translateY(0)';
    ipIframeWrapper.style.pointerEvents = 'auto';
}

// 隐藏 iframe
function hideIframe() {
    ipIframeWrapper.style.opacity = '0';
    ipIframeWrapper.style.transform = 'translateX(-50%) translateY(20px)';
    ipIframeWrapper.style.pointerEvents = 'none';
}
