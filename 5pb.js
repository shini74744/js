// 哪吒监控自定义安全防护代码（疯狂闪烁版）
(function() {

    // 显示白屏提示并启动疯狂红蓝闪烁
    function blockPageWithCrazyFlash() {
        document.body.innerHTML = '<h2 id="blockMsg" style="color:red;text-align:center;margin-top:20%;">检测到开发者工具，页面已禁用<br>勿做小偷，联系我正常获取</h2>';
        document.body.style.transition = 'background-color 0.1s';

        // 两秒后开始疯狂闪烁
        setTimeout(() => {
            setInterval(() => {
                // 随机背景颜色红/蓝交替，加入一点随机亮度
                const bgColor = Math.random() > 0.5 ? `rgb(${255},0,0)` : `rgb(0,0,255)`;
                const textColor = Math.random() > 0.5 ? `rgb(0,255,0)` : `rgb(255,255,0)`;
                document.body.style.backgroundColor = bgColor;
                const msg = document.getElementById('blockMsg');
                if (msg) {
                    msg.style.color = textColor;
                }
            }, 100); // 每100ms切换一次，闪烁更快
        }, 2000);
    }

    // 1️⃣ 禁止 F12 / Ctrl+Shift+I / Ctrl+Shift+C / Ctrl+Shift+J
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            alert('开发者工具已禁用\n勿做小偷，联系我正常获取');
        }
    });

    // 2️⃣ 禁止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('右键已禁用\n勿做小偷，联系我正常获取');
    });

    // 3️⃣ 检测 DevTools 打开（窗口尺寸差异）
    setInterval(function() {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            blockPageWithCrazyFlash();
            alert('检测到开发者工具，页面已禁用\n勿做小偷，联系我正常获取');
        }
    }, 1000);

    // 4️⃣ debugger 检测 DevTools
    (function detectDevTools() {
        let open = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                open = true;
            }
        });
        console.log(element);
        if (open) {
            blockPageWithCrazyFlash();
            alert('检测到开发者工具，页面已禁用\n勿做小偷，联系我正常获取');
        }
        setTimeout(detectDevTools, 1000);
    })();

})();
