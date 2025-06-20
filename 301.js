document.addEventListener('DOMContentLoaded', () => {
  console.log('speedColorMonitor start');
  (function () {
    let lastUpdate = 0;
    const REFRESH_INTERVAL = 2000;

    function parseSpeed(speedStr) {
      if (!speedStr) return 0;
      const units = { 'B/s': 1, 'K/s': 1024, 'M/s': 1024 * 1024, 'G/s': 1024 * 1024 * 1024 };
      const regex = /^([\d.]+)([BKMG]\/s)$/;
      const match = speedStr.match(regex);
      if (!match) return 0;
      return parseFloat(match[1]) * (units[match[2]] || 1);
    }

    function speedToColor(speed, maxSpeed, type) {
      const clamped = Math.min(speed, maxSpeed);
      const ratio = clamped / maxSpeed;
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

    function updateSpeedColors() {
      const cards = document.querySelectorAll('div.rounded-lg.border.bg-card.text-card-foreground.shadow-lg');
      if (!cards.length) {
        console.log('No cards found');
        return;
      }
      cards.forEach(card => {
        const speedElems = card.querySelectorAll('section.grid.grid-cols-5 > div.flex.flex-col > div.flex.items-center.text-xs.font-semibold');
        if (speedElems.length >= 5) {
          const uploadStr = speedElems[3].textContent.trim();
          const downloadStr = speedElems[4].textContent.trim();
          const uploadSpeed = parseSpeed(uploadStr);
          const downloadSpeed = parseSpeed(downloadStr);
          const maxSpeed = 30 * 1024 * 1024;
          speedElems[3].style.color = speedToColor(uploadSpeed, maxSpeed, 'upload');
          speedElems[4].style.color = speedToColor(downloadSpeed, maxSpeed, 'download');
        }
      });
    }

    setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - lastUpdate >= REFRESH_INTERVAL) {
        updateSpeedColors();
        lastUpdate = now;
      }
    }, 500);
  })();
});
