
(function () {
  const REFRESH_INTERVAL = 500; // 每500ms刷新一次
  const MAX_SPEED = 10 * 1024 * 1024; // 最大速度为 10MB/s，用于颜色比例

  // 单位转换函数：返回字节/秒
  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = { 'B/s': 1, 'K/s': 1024, 'M/s': 1024 * 1024, 'G/s': 1024 * 1024 * 1024 };
    const regex = /^([\d.]+)([BKMG]\/s)$/;
    const match = speedStr.match(regex);
    if (!match) return 0;
    return parseFloat(match[1]) * (units[match[2]] || 1);
  }

  // 对数比例颜色映射：白→红（上传）或白→蓝（下载）
  function speedToColor(speed, maxSpeed, type) {
    const logSpeed = Math.log10(speed + 1);          // 避免 log(0)
    const logMax = Math.log10(maxSpeed + 1);
    const ratio = Math.min(logSpeed / logMax, 1);     // 非线性映射，0~1

    if (type === 'upload') {
      const r = 255;
      const g = Math.round(255 * (1 - ratio));
      const b = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  }

  // 遍历卡片，更新上传/下载速率的颜色
  function updateSpeedColors() {
    const cards = document.querySelectorAll('div.rounded-lg.border.bg-card.text-card-foreground.shadow-lg');
    cards.forEach(card => {
      const speedElems = card.querySelectorAll(
        'section.grid.grid-cols-5 > div.flex.flex-col > div.flex.items-center.text-xs.font-semibold'
      );
      if (speedElems.length >= 5) {
        const uploadElem = speedElems[3];
        const downloadElem = speedElems[4];

        const uploadStr = uploadElem.textContent.trim();
        const downloadStr = downloadElem.textContent.trim();

        const uploadSpeed = parseSpeed(uploadStr);
        const downloadSpeed = parseSpeed(downloadStr);

        // 添加平滑过渡
        uploadElem.style.transition = 'color 0.5s ease';
        downloadElem.style.transition = 'color 0.5s ease';

        // 设置颜色
        uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
        downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');
      }
    });
  }

  // 定时刷新
  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
