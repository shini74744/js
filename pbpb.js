<script>
// === 禁止 F12 / Ctrl+Shift+I/J/C ===
document.onkeydown = function(e) {
  if (
    e.keyCode === 123 || // F12
    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) // I J C
  ) {
    e.preventDefault();
    return false;
  }
};

// === 检测开发者工具 ===
let devtoolsOpen = false;

function detectDevTools() {
  const threshold = 160; // 判断阈值
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      blockPage();
    }
  } else {
    devtoolsOpen = false;
  }
}

function blockPage() {
  document.body.innerHTML = `
    <div style="width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#fff;background:#000;">
      ⚠️ 检测到开发者工具，页面已禁用<br/>勿做小偷，联系我正常获取
    </div>
  `;
  let colors = ["red", "blue"];
  let i = 0;
  setInterval(() => {
    document.body.style.backgroundColor = colors[i % 2];
    i++;
  }, 150);
}

// 定时检测
setInterval(detectDevTools, 1000);
</script>
