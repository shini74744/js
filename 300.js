(function () {
  let lastUpdate = 0;
  const REFRESH_INTERVAL = 2000;

  // 单位换算函数，自动识别速度单位，返回字节/秒
  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = { 'B/s': 1, 'K/s': 1024, 'M/s': 1024 * 1024, 'G/s': 1024 * 1024 * 1024 };
    const regex = /^([\d.]+)([BKMG]\/s)$/;
    const match = speedStr.match(regex);
    if (!match) return 0;
    return parseFloat(match[1]) * (units[match[2]] || 1);
  }

  // 根据速度返回颜色，上传为红色渐变，下载为蓝色渐变
  function speedToColor(speed, maxSpeed, type) {
    const clamped = Math.min(speed, maxSpeed);
    const ratio = clamped / maxSpeed; // 0~1范围
    if (type === 'upload') {
      // 白色到红色线性渐变
      const r = 255;
      const g = Math.round(255 * (1 - ratio));
      const b = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    } else {
      // 白色到蓝色线性渐变
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  }

  // 核心刷新函数：遍历所有卡片，找到上传和下载速率元素，更新颜色
  function updateSpeedColors() {
    const cards = document.querySelectorAll('div.rounded-lg.border.bg-card.text-card-foreground.shadow-lg');
    cards.forEach(card => {
      const speedElems = card.querySelectorAll('section.grid.grid-cols-5 > div.flex.flex-col > div.flex.items-center.text-xs.font-semibold');
      if (speedElems.length >= 5) {
        const uploadStr = speedElems[3].textContent.trim();
        const downloadStr = speedElems[4].textContent.trim();

        const uploadSpeed = parseSpeed(uploadStr);
        const downloadSpeed = parseSpeed(downloadStr);

        const maxSpeed = 30 * 1024 * 1024; // 30 MB/s

        speedElems[3].style.color = speedToColor(uploadSpeed, maxSpeed, 'upload');
        speedElems[4].style.color = speedToColor(downloadSpeed, maxSpeed, 'download');
      }
    });
  }

  // 定时检测，500ms判断一次页面是否可见及是否该刷新
  setInterval(() => {
    if (document.hidden) return; // 页面不可见时跳过刷新
    const now = Date.now();
    if (now - lastUpdate >= REFRESH_INTERVAL) {
      updateSpeedColors();
      lastUpdate = now;
    }
  }, 500);
})();
