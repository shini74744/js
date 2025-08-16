(function() {
    const blockPage = () => {
        document.body.innerHTML = '<h2 style="color:red;text-align:center;margin-top:20%;">页面已禁用</h2>';
    };

    // 禁用 F12 / Ctrl+Shift+I/J/C
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))) {
            e.preventDefault();
            blockPage();
        }
    });

    // 禁用右键
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
    });

    // DevTools 检测（尺寸变化）
    const threshold = 160;
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
            blockPage();
        }
    }, 1000);
})();
