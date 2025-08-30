// 网络统计卡片的上下传速率颜色实现代码
(function () {
  // 刷新间隔（毫秒）
  const REFRESH_INTERVAL = 500;
  // 最大速率阈值（这里设为 100 MB/s）
  const MAX_SPEED = 100 * 1024 * 1024; 

  // 注入 CSS 样式，用于不同速率等级的颜色和动画效果
  const style = document.createElement('style');
  style.textContent = `
    /* 速率显示文本的基础样式 */
    p[class*="text-[11px]"] {
      display: inline-flex !important;
      align-items: center !important;
      margin-right: 8px !important;
      line-height: 1 !important;
      transition: color 0.5s ease !important;
      transform-origin: center center !important;
      position: relative !important;
      z-index: 1;
    }

    /* 图标样式 */
    p[class*="text-[11px]"] svg {
      flex-shrink: 0 !important;
      width: 1em;
      height: 1em;
      margin-right: 4px !important;
      vertical-align: middle !important;
    }

    /* 定义发光、边框闪烁、背景脉动等动画 */
    @keyframes color-glow {
      0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.7); }
      50% { text-shadow: 0 0 15px rgba(255, 50, 50, 1); }
    }
    @keyframes border-glow {
      0%, 100% { box-shadow: 0 0 6px 0 rgba(255, 0, 0, 0.6); }
      50% { box-shadow: 0 0 20px 4px rgba(255, 0, 0, 1); }
    }
    @keyframes background-pulse {
      0%, 100% { background-color: rgba(255, 0, 0, 0.15); }
      50% { background-color: rgba(255, 0, 0, 0.3); }
    }
    @keyframes text-shadow-pulse {
      0%, 100% { text-shadow: 0 0 6px rgba(255, 0, 0, 0.6); }
      50% { text-shadow: 0 0 18px rgba(255, 0, 0, 1); }
    }
    @keyframes subtle-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.75; }
    }

    /* 速率等级 1：低速，无动画 */
    .speed-level-1,
    .speed-level-1-dl {
      animation: none !important;
      text-shadow: none !important;
    }

    /* 速率等级 2：中低速，轻微闪烁 */
    .speed-level-2 {
      animation: subtle-glow 2s infinite ease-in-out !important;
      text-shadow: 0 0 6px rgba(255, 50, 50, 0.6) !important;
      font-weight: bold !important;
      color: rgb(255, 100, 100) !important;
    }
    .speed-level-2-dl {
      animation: subtle-glow 2s infinite ease-in-out !important;
      text-shadow: 0 0 6px rgba(50, 50, 255, 0.6) !important;
      font-weight: bold !important;
      color: rgb(100, 100, 255) !important;
    }

    /* 速率等级 3：中速，边框发光 */
    .speed-level-3,
    .speed-level-3-dl {
      animation: border-glow 1.5s infinite ease-in-out !important;
    }

    /* 速率等级 4：较高，边框和背景同时发光 */
    .speed-level-4 {
      animation: border-glow 1.5s infinite ease-in-out,
                 background-pulse 1.8s infinite ease-in-out,
                 subtle-glow 2s infinite ease-in-out !important;
      background-color: rgba(255, 0, 0, 0.2) !important;
      border-radius: 4px;
    }
    .speed-level-4-dl {
      animation: border-glow 1.5s infinite ease-in-out,
                 background-pulse 1.8s infinite ease-in-out,
                 subtle-glow 2s infinite ease-in-out !important;
      background-color: rgba(0, 0, 255, 0.2) !important;
      border-radius: 4px;
    }

    /* 速率等级 5：最高速，强烈发光并放大 */
    .speed-level-5 {
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out !important;
      text-shadow: 0 0 18px rgba(255, 0, 0, 1) !important;
      background-color: rgba(255, 0, 0, 0.25) !important;
      border: 1px solid rgba(255, 0, 0, 0.6) !important;
      border-radius: 4px;
      transform: scale(1.15) !important;
      transform-origin: center center !important;
      z-index: 10 !important;
      position: relative !important;
    }
    .speed-level-5-dl {
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out !important;
      text-shadow: 0 0 18px rgba(0, 0, 255, 1) !important;
      background-color: rgba(0, 0, 255, 0.25) !important;
      border: 1px solid rgba(0, 0, 255, 0.6) !important;
      border-radius: 4px;
      transform: scale(1.15) !important;
      transform-origin: center center !important;
      z-index: 10 !important;
      position: relative !important;
      color: rgba(0, 0, 255, 1) !important;
    }
  `;
  document.head.appendChild(style);

  // 将速率字符串（如 "12.5 MiB/s"）转换为字节数
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

  // 根据速率计算对应颜色（上传红色系，下载蓝色系）
  function speedToColor(speed, maxSpeed, type) {
    if (speed <= 0) return type === 'upload' ? 'rgb(255,200,200)' : 'rgb(200,200,255)';
    const ratio = Math.min(Math.pow(speed / maxSpeed, 0.4), 1);
    if (type === 'upload') {
      const r = 255;
      const g = Math.round(200 * (1 - ratio));
      const b = Math.round(200 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(200 * (1 - ratio));
      const g = Math.round(200 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  }

  // 根据速率分配等级（1~5）并应用对应的 class
  function applyEffect(elem, speed, type) {
    // 移除已有的速率等级 class
    elem.classList.remove(
      'speed-level-1', 'speed-level-2', 'speed-level-3',
      'speed-level-4', 'speed-level-5',
      'speed-level-1-dl', 'speed-level-2-dl', 'speed-level-3-dl',
      'speed-level-4-dl', 'speed-level-5-dl'
    );

    const M = 1024 * 1024;
    let level = 0;
    // 根据范围划分等级（扩大一倍）
    if (speed > 100 * M) level = 5;
    else if (speed > 60 * M) level = 4;
    else if (speed > 40 * M) level = 3;
    else if (speed > 20 * M) level = 2;
    else if (speed > 0) level = 1;

    if (level > 0) {
      const className = `speed-level-${level}${type === 'download' ? '-dl' : ''}`;
      elem.classList.add(className);
    }
  }

  // 更新上传/下载速率的颜色和动画效果
  function updateSpeedColors() {
    const speedElems = document.querySelectorAll('p[class*="text-[11px]"]');
    if (speedElems.length < 2) return;

    // 假设第一个元素是上传速率，第二个是下载速率
    const uploadElem = speedElems[0];
    const downloadElem = speedElems[1];

    const uploadStr = uploadElem.textContent.trim();
    const downloadStr = downloadElem.textContent.trim();

    const uploadSpeed = parseSpeed(uploadStr);
    const downloadSpeed = parseSpeed(downloadStr);

    // 设置颜色渐变
    uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
    downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

    // 设置等级效果
    applyEffect(uploadElem, uploadSpeed, 'upload');
    applyEffect(downloadElem, downloadSpeed, 'download');
  }

  // 定时刷新（页面不可见时不刷新）
  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
