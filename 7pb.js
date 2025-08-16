// 哪吒监控自定义安全防护代码（文字闪烁版）
(function() {

    function blockPageWithTextFlash() {
        // 白屏并显示提示文字
        document.body.innerHTML = '<h2 id="blockMsg" style="text-align:center;margin-top:20%;font-size:24px;">检测到开发者工具，页面已禁用<br>勿做小偷，联系我正常获取</h2>';
        document.body.style.backgroundColor = 'white';
        document.body.style.margin = '0';
        document.body.style.height = '100vh';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'flex-start';
        document.body.style.overflow = 'hidden';

        // 两秒后开始文字颜色闪烁
        setTimeout(() => {
            setInterval(() => {
                const colors = ['red', 'blue', 'green', 'orange', 'purple'];
                const msg = document.getElementById('blockMsg');
                if (msg) {
                    msg.style.color = colors[Math.floor(Math.random() * colors.length)];
                }
            }, 200); // 每200ms切换一次文字颜色
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
            blockPageWithTextFlash();
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
            blockPageWithTextFlash();
            alert('检测到开发者工具，页面已禁用\n勿做小偷，联系我正
