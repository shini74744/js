// 哪吒监控安全防护脚本 - 安全版
(function() {

    // 1️⃣ 阻止 F12 / Ctrl+Shift+I / C / J
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            alert('开发者工具已禁用');
        }
    });

    // 2️⃣ 禁止右键
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('右键已禁用');
    });

    // 3️⃣ 延迟 DevTools 检测启动，避免误触发
    function startDevToolsDetection() {
        const threshold = 160; // 控制台打开时通常 width/height 改变
        setInterval(function() {
            if (window.outerWidth - window.innerWidth > threshold || 
                window.outerHeight - window.innerHeight > threshold) {
                disablePage();
            }
        }, 1000);

        // debugger 检测
        (function detectDebugger() {
            let open = false;
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function() { open = true; }
            });
            console.log(element);
            if(open) disablePage();
            setTimeout(detectDebugger, 1000);
        })();
    }

    // 4️⃣ 白屏处理函数
    function disablePage() {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;
                        text-align:center;font-size:18px;color:red;line-height:2;">
                检测到开发者工具，页面已禁用<br>
                勿做小偷 联系我正常获取
            </div>`;
        throw new Error('DevTools detected'); // 阻止后续脚本执行
    }

    // 延迟 3 秒再启动检测，确保新用户页面渲染完成
    window.addEventListener('load', function() {
        setTimeout(startDevToolsDetection, 3000);
    });

})();
