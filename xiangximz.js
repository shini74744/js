(function () {
  // 获取所有卡片名字元素（div.server-name）
  function getCardNameElements() {
    return document.querySelectorAll('div.server-name');
  }

  // 获取详细页名字元素，先假设是 p.break-normal.font-bold.tracking-tight.text-xs
  // 如果你给我详细页面名字的HTML我可以帮你调整
  function getDetailNameElements() {
    return document.querySelectorAll('p.break-normal.font-bold.tracking-tight.text-xs');
  }

  // 判断是否离线（根据卡片名字元素所在结构找状态点）
  function isOffline(el) {
    // el 是名字元素，比如div.server-name或者p标签
    // 往上找祖先元素，然后找状态点 span.h-2.w-2.bg-red-500
    let parent = el.parentElement;
    for (let i = 0; i < 5 && parent; i++) {  // 最多往上找5层防止死循环
      const statusDot = parent.querySelector('span.h-2.w-2.bg-red-500');
      if (statusDot) return true;
      parent = parent.parentElement;
    }
    return false;
  }

  // 获取所有目标名字元素（卡片 + 详细）
  function getAllNameElements() {
    return [...getCardNameElements(), ...getDetailNameElements()];
  }

  // 根据当前小时生成颜色（在线）
  function getColorByHour(hour) {
    let hue;
    if (hour <= 12) {
      hue = 200 - ((200 - 60) / 12) * hour;
    } else {
      hue = 60 + ((200 - 60) / 12) * (hour - 12);
    }
    return `hsl(${hue.toFixed(0)}, 80%, 60%)`;
  }

  let offlineElements = new Set();
  let progress = 0;
  let direction = 1;

  function applyColors() {
    const now = new Date();
    const hour = now.getHours();

    offlineElements.clear();

    getAllNameElements().forEach(el => {
      if (isOffline(el)) {
        offlineElements.add(el);
        el.style.setProperty('color', 'rgba(255,0,0,0.6)', 'important');
        el.dataset.colorized = 'offline';
      } else {
        el.style.setProperty('color', getColorByHour(hour), 'important');
        el.dataset.colorized = 'online';
      }
    });
  }

  setInterval(() => {
    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }
    const alpha = 0.4 + progress * 0.4;
    offlineElements.forEach(el => {
      el.style.setProperty('color', `rgba(255,0,0,${alpha.toFixed(2)})`, 'important');
    });
  }, 100);

  applyColors();

  // 监听 DOM 变化，确保新加元素实时生效
  new MutationObserver(() => applyColors()).observe(document.body, {childList: true, subtree: true});

  // 每小时刷新在线颜色
  function msToNextHour() {
    const now = new Date();
    return (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
  }
  setTimeout(function tick() {
    applyColors();
    setTimeout(tick, 3600000);
  }, msToNextHour());

})();
