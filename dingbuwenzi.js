// 页面 DOM 完全加载后执行
document.addEventListener('DOMContentLoaded', () => {

    // ---- 1. 创建样式 ----
    const style = document.createElement('style');
    style.textContent = `
        /* 顶部文字框样式 */
        #message {
            position: absolute;      /* 悬浮在页面顶部 */
            top: 0;
            left: 0;
            width: 100%;             /* 宽度占满页面 */
            background-color: transparent; /* 背景透明 */
            color: white;            /* 默认字体白色 */
            font-family: "楷体", "KaiTi", serif; /* 字体楷体 */
            font-size: 20px;         /* 字体大小 */
            padding: 10px;           /* 内边距 */
            text-align: center;      /* 居中显示 */
            display: none;           /* 默认隐藏 */
            z-index: 9999;           /* 显示在最前面 */
        }
    `;
    document.head.appendChild(style);

    // ---- 2. 判断是否为电脑端 ----
    function isPC() {
        const userAgent = navigator.userAgent;
        const mobileKeywords = ["Android", "iPhone", "iPad", "iPod", "Windows Phone", "Mobi", "Mobile"];
        // 如果包含移动设备关键字，则认为是移动端
        return !mobileKeywords.some(keyword => userAgent.includes(keyword));
    }

    // ---- 3. 随机生成颜色 ----
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // ---- 4. 判断是否是晚上9点后 ----
    function isAfter9PM() {
        const hours = new Date().getHours();
        return hours >= 21;
    }

    // ---- 5. 随机选择 API ----
    function getRandomAPI() {
        const apis = [
            'https://jkapi.com/api/one_yan',   // 一言
            'https://jkapi.com/api/dujitang',  // 毒鸡汤
            'https://jkapi.com/api/saohua'     // 骚话
        ];
        return apis[Math.floor(Math.random() * apis.length)];
    }

    // ---- 6. 获取要请求的 API，根据时间选择 ----
    function getAPI() {
        return isAfter9PM() ? 'https://jkapi.com/api/wanan' : getRandomAPI();
    }

    // ---- 7. 创建顶部文字 DOM 元素 ----
    const messageDiv = document.createElement('div');
    messageDiv.id = 'message';
    messageDiv.textContent = '加载中...';
    document.body.appendChild(messageDiv);

    // ---- 8. 请求 API 并显示文字 ----
    function fetchMessage() {
        // 如果是移动端，则不显示
        if (!isPC()) {
            console.log("当前为移动端，不显示顶部文字");
            return;
        }

        const apiUrl = getAPI(); // 获取 API 地址

        // 使用 Fetch 请求 API
        fetch(apiUrl)
            .then(res => res.text())  // 获取文本响应
            .then(data => {
                messageDiv.textContent = data;  // 显示获取到的文字
                messageDiv.style.display = 'block'; // 显示顶部文字框

                // 每 2 秒更换一次字体颜色（随机色）
                setInterval(() => {
                    messageDiv.style.color = getRandomColor();
                }, 2000);
            })
            .catch(err => {
                // 请求失败时显示错误信息
                console.error('请求错误:', err);
                messageDiv.textContent = '加载失败，请稍后再试';
                messageDiv.style.display = 'block';

                // 同样每 2 秒更换一次字体颜色
                setInterval(() => {
                    messageDiv.style.color = getRandomColor();
                }, 2000);
            });
    }

    // ---- 9. 执行获取文字功能 ----
    fetchMessage();

});
