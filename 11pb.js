// 哪吒监控安全防护脚本 - 安全版（仅在用户触发 DevTools 时白屏）
(function() {

    // 1️⃣ 阻止 F12 / Ctrl+Shift+I / C / J，并触发白屏
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            disablePage();
        }
    });

    // 2️⃣ 禁止右键
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('右键已禁用');
    });

    // 3️⃣ 白屏处理函数
    function disablePage() {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;
                        text-align:center;font-size:18px;color:red;line-height:2;">
                检测到开发者工具，页面已禁用<br>
                勿做小偷 联系我正常获取
            </div>`;
        throw new Error('DevTools detected'); // 阻止后续脚本执行
    }

})();
