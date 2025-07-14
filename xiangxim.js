(function () {
  // 获取详细页中服务器名字的元素
  function getDetailNameElements() {
    return document.querySelectorAll(
      'div.flex.flex-none.cursor-pointer.font-semibold.leading-none.items-center.break-all.tracking-tight.gap-1.text-xl.server-name'
    );
  }

  // 判断服务器是否离线
  // 根据名字元素附近的状态点判断
  // 只有状态点包含 "bg-green-800" 且文本为 "在线" 才认为是在线，否则视为离线
  function isDetailOffline(el) {
    const container = el.closest('div.flex.flex-col') || el.parentElement;
    if (!container) return false;

    // 查询状态点元素
    const statusDiv = container.querySelector('div.inline-flex.items-center');
    if (!statusDiv) return false;

    const text = statusDiv.textContent.trim();
    const isOnlineText = text === '在线';
    const hasGreenBg = statusDiv.classList.contains('bg-green-800');

    // 同时满足绿色背景 + "在线" 才认为在线
    return !(isOnlineText && hasGreenBg);
  }

  // 根据当前小时返回渐变颜色（在线状态使用）
  // 色相从 200°（蓝绿）过渡到 60°（黄绿），然后再回到 200°
  function getColorByHour(hour) {
    let hue;
    if (hour <= 12) {
      hue = 200 - ((200 - 60) / 12) * hour;
    } else {
      hue = 60 + ((200 - 60) / 12) * (hour - 12);
    }
    return `hsl(${hue.toFixed(0)}, 80%, 60%)`;
  }

  // 存放所有当前离线状态的名字元素，用于控制红色闪烁
  let offlineElements = new Set();

  // 闪烁动画的渐变进度（0~1）
  let progress = 0;
  // 渐变方向（1为增加透明度，-1为减少）
  let direction = 1;

  // 应用颜色逻辑到所有名字元素
  function applyColorToDetailNames() {
    const now = new Date();
    const hour = now.getHours();

    // 清空之前记录的离线元素集合
    offlineElements.clear();

    getDetailNameElements().forEach(el => {
      if (isDetailOffline(el)) {
        // 离线，初始设为红色半透明
        offlineElements.add(el);
        el.style.setProperty('color', 'rgba(255, 0, 0, 0.6)', 'important');
        el.dataset.colorized = 'offline';
      } else {
        // 在线，使用渐变色
        el.style.setProperty('color', getColorByHour(hour), 'important');
        el.dataset.colorized = 'online';
      }
    });
  }

  // 每100毫秒执行一次：控制离线元素颜色透明度，形成红色闪烁动画
  setInterval(() => {
    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }
    const alpha = 0.4 + progress * 0.4; // alpha范围[0.4, 0.8]

    offlineElements.forEach(el => {
      el.style.setProperty('color', `rgba(255, 0, 0, ${alpha.toFixed(2)})`, 'important');
    });
  }, 100);

  // 初次加载执行一次颜色设置
  applyColorToDetailNames();

  // 使用 MutationObserver 监听 DOM 变化，确保切换服务器时能自动刷新颜色状态
  const observer = new MutationObserver(() => {
    applyColorToDetailNames();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 计算距离下一个整点的毫秒数
  function msToNextHour() {
    const now = new Date();
    return (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  }

  // 整点刷新在线颜色，每小时执行一次
  setTimeout(function tick() {
    applyColorToDetailNames();
    setTimeout(tick, 60 * 60 * 1000);
  }, msToNextHour());
})();
