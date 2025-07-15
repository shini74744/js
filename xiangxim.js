(function () {
  // 获取详细页中服务器名字的元素（你提供的 class）
  function getDetailNameElement() {
    return document.querySelector('div.server-name');
  }

  // 获取详细页中状态点的元素（class含 bg-green-800 或 bg-red-500）
  function getDetailStatusElement() {
    return document.querySelector('div.bg-green-800, div.bg-red-500');
  }

  // 判断是否为离线状态（看是否是红色背景）
  function isOffline(statusEl) {
    return statusEl && statusEl.classList.contains('bg-red-500');
  }

  // 在线状态颜色：使用 hue 值绕过红色区间 (30°~330°)
  function getColorByTime() {
    const now = new Date();
    const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const hue = (totalSeconds % 300) + 30; // 避开红色区段
    return `hsl(${hue}, 80%, 60%)`;
  }

  // 保存是否是离线状态的标志
  let isOfflineNow = false;
  // 当前的名字元素（只会有一个）
  let nameEl = null;
  // 初始进度 & 方向（用于离线闪烁）
  let progress = 0;
  let direction = 1;

  // 应用颜色逻辑
  function applyColor() {
    const el = getDetailNameElement();
    const status = getDetailStatusElement();

    if (!el || !status) return;

    nameEl = el;
    isOfflineNow = isOffline(status);

    if (isOfflineNow) {
      // 初始设置为固定红色，稍后闪烁逻辑会更新透明度
      el.style.setProperty("color", "rgba(255, 0, 0, 0.6)", "important");
      el.dataset.colorized = "offline";
    } else {
      el.style.setProperty("color", getColorByTime(), "important");
      el.dataset.colorized = "online";
    }
  }

  // 离线闪烁动画（每 100ms）
  setInterval(() => {
    if (!isOfflineNow || !nameEl) return;

    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }

    const alpha = 0.4 + progress * 0.4; // 透明度 0.4 ~ 0.8
    nameEl.style.setProperty("color", `rgba(255, 0, 0, ${alpha.toFixed(2)})`, "important");
  }, 100);

  // 每秒更新一次颜色（保证彩色渐变生效）
  setInterval(() => {
    if (nameEl && !isOfflineNow) {
      nameEl.style.setProperty("color", getColorByTime(), "important");
    }
  }, 1000);

  // 首次运行
  applyColor();

  // 监听 DOM 更新（状态变更、导航切换等）
  const observer = new MutationObserver(() => {
    applyColor();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
