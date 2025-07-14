(function () {
  // 获取所有服务器名字的 <p> 元素，符合这个类名选择器
  function getNameElements() {
    return document.querySelectorAll('p.break-normal.font-bold.tracking-tight.text-xs');
  }

  // 根据当前小时数计算名字的颜色（在线时使用）
  // 颜色在蓝绿(200°)和黄绿(60°)之间渐变，hsl色相变化
  function getColorByHour(hour) {
    let hue;
    if (hour <= 12) {
      // 0~12点，色相从200递减到60
      hue = 200 - ((200 - 60) / 12) * hour;
    } else {
      // 13~23点，色相从60递增到200
      hue = 60 + ((200 - 60) / 12) * (hour - 12);
    }
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
  // 离线的名字先固定为半透明红色，闪烁由定时器控制
  // 在线的名字根据当前小时设置动态色
  function applyColorToNames() {
    const now = new Date();
    const hour = now.getHours();

    offlineElements.clear(); // 清空之前离线元素集合

    getNameElements().forEach(el => {
      if (isOffline(el)) {
        offlineElements.add(el);
        // 离线名字初始颜色，后续通过闪烁定时器切换透明度
        el.style.setProperty("color", "rgba(255, 0, 0, 0.6)", "important");
        el.dataset.colorized = "offline";
      } else {
        // 在线名字根据时间渐变色
        el.style.setProperty("color", getColorByHour(hour), "important");
        el.dataset.colorized = "online";
      }
    });
  }

  // 定时器，每100毫秒运行一次，平滑切换离线名字的透明度，实现闪烁效果
  setInterval(() => {
    // 计算当前透明度，范围0.4 ~ 0.8之间循环
    progress += direction * 0.05; // 0.05 * 20 = 1 完成一次周期
    if (progress >= 1) {
      progress = 1;
      direction = -1; // 达到最大透明度后，开始递减
    } else if (progress <= 0) {
      progress = 0;
      direction = 1; // 达到最小透明度后，开始递增
    }

    const alpha = 0.4 + progress * 0.4; // 透明度区间[0.4, 0.8]

    // 给所有离线名字元素设置当前透明度的红色
    offlineElements.forEach(el => {
      el.style.setProperty("color", `rgba(255, 0, 0, ${alpha.toFixed(2)})`, "important");
    });
  }, 100);

  // 首次执行，立即应用颜色
  applyColorToNames();

  // 监听DOM变化，动态新增或状态变化时重新应用颜色
  const observer = new MutationObserver(() => {
    applyColorToNames();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 计算距离下一个小时整点的毫秒数
  function msToNextHour() {
    const now = new Date();
    return (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  }

  // 在下一个小时整点刷新颜色，并设置后续每小时刷新
  setTimeout(function tick() {
    applyColorToNames();
    setTimeout(tick, 60 * 60 * 1000); // 每小时执行一次
  }, msToNextHour());
})();
