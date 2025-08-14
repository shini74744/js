// 顶部左边的图片api实现代码

// 等待 DOM 加载完成再执行
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 页面背景样式设置 ---------- */
    document.body.style.margin = '0'; // 去掉默认外边距
    document.body.style.backgroundImage = "url('your-background.jpg')"; // 设置背景图片
    document.body.style.backgroundSize = 'cover'; // 背景填充整个页面
    document.body.style.backgroundPosition = 'center'; // 背景居中
    document.body.style.minHeight = '200vh'; // 高度为视口两倍，允许滚动
    document.body.style.overflowY = 'scroll'; // 始终显示竖向滚动条

    /* ---------- 创建插图元素 ---------- */
    const illustration = document.createElement('div');
    illustration.id = 'illustration';

    // 设置插图样式
    Object.assign(illustration.style, {
        position: 'absolute', // 绝对定位
        width: '100px',
        height: '100px',
        backgroundImage: "url('https://api.vvhan.com/api/avatar/dm')", // 插图背景图
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        top: '50px', // 初始纵向位置
        left: '50px', // 初始横向位置
        cursor: 'grab', // 鼠标样式
        userSelect: 'none', // 禁止选中
        zIndex: '9999' // 显示在最上层
    });

    /* ---------- 设备检测：只在电脑端显示 ---------- */
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }

    if (!isMobileDevice()) {
        document.body.appendChild(illustration); // 电脑端添加到页面
    } else {
        // 移动端不显示插图
        return;
    }

    /* ---------- 拖拽逻辑 ---------- */
    let isDragging = false; // 标记是否正在拖拽
    let offsetX = 0, offsetY = 0; // 鼠标点相对于插图左上角的偏移

    // 目标区域定义（与原代码一致）
    const targetX = 300;
    const targetY = 500;
    const targetWidth = 200;
    const targetHeight = 200;

    // 鼠标按下事件：开始拖拽
    illustration.addEventListener('mousedown', (e) => {
        isDragging = true;
        // 记录鼠标点击处与插图左上角的距离
        const rect = illustration.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        illustration.style.cursor = 'grabbing';

        // 显示滚动条
        document.documentElement.style.overflow = 'visible';
    });

    // 鼠标移动事件：更新插图位置
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            illustration.style.left = (e.clientX - offsetX) + 'px';
            illustration.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    // 鼠标松开事件：停止拖拽 + 检查是否进入目标区域
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            illustration.style.cursor = 'grab';
            document.documentElement.style.overflow = ''; // 恢复滚动条默认

            // 获取插图位置和大小
            const illusRect = illustration.getBoundingClientRect();

            // 判断插图是否完全在目标区域内
            if (
                illusRect.left >= targetX &&
                illusRect.top >= targetY &&
                illusRect.right <= targetX + targetWidth &&
                illusRect.bottom <= targetY + targetHeight
            ) {
                // 居中放置到目标区域
                illustration.style.left =
                    (targetX + (targetWidth - illusRect.width) / 2) + 'px';
                illustration.style.top =
                    (targetY + (targetHeight - illusRect.height) / 2) + 'px';
            }
        }
    });

});
