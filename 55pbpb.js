<script>
(function() {
  let flashing = false;

  function startFlashing() {
    if (flashing) return;
    flashing = true;
    let colors = ["red", "blue"];
    let i = 0;
    setInterval(() => {
      document.body.style.backgroundColor = colors[i % 2];
      document.body.innerHTML = `
        <div style="
          color: white;
          font-size: 30px;
          font-weight: bold;
          text-align: center;
          margin-top: 20%;
        ">
          ⚠️ 检测到开发者工具，页面已禁用<br>勿做小偷，联系我正常获取
        </div>
      `;
      i++;
    }, 200);
  }

  // 检测 F12 和 Ctrl+Shift+I/J/C
  document.onkeydown = function(e) {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && (
        e.keyCode === 73 || // I
        e.keyCode === 74 || // J
        e.keyCode === 67    // C
      ))
    ) {
      e.preventDefault();
      document.body.innerHTML = "";
      setTimeout(startFlashing, 2000);
      return false;
    }
  };
})();
</script>
