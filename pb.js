// 哪吒监控升级版安全防护
(function() {

    // ---------- 禁止 F12 / Ctrl+Shift+I/C/J ----------
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))) {
            e.preventDefault();
        }
    });

    // ---------- 禁止右键 ----------
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    document.addEventListener('mousedown', function(e){ if(e.button===2) e.preventDefault(); });

    // ---------- 白屏遮罩 ----------
    function disablePage(){
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
        `;
        overlay.innerText = '检测到开发者工具，页面已禁用';
        document.body.appendChild(overlay);
    }

    // ---------- DevTools 检测 ----------
    function detectDevTools(){
        const threshold = 160;
        if(window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold){
            disablePage();
        }

        // 利用 console getter 检测
        let detected = false;
        const element = new Image();
        Object.defineProperty(element, 'id', { get(){ detected = true; } });
        console.log(element);
        if(detected){ disablePage(); }

        // debugger 检测（性能帧率异常可加）
        setTimeout(detectDevTools, 1000);
    }
    detectDevTools();

    // ---------- 关键 DOM 元素监控 ----------
    const criticalSelectors = ['.video-box', '#ip-iframe', '.snowflake']; // 可加你其他重要元素
    setInterval(()=>{
        criticalSelectors.forEach(sel=>{
            const elems = document.querySelectorAll(sel);
            if(elems.length === 0){ disablePage(); }
        });
    }, 2000);

})();
