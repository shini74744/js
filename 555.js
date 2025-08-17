<script>
(function() {
  // 防调试（打开F12时提示）
  let devtoolsOpen = false;
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      devtoolsOpen = true;
      alert("⚠️ 请不要尝试调试代码！");
    }
  });

  // 检测开发者工具是否打开
  setInterval(() => {
    devtoolsOpen = false;
    console.log(element);
    console.clear();
    if (devtoolsOpen) {
      alert("⚠️ 检测到开发者工具已打开！");
    }
  }, 2000);

  // 桌面端 禁用右键
  document.addEventListener("contextmenu", e => e.preventDefault());

  // 移动端 禁用长按 + 多指操作 + 双击放大
  let lastTouchEnd = 0;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) {
      e.preventDefault(); // 禁止多指
    }
  }, { passive: false });

  document.addEventListener("touchend", function (e) {
    let now = Date.now();
    if (now - lastTouchEnd <= 500) {
      e.preventDefault(); // 禁止双击放大
    }
    lastTouchEnd = now;
  }, false);

  // 点击跳转（排除右键）
  document.addEventListener("mousedown", function(e) {
    if (e.button === 0) { // 左键点击才跳转
      window.location.href = "https://www.baidu.com";
    }
  });
})();
</script>
