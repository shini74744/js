// 哪吒监控终极安全防护（升级版）
(function() {

    let pageDisabled = false; // 是否已触发白屏

    // ---------- 禁止 F12 / Ctrl+Shift+I/C/J ----------
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))) {
            e.preventDefault(); // 阻止按键
        }
    });

    // ---------- 禁止右键 ----------
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

    // ---------- 白屏遮罩 ----------
    function disablePage(){
        if(pageDisabled) return;
        pageDisabled = true;
        document.body.innerHTML = '';
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top:0; left:0;
            width:100%; height:100%;
            background:#000;
            color:#fff;
            z-index:999999;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
            text-align:center;
            white-space: pre-line; /* 支持换行 */
        `;
        overlay.innerText = '检测到开发者工具，页面已禁用\n勿做小偷 联系我正常获取';
        document.body.appendChild(overlay);
    }

    // ---------- DevTools 检测 ----------
    function detectDevTools(){
        const threshold = 160;
        if(window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold){
            disablePage();
        }

        let detected = false;
        const element = new Image();
        Object.defineProperty(element, 'id', { get(){ detected = true; } });
        console.log(element);
        if(detected){ disablePage(); }

        setTimeout(detectDevTools, 1000);
    }

    // ---------- 延迟启动监控 ----------
    window.addEventListener('load', () => {
        // 延迟启动 DevTools 检测
        setTimeout(detectDevTools, 2000);

        // 延迟启动关键 DOM 监控，避免页面未渲染时误触发
        const criticalSelectors = ['.video-box', '#ip-iframe', '.snowflake']; 
        setTimeout(() => {
            setInterval(()=>{
                criticalSelectors.forEach(sel=>{
                    const elems = document.querySelectorAll(sel);
                    if(elems.length === 0){ disablePage(); }
                });
            }, 2000);
        }, 2000);
    });

})();
