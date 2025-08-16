// 哪吒监控自定义安全防护代码（疯狂闪动版）
(function() {

    function blockPageWithCrazyFlash() {
        document.body.innerHTML = '<h2 id="blockMsg" style="color:red;text-align:center;margin-top:20%;">检测到开发者工具，页面已禁用<br>勿做小偷，联系我正常获取</h2>';
        document.body.style.transition = 'none';
        document.body.style.margin = '0';
        document.body.style.height = '100vh';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.overflow = 'hidden';

        // 两秒后开始疯狂闪烁和抖动
        setTimeout(() => {
            setInterval(() => {
                // 背景红蓝交替
                const bgColor = Math.random() > 0.5 ? 'red' : 'blue';
                document.body.style.backgroundColor = bgColor;

                // 文字颜色随机
                const msg = document.getElementById('blockMsg');
                if (msg) {
                    msg.style.color = Math.random() > 0.5 ? 'yellow' : 'green';
                }

                // 页面抖动
                const offsetX = Math.floor(Math.random() * 20 - 10); // -10 ~ 10 px
                const offsetY = Math.floor(Math.random() * 20 - 10);
                document.body.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }, 100); // 每100ms更新
        }, 2000);
    }

    // 禁止 F12 / Ctrl+Shift+I / Ctrl+Shift+C / Ctrl+Shift+J
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            alert('开发者工具已禁用\n勿做小偷，联系我正常获取');
        }
    });

    // 禁止右键
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('右键已禁用\n勿做小偷，联系我正常获取');
    });

    // 检测 DevTools（窗口尺寸差异）
    setInterval(function() {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            blockPageWithCrazyFlash();
            alert('检测到开发者工具，页面已禁用\n勿做小偷，联系我正常获取');
        }
    }, 1000);

    // debugger 检测 DevTools
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
