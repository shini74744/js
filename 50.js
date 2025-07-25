(function () {
  const REFRESH_INTERVAL = 500;
  const MAX_SPEED = 50 * 1024 * 1024;

  const style = document.createElement('style');
  style.textContent = `
    p[class*="text-[11px]"] {
      display: inline-flex !important;
      align-items: center !important;
      margin-right: 8px !important;
      line-height: 1 !important;
      transition: color 0.5s ease !important;
      position: relative !important;
      z-index: 1;
      overflow: hidden !important;
    }

    p[class*="text-[11px]"] svg {
      flex-shrink: 0 !important;
      width: 1em;
      height: 1em;
      margin-right: 4px !important;
      vertical-align: middle !important;
    }

    .inner-scale {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transform-origin: center center;
      transition: transform 0.3s ease;
    }

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

    .speed-level-1,
    .speed-level-1-dl {
      animation: none !important;
      text-shadow: none !important;
    }

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

    .speed-level-3,
    .speed-level-3-dl {
      animation: border-glow 1.5s infinite ease-in-out !important;
    }

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

    .speed-level-5 {
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out !important;
      text-shadow: 0 0 18px rgba(255, 0, 0, 1) !important;
      background-color: rgba(255, 0, 0, 0.25) !important;
      border: 1px solid rgba(255, 0, 0, 0.6) !important;
      border-radius: 4px;
    }

    .speed-level-5 .inner-scale {
      transform: scale(1.15) !important;
      z-index: 10 !important;
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
      color: rgba(0, 0, 255, 1) !important;
    }

    .speed-level-5-dl .inner-scale {
      transform: scale(1.15) !important;
      z-index: 10 !important;
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

  function wrapInnerContent(p) {
    if (!p.querySelector('.inner-scale')) {
      const span = document.createElement('span');
      span.className = 'inner-scale';
      while (p.firstChild) span.appendChild(p.firstChild);
      p.appendChild(span);
    }
  }

  function applyEffect(elem, speed, type) {
    wrapInnerContent(elem);

    elem.classList.remove(
      'speed-level-1', 'speed-level-2', 'speed-level-3',
      'speed-level-4', 'speed-level-5',
      'speed-level-1-dl', 'speed-level-2-dl', 'speed-level-3-dl',
      'speed-level-4-dl', 'speed-level-5-dl'
    );

    const M = 1024 * 1024;
    let level = 0;
    if (speed > 50 * M) level = 5;
    else if (speed > 30 * M) level = 4;
    else if (speed > 20 * M) level = 3;
    else if (speed > 10 * M) level = 2;
    else if (speed > 0) level = 1;

    if (level > 0) {
      const className = `speed-level-${level}${type === 'download' ? '-dl' : ''}`;
      elem.classList.add(className);
    }
  }

  function updateSpeedColors() {
    const speedElems = document.querySelectorAll('p[class*="text-[11px]"]');
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
