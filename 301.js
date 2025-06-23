(function () {
  const REFRESH_INTERVAL = 500;
  const MAX_SPEED = 30 * 1024 * 1024;

  // 一次性插入所有动画样式
  const style = document.createElement('style');
  style.textContent = `
    p[class*="text-[11px]"] {
      display: inline-flex !important;
      align-items: center !important;
      margin-right: 6px !important;
      line-height: 1 !important;
      transition: color 0.5s ease;
      position: relative;
      padding: 0 4px;
      border-radius: 4px;
    }
    p[class*="text-[11px]"] svg {
      vertical-align: middle !important;
      margin-right: 2px !important;
      flex-shrink: 0 !important;
    }

    /* 颜色渐变闪烁 */
    @keyframes color-glow {
      0%, 100% { color: rgba(255, 0, 0, 0.7); text-shadow: 0 0 5px rgba(255, 0, 0, 0.7); }
      50% { color: rgba(255, 50, 50, 1); text-shadow: 0 0 12px rgba(255, 50, 50, 1); }
    }

    /* 边框发光 */
    @keyframes border-glow {
      0%, 100% { box-shadow: 0 0 5px 0 rgba(255, 0, 0, 0.6); }
      50% { box-shadow: 0 0 15px 3px rgba(255, 0, 0, 1); }
    }

    /* 背景脉冲 */
    @keyframes background-pulse {
      0%, 100% { background-color: rgba(255, 0, 0, 0.1); }
      50% { background-color: rgba(255, 0, 0, 0.25); }
    }

    /* 文字阴影脉冲 */
    @keyframes text-shadow-pulse {
      0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.6); }
      50% { text-shadow: 0 0 15px rgba(255, 0, 0, 1); }
    }

    /* 上传效果类 */
    .speed-boost-1 {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 4px rgba(255, 0, 0, 0.5);
    }
    .speed-boost-2 {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 6px rgba(255, 0, 0, 0.8);
    }
    .speed-boost-3 {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out, background-pulse 1.5s infinite ease-in-out, text-shadow-pulse 1.2s infinite ease-in-out, border-glow 1.2s infinite ease-in-out;
      text-shadow: 0 0 10px rgba(255, 0, 0, 1);
      background-color: rgba(255, 0, 0, 0.08);
      border-radius: 4px;
      border: 1px solid transparent;
      position: relative;
      z-index: 0;
    }

    /* 下载效果类，蓝色调 */
    .speed-boost-1-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 4px rgba(0, 0, 255, 0.5);
      color: rgba(0, 0, 255, 0.8) !important;
    }
    .speed-boost-2-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 6px rgba(0, 0, 255, 0.8);
      color: rgba(0, 0, 255, 1) !important;
    }
    .speed-boost-3-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out, background-pulse 1.5s infinite ease-in-out, text-shadow-pulse 1.2s infinite ease-in-out, border-glow 1.2s infinite ease-in-out;
      text-shadow: 0 0 10px rgba(0, 0, 255, 1);
      background-color: rgba(0, 0, 255, 0.08);
      border-radius: 4px;
      border: 1px solid transparent;
      color: rgba(0, 0, 255, 1) !important;
      position: relative;
      z-index: 0;
    }
  `;
  document.head.appendChild(style);

  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = {
      'B/s': 1,
      'K/s': 1024,
      'M/s': 1024 * 1024,
      'MiB/s': 1024 * 1024,
      'G/s': 1024 * 1024 * 1024,
      'GiB/s': 1024 * 1024 * 1024,
    };
    const regex = /^([\d.]+)\s*([BKMG]i?B\/s)$/i;
    const match = speedStr.match(regex);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2];
    return num * (units[unit] || 1);
  }

  function speedToColor(speed, maxSpeed, type) {
    const logSpeed = Math.log10(speed + 1);
    const logMax = Math.log10(maxSpeed + 1);
    const ratio = Math.min(logSpeed / logMax, 1);
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

  function applyEffect(elem, speed, type) {
    elem.classList.remove(
      'speed-boost-1', 'speed-boost-2', 'speed-boost-3',
      'speed-boost-1-dl', 'speed-boost-2-dl', 'speed-boost-3-dl'
    );
    if (speed > 30 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-3' : 'speed-boost-3-dl');
    } else if (speed > 20 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-2' : 'speed-boost-2-dl');
    } else if (speed > 10 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-1' : 'speed-boost-1-dl');
    }
  }

  function updateSpeedColors() {
    const speedElems = document.querySelectorAll('p[class*="text-[11px]"].flex.items-center.text-nowrap.font-semibold');
    if (speedElems.length < 2) return;

    const uploadElem = speedElems[0];
    const downloadElem = speedElems[1];

    const uploadStr = uploadElem.textContent.trim();
    const downloadStr = downloadElem.textContent.trim();

    const uploadSpeed = parseSpeed(uploadStr);
    const downloadSpeed = parseSpeed(downloadStr);

    uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
    downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

    applyEffect(uploadElem, uploadSpeed, 'upload');
    applyEffect(downloadElem, downloadSpeed, 'download');
  }

  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
