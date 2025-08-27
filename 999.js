(function() {
    // ---------------------------
    // 等待或创建 #message 元素
    // ---------------------------
    function waitForMessageDiv(callback) {
        let div = document.getElementById('message');
        if (!div) {
            // 创建元素
            div = document.createElement('div');
            div.id = 'message';
            // 样式
            div.style.position = 'absolute';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';
            div.style.backgroundColor = 'transparent';
            div.style.color = 'white';
            div.style.fontFamily = '"楷体", "KaiTi", serif';
            div.style.fontSize = '20px';
            div.style.padding = '10px';
            div.style.textAlign = 'center';
            div.style.display = 'none';
            div.style.zIndex = '9999';
            document.body.appendChild(div);
        }
        callback(div);
    }

    waitForMessageDiv(function(messageDiv) {
        // ---------------------------
        // 核心功能逻辑
        // ---------------------------

        // 判断是否为电脑端
        function isPC() {
            const ua = navigator.userAgent;
            const mobileKeywords = ["Android","iPhone","iPad","iPod","Windows Phone","Mobi","Mobile"];
            return !mobileKeywords.some(k => ua.includes(k));
        }

        // 随机颜色
        function getRandomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        // 判断是否晚上 9 点后
        function isAfter9PM() {
            return new Date().getHours() >= 21;
        }

        // 随机选择 API
        function getRandomAPI() {
            const apis = [
                'https://jkapi.com/api/one_yan',
                'https://jkapi.com/api/dujitang',
                'https://jkapi.com/api/saohua'
            ];
            return apis[Math.floor(Math.random() * apis.length)];
        }

        // 获取 API 地址
        function getAPI() {
            return isAfter9PM() ? 'https://jkapi.com/api/wanan' : getRandomAPI();
        }

        // 请求 API 并显示文字
        function fetchMessage() {
            if (!isPC()) {
                console.log("移动端不显示顶部文字");
                return;
            }

            const apiUrl = getAPI();

            fetch(apiUrl)
                .then(res => res.text())
                .then(data => {
                    messageDiv.textContent = data;
                    messageDiv.style.display = 'block';
                })
                .catch(err => {
                    console.error('请求错误:', err);
                    messageDiv.textContent = '加载失败，请稍后再试';
                    messageDiv.style.display = 'block';
                });

            // 每 2 秒更换一次字体颜色
            setInterval(() => {
                messageDiv.style.color = getRandomColor();
            }, 2000);
        }

        // 执行
        fetchMessage();
    });
})();
