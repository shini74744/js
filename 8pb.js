// 哪吒监控自定义安全防护代码
(function() {

    // 显示白屏提示并启动红蓝闪烁
    function blockPageWithFlash() {
        document.body.innerHTML = '<h2 id="blockMsg" style="color:red;text-align:center;margin-top:20%;">检测到开发者工具，页面已禁用<br>勿做小偷，联系我正常获取</h2>';
        
        // 两秒后开始红蓝频闪
        setTimeout(() => {
            let isRed = true;
            setInterval(() => {
                document.body.style.backgroundColor = isRed ? 'red' : 'blue';
                document.getElementById('blockMsg').style.color = isRed ? 'blue' : 'red';
                isRed = !isRed;
            }, 200); // 每200ms切换一次颜色
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
            blockPageWithFlash();
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
            blockPageWithFlash();
            alert('检测到开发者工具，页面已禁用\n勿做小偷，联系我正常获取');
        }
        setTimeout(detectDevTools, 1000);
    })();

})();
