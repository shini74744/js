(function() {
    // ---------------------------
    // 等待或创建 #message 元素
    // ---------------------------
    function waitForMessageDiv(callback) {
        // 尝试获取页面中已有的 #message 元素
        let div = document.getElementById('message');
        if (!div) {
            // 如果不存在，则创建一个新的 div 元素
            div = document.createElement('div');
            div.id = 'message';

            // 设置顶部文字样式
            div.style.position = 'absolute';      // 悬浮在页面顶部
            div.style.top = '0';                   // 距离页面顶部 0
            div.style.left = '0';                  // 左边距 0
            div.style.width = '100%';              // 占满整个宽度
            div.style.backgroundColor = 'transparent'; // 背景透明
            div.style.color = 'white';             // 默认字体白色
            div.style.fontFamily = '"楷体", "KaiTi", serif'; // 字体
            div.style.fontSize = '20px';           // 字号
            div.style.padding = '10px';            // 内边距
            div.style.textAlign = 'center';        // 居中显示
            div.style.display = 'none';            // 默认隐藏
            div.style.zIndex = '9999';             // 确保显示在最前面

            // 添加到页面 body
            document.body.appendChild(div);
        }
        // 回调函数，传入 div 元素
        callback(div);
    }

    // 调用等待函数，确保元素存在再执行核心逻辑
    waitForMessageDiv(function(messageDiv) {

        // ---------------------------
        // 核心功能逻辑
        // ---------------------------

        // 判断当前设备是否为电脑端
        function isPC() {
            const ua = navigator.userAgent;
            const mobileKeywords = ["Android","iPhone","iPad","iPod","Windows Phone","Mobi","Mobile"];
            // 如果用户代理包含移动设备关键字，则认为不是电脑端
            return !mobileKeywords.some(k => ua.includes(k));
        }

        // 随机生成一个十六进制颜色
        function getRandomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        // 判断当前是否为晚上 9 点及以后
        function isAfter9PM() {
            return new Date().getHours() >= 21;
        }

        // 随机选择白天使用的 API 地址
        function getRandomAPI() {
            const apis = [
                'https://jkapi.com/api/one_yan',   // 一言 API
                'https://jkapi.com/api/dujitang',  // 毒鸡汤 API
                'https://jkapi.com/api/saohua'     // 骚话 API
            ];
            // 随机返回其中一个
            return apis[Math.floor(Math.random() * apis.length)];
        }

        // 获取要请求的 API 地址（晚上 9 点后固定使用晚安 API）
        function getAPI() {
            return isAfter9PM() ? 'https://jkapi.com/api/wanan' : getRandomAPI();
        }

        // 请求 API 获取文字内容并显示
        function fetchMessage() {
            // 移动端不显示顶部文字
            if (!isPC()) {
                console.log("移动端不显示顶部文字");
                return;
            }

            const apiUrl = getAPI(); // 获取要请求的 API 地址

            // 使用 fetch 请求获取文字内容
            fetch(apiUrl)
                .then(res => res.text()) // 将响应解析为文本
                .then(data => {
                    messageDiv.textContent = data; // 设置顶部文字内容
                    messageDiv.style.display = 'block'; // 显示文字
                })
                .catch(err => {
                    console.error('请求错误:', err);
                    messageDiv.textContent = '加载失败，请稍后再试'; // 错误提示
                    messageDiv.style.display = 'block';
                });

            // 每 2 秒更换一次字体颜色
            setInterval(() => {
                messageDiv.style.color = getRandomColor();
            }, 2000);
        }

        // 页面加载后立即执行
        fetchMessage();
    });
})();
