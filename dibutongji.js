// --------------- 动态创建右下角元素并控制显示 ---------------

// 1. 创建元素
const footer = document.createElement('div');
footer.className = 'footer-background';

// 2. 添加 CSS 样式（等同于原来的 <style> 内容）
const style = document.createElement('style');
style.textContent = `
    .footer-background {
        display: none;
        background-image: url('https://api.likepoems.com/counter/get/@123a?theme=moebooru');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        height: 60px;
        width: 20vw;             /* 宽度使用视口百分比 */
        max-width: 360px;        /* 最大宽度限制 */
        min-width: 200px;        /* 最小宽度限制 */
        position: fixed;
        right: 40px;             /* 距离右边40px */
        bottom: 1px;             /* 距离底部1px */
        z-index: 9988;
        opacity: 0;              /* 初始不可见 */
        transform: scale(0);     /* 初始缩小到0 */
        transition: all 0.5s ease-in-out; /* 平滑动画 */
    }
`;
document.head.appendChild(style);

// 3. 将元素添加到页面
document.body.appendChild(footer);

// 4. 更新显示/隐藏逻辑
function updateFooterVisibility() {
    const scrollHeight = document.documentElement.scrollHeight; // 页面总高度
    const scrollPosition = window.innerHeight + window.scrollY; // 当前滚动位置（可视区+已滚动距离）

    // 小屏幕隐藏（<768px）
    if (window.innerWidth < 768) {
        footer.style.display = 'none';
        return;
    }

    // 滚动到底部时显示
    if (scrollPosition >= scrollHeight) {
        footer.style.display = 'block';
        footer.style.opacity = '1';
        footer.style.transform = 'scale(1)';
    } else {
        footer.style.opacity = '0';
        footer.style.transform = 'scale(0)';
    }
}

// 5. 事件监听（滚动、窗口大小变化、页面加载）
window.addEventListener('scroll', updateFooterVisibility);
window.addEventListener('resize', updateFooterVisibility);
window.addEventListener('load', updateFooterVisibility);
