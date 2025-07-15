(function () {
  // 获取所有服务器名字的 <p> 元素，符合这个类名选择器
  function getNameElements() {
    return document.querySelectorAll('p.break-normal.font-bold.tracking-tight.text-xs');
  }

  // 根据时间生成彩虹色（跳过红色，避免与离线冲突）
  function getCurrentRainbowColor() {
    const now = new Date();
    // 每5分钟一圈，周期为5分钟 = 300000ms
    const cycle = 300000;
    const t = now.getTime() % cycle;
    const progress = t / cycle; // 0 ~ 1

    // 色相范围跳过红色区（默认红为0°）
    // 我们用 [30°, 330°] 范围，排除 ±30° 红色
    const hue = 30 + progress * 300; // 从30~330度

    return `hsl(${hue.toFixed(0)}, 80%, 60%)`;
  }

  // 判断服务器是否离线
  // 通过DOM结构找到对应名字元素的状态点(span.h-2.w-2)
  // 状态点含类 bg-red-500 则认为离线
  function isOffline(el) {
    const div = el.parentElement;       // p的父元素 div.relative.flex.flex-col
    if (!div) return false;
    const section = div.parentElement;  // div的父元素 section.grid
    if (!section) return false;

    // section中第一个 span.h-2.w-2 是状态点
    const statusDot = section.querySelector('span.h-2.w-2');
    if (!statusDot) return false;

    // 判断是否含有红色背景类
    return statusDot.classList.contains('bg-red-500');
  }

  // 保存所有当前离线状态的名字元素，方便闪烁颜色切换
  let offlineElements = new Set();

  // 渐变进度：0~1之间，控制透明度从淡到浓
  let progress = 0;
  // 渐变方向，1表示透明度递增，-1表示递减
  let direction = 1;

  // 给所有名字元素应用对应颜色
  // 离线的名字固定为红色，闪烁由定时器控制
  // 在线的名字使用动态彩虹色
  function applyColorToNames() {
    offlineElements.clear(); // 清空之前离线元素集合

    getNameElements().forEach(el => {
      if (isOffline(el)) {
        offlineElements.add(el);
        // 离线名字红色，后续通过闪烁定时器切换透明度
        el.style.setProperty("color", "rgba(255, 0, 0, 0.6)", "important");
        el.dataset.colorized = "offline";
      } else {
        // 在线名字使用当前彩虹色
        el.style.setProperty("color", getCurrentRainbowColor(), "important");
        el.dataset.colorized = "online";
      }
    });
  }

  // 定时器，每100毫秒运行一次，平滑切换离线名字的透明度，实现闪烁效果
  setInterval(() => {
    // 计算当前透明度，范围0.4 ~ 0.8之间循环
    progress += direction * 0.05;
    if (progress >= 1) {
      progress = 1;
      direction = -1;
    } else if (progress <= 0) {
      progress = 0;
      direction = 1;
    }

    const alpha = 0.4 + progress * 0.4;

    // 给所有离线名字元素设置当前透明度的红色
    offlineElements.forEach(el => {
      el.style.setProperty("color", `rgba(255, 0, 0, ${alpha.toFixed(2)})`, "important");
    });
  }, 100);

  // 每秒更新一次在线名字颜色（动画过渡流畅）
  setInterval(() => {
    getNameElements().forEach(el => {
      if (el.dataset.colorized === "online") {
        el.style.setProperty("color", getCurrentRainbowColor(), "important");
      }
    });
  }, 1000);

  // 首次执行，立即应用颜色
  applyColorToNames();

  // 监听DOM变化，动态新增或状态变化时重新应用颜色
  const observer = new MutationObserver(() => {
    applyColorToNames();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 原有的每小时刷新逻辑仍保留
  function msToNextHour() {
    const now = new Date();
    return (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  }

  setTimeout(function tick() {
    applyColorToNames();
    setTimeout(tick, 60 * 60 * 1000);
  }, msToNextHour());
})();
