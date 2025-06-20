;(function () {
  function parseSpeed(text) {
    const matched = text.match(/([\d.]+)\s*([KMGT]?i?B)?\/s/i);
    if (!matched) return 0;
    const number = parseFloat(matched[1]);
    const unit = (matched[2] || 'MiB').toUpperCase();
    switch (unit) {
      case 'B': return number / (1024 * 1024);
      case 'KB': case 'KIB': return number / 1024;
      case 'MB': case 'MIB': return number;
      case 'GB': case 'GIB': return number * 1024;
      case 'TB': case 'TIB': return number * 1024 * 1024;
      default: return number;
    }
  }

  function getSpeedColor(speed) {
    if (speed > 30) return '#F44336';  // 红色
    if (speed > 10) return '#FFC107';  // 黄色
    if (speed > 5) return '#4CAF50';   // 绿色
    return '';                        // 不变色（或默认）
  }

  function updateSpeedColors() {
    document.querySelectorAll('.mt-4.w-full.mx-auto .grid.grid-cols-2 span').forEach(el => {
      const text = el.textContent.trim();
      if (/^(上传|下载)[\s\S]*?\/s$/i.test(text)) {
        const speed = parseSpeed(text);
        const color = getSpeedColor(speed);
        if (color) {
          el.style.color = color;
          el.style.fontWeight = 'bold';
          el.style.transition = 'color 0.3s ease';
        } else {
          // 不满足条件时恢复默认颜色
          el.style.color = '';
          el.style.fontWeight = '';
        }
      }
    });
  }

  updateSpeedColors();
  setInterval(updateSpeedColors, 1000);
})();
