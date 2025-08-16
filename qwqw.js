(() => {
  const jumpUrl = "https://www.baidu.com"; // 自定义跳转页面

  // -------------------------------
  // 1. 禁用快捷键
  // -------------------------------
  document.addEventListener("keydown", e => {
    if (
      e.keyCode === 123 ||                     // F12
      (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
      (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
      (e.ctrlKey && e.keyCode === 85)                 // Ctrl+U
    ) {
      e.preventDefault();
      alert("检测到开发者工具快捷键，操作被阻止");
      window.location.href = jumpUrl;
    }
  });

  // -------------------------------
  // 2. 检测窗口尺寸异常变化
  // -------------------------------
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function isFullScreen() {
    return document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.msFullscreenElement;
  }

  window.addEventListener("resize", () => {
    const widthDiff = Math.abs(window.innerWidth - lastWidth);
    const heightDiff = Math.abs(window.innerHeight - lastHeight);

    if ((widthDiff > 50 || heightDiff > 50) && !isFullScreen()) {
      alert("检测到异常窗口变化，请关闭开发者工具");
      window.location.href = jumpUrl;
    }

    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;
  });

  // -------------------------------
  // 3. 反调试
  // -------------------------------
  function antiDebug() {
    setInterval(() => {
      (function(){return false;})["constructor"]("debugger")["call"]();
    }, 50);
  }

  try { antiDebug(); } catch (err) {}

  // -------------------------------
  // 4. 禁用右键
  // -------------------------------
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
    alert("右键已被禁用");
    window.location.href = jumpUrl;
  });

  // -------------------------------
  // 5. 禁止选中
  // -------------------------------
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('mousedown', e => {
    if (e.button === 2) e.preventDefault();
  });

  // CSS 防止选中
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);

})();
