// 哪吒监控自定义安全防护代码
(function() {

    // 1️⃣ 禁止 F12 / Ctrl+Shift+I / Ctrl+Shift+C / Ctrl+Shift+J
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            alert('开发者工具已禁用');
        }
    });

    // 2️⃣ 禁止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('右键已禁用');
    });

    // 3️⃣ 检测 DevTools 打开（窗口尺寸差异）
    setInterval(function() {
        const threshold = 160; // 控制台打开时通常 width/height 改变
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            document.body.innerHTML = ''; // 页面白屏
            alert('检测到开发者工具，页面已禁用');
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
            document.body.innerHTML = ''; // 页面白屏
            alert('检测到开发者工具，页面已禁用');
        }
        setTimeout(detectDevTools, 1000);
    })();

})();
