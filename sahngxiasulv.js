
(function () {
  const REFRESH_INTERVAL = 500;
  const MAX_SPEED = 30 * 1024 * 1024; // 超过30MB/s为最高等级特效

  // 注入动画 CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes flash-fast {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    .speed-boost-1 {
      font-weight: bold;
      animation: flash-soft 1s infinite;
      text-shadow: 0 0 4px rgba(255, 0, 0, 0.5);
    }
    .speed-boost-2 {
      font-weight: bold;
      animation: flash-fast 0.7s infinite;
      text-shadow: 0 0 6px rgba(255, 0, 0, 0.8);
      transform: scale(1.05);
    }
    .speed-boost-3 {
      font-weight: bold;
      animation: flash-fast 0.5s infinite;
      text-shadow: 0 0 10px rgba(255, 0, 0, 1);
      transform: scale(1.15);
      background-color: rgba(255, 0, 0, 0.08);
      border-radius: 4px;
    }
    .speed-boost-1-dl {
      font-weight: bold;
      animation: flash-soft 1s infinite;
      text-shadow: 0 0 4px rgba(0, 0, 255, 0.5);
    }
    .speed-boost-2-dl {
      font-weight: bold;
      animation: flash-fast 0.7s infinite;
      text-shadow: 0 0 6px rgba(0, 0, 255, 0.8);
      transform: scale(1.05);
    }
    .speed-boost-3-dl {
      font-weight: bold;
      animation: flash-fast 0.5s infinite;
      text-shadow: 0 0 10px rgba(0, 0, 255, 1);
      transform: scale(1.15);
      background-color: rgba(0, 0, 255, 0.08);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = { 'B/s': 1, 'K/s': 1024, 'M/s': 1024 * 1024, 'G/s': 1024 * 1024 * 1024 };
    const regex = /^([\d.]+)([BKMG]\/s)$/;
    const match = speedStr.match(regex);
    if (!match) return 0;
    return parseFloat(match[1]) * (units[match[2]] || 1);
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
    const classList = elem.classList;
    // 清除所有特效类
    classList.remove(
      'speed-boost-1', 'speed-boost-2', 'speed-boost-3',
      'speed-boost-1-dl', 'speed-boost-2-dl', 'speed-boost-3-dl'
    );

    if (speed > 30 * 1024 * 1024) {
      classList.add(type === 'upload' ? 'speed-boost-3' : 'speed-boost-3-dl');
    } else if (speed > 20 * 1024 * 1024) {
      classList.add(type === 'upload' ? 'speed-boost-2' : 'speed-boost-2-dl');
    } else if (speed > 10 * 1024 * 1024) {
      classList.add(type === 'upload' ? 'speed-boost-1' : 'speed-boost-1-dl');
    }
  }

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

        uploadElem.style.transition = 'color 0.5s ease, transform 0.5s ease';
        downloadElem.style.transition = 'color 0.5s ease, transform 0.5s ease';

        uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
        downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

        applyEffect(uploadElem, uploadSpeed, 'upload');
        applyEffect(downloadElem, downloadSpeed, 'download');
      }
    });
  }

  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();

