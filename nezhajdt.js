<script>
  ;(function () {
    let trafficTimer = null;    // 定时刷新定时器
    let trafficCache = null;    // 缓存数据，避免频繁请求

    const config = {
      showTrafficStats: true,   // 是否显示流量统计
      insertPosition: 'after',  // 新元素插入位置
      interval: 60000,          // 刷新间隔（毫秒）
      style: 1
    };

    // 格式化字节数为合适单位和数值，返回对象 {value, unit}
    function formatFileSize(bytes) {
      if (bytes === 0) return { value: '0', unit: 'B' };
      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      let unitIndex = 0;
      let size = bytes;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return {
        value: size.toFixed(unitIndex === 0 ? 0 : 2),
        unit: units[unitIndex]
      };
    }

    // 计算百分比，保留一位小数
    function calculatePercentage(used, total) {
      used = Number(used);
      total = Number(total);
      // 极大值缩放避免浮点异常
      if (used > 1e15 || total > 1e15) {
        used /= 1e10;
        total /= 1e10;
      }
      return (used / total * 100).toFixed(1);
    }

    // 格式化日期字符串为中文年月日格式
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }

    // 安全设置元素文本内容
    function safeSetTextContent(parent, selector, text) {
      const el = parent.querySelector(selector);
      if (el) el.textContent = text;
    }

    // 计算渐变颜色，满足绿色(≤50%), 橙色(50%~80%), 红色(>80%)，线性过渡
    function getGradientColor(percentage) {
      const p = Math.min(Math.max(Number(percentage), 0), 100);
      // 绿色 -> 橙色 -> 红色分段插值
      // 绿色 rgb(16,185,129)
      // 橙色 rgb(255,165,0)
      // 红色 rgb(239,68,68)

      function lerp(start, end, t) {
        return Math.round(start + (end - start) * t);
      }

      let r, g, b;
      if (p <= 50) {
        // 0~50% 绿色 -> 橙色
        const t = p / 50;
        r = lerp(16, 255, t);
        g = lerp(185, 165, t);
        b = lerp(129, 0, t);
      } else {
        // 50~100% 橙色 -> 红色
        const t = (p - 50) / 50;
        r = lerp(255, 239, t);
        g = lerp(165, 68, t);
        b = lerp(0, 68, t);
      }

      return `rgb(${r}, ${g}, ${b})`;
    }

    // 淡出再淡入动画替换元素内容
    function fadeOutIn(element, newContent, duration = 500) {
      element.style.transition = `opacity ${duration / 2}ms`;
      element.style.opacity = '0';  // 先淡出

      setTimeout(() => {
        element.innerHTML = newContent;   // 内容替换
        element.style.transition = `opacity ${duration / 2}ms`;
        element.style.opacity = '1';      // 再淡入
      }, duration / 2);
    }

    // 渲染流量统计数据
    function renderTrafficStats(trafficData) {
      const serverMap = new Map();

      // 解析所有服务器流量周期数据，取最新有效
      for (const cycleId in trafficData) {
        const cycle = trafficData[cycleId];
        if (!cycle.server_name || !cycle.transfer) continue;

        for (const serverId in cycle.server_name) {
          const serverName = cycle.server_name[serverId];
          const transfer = cycle.transfer[serverId];
          const max = cycle.max;
          const from = cycle.from;
          const to = cycle.to;
          const next_update = cycle.next_update[serverId];

          if (serverName && transfer !== undefined && max && from && to) {
            serverMap.set(serverName, {
              id: serverId,
              transfer: transfer,
              max: max,
              name: cycle.name,
              from: from,
              to: to,
              next_update: next_update
            });
          }
        }
      }

      // 针对每个服务器，找到对应DOM，插入/更新流量条
      serverMap.forEach((serverData, serverName) => {
        // 找到显示该服务器名的卡片 section 元素
        const targetElement = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
          .find(section => {
            const firstText = section.querySelector('p.break-all.font-bold.tracking-tight.text-xs')?.textContent.trim();
            return firstText === serverName;
          });
        if (!targetElement) return;

        // 格式化数值与时间
        const usedFormatted = formatFileSize(serverData.transfer);
        const totalFormatted = formatFileSize(serverData.max);
        const percentage = calculatePercentage(serverData.transfer, serverData.max);
        const fromFormatted = formatDate(serverData.from);
        const toFormatted = formatDate(serverData.to);
        const next_update = new Date(serverData.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
        const uniqueClassName = 'traffic-stats-for-server-' + serverData.id;
        const progressColor = getGradientColor(percentage);

        // 定位容器，准备插入新元素
        const containerDiv = targetElement.closest('div');
        if (!containerDiv) return;

        // 检查是否已有该流量条
        const existing = Array.from(containerDiv.querySelectorAll('.new-inserted-element')).find(el =>
          el.classList.contains(uniqueClassName)
        );

        // 配置关闭时删除流量条
        if (!config.showTrafficStats) {
          if (existing) existing.remove();
          return;
        }

        // 如果流量条已存在，直接更新数据和颜色
        if (existing) {
          safeSetTextContent(existing, '.used-traffic', usedFormatted.value);
          safeSetTextContent(existing, '.used-unit', usedFormatted.unit);
          safeSetTextContent(existing, '.total-traffic', totalFormatted.value);
          safeSetTextContent(existing, '.total-unit', totalFormatted.unit);
          safeSetTextContent(existing, '.percentage-value', percentage + '%');
          safeSetTextContent(existing, '.next-update', `next update: ${next_update}`);

          const progressBar = existing.querySelector('.progress-bar');
          if (progressBar) {
            progressBar.style.width = Math.min(Number(percentage), 100) + '%';
            progressBar.style.backgroundColor = progressColor;
          }

          // 数字和单位颜色都一起变化
          const usedTrafficEl = existing.querySelector('.used-traffic');
          const usedUnitEl = existing.querySelector('.used-unit');
          const totalTrafficEl = existing.querySelector('.total-traffic');
          const totalUnitEl = existing.querySelector('.total-unit');
          const percentageValueEl = existing.querySelector('.percentage-value');

          if (usedTrafficEl) usedTrafficEl.style.color = progressColor;
          if (usedUnitEl) usedUnitEl.style.color = progressColor;
          if (totalTrafficEl) totalTrafficEl.style.color = progressColor;
          if (totalUnitEl) totalUnitEl.style.color = progressColor;
          if (percentageValueEl) percentageValueEl.style.color = progressColor;

        } else {
          // 找到老的显示区域，用来插入新内容
          let oldSection = containerDiv.querySelector('section.flex.items-center.w-full.justify-between.gap-1')
            || containerDiv.querySelector('section.grid.items-center.gap-3');
          if (!oldSection) return;

          // 创建新元素结构,这里调整 space-y 为更小值，使上下间距更紧凑
          const newElement = document.createElement('div');
          newElement.classList.add('space-y-0.5', 'new-inserted-element', uniqueClassName);
          newElement.style.width = '100%';
          newElement.style.marginTop = '-8px'; // 进度条整体向上移动

          // 新增流量条HTML结构，数字和单位一起变色
          newElement.innerHTML = `
            <div class="flex items-center justify-between mb-0.5">
              <div class="flex items-baseline gap-1">
                <span class="text-[10px] font-medium used-traffic" style="color: ${progressColor}">${usedFormatted.value}</span>
                <span class="text-[10px] font-medium used-unit" style="color: ${progressColor}">${usedFormatted.unit}</span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400">/ </span>
                <span class="text-[10px] total-traffic" style="color: ${progressColor}">${totalFormatted.value}</span>
                <span class="text-[10px] total-unit" style="color: ${progressColor}">${totalFormatted.unit}</span>
              </div>
              <div class="text-[10px] font-medium text-neutral-600 dark:text-neutral-300 time-info" style="opacity:1; transition: opacity 0.3s;">
                <span class="from-date">${fromFormatted}</span>
                <span class="text-neutral-500 dark:text-neutral-400">-</span>
                <span class="to-date">${toFormatted}</span>
              </div>
            </div>
            <div class="relative h-1.5">
              <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
              <div class="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-300 progress-bar" style="width: ${Math.min(Number(percentage), 100)}%; background-color: ${progressColor};"></div>
            </div>
          `;

          // 插入新元素到老区域后面,公开备注向上调整
          oldSection.after(newElement);
          newElement.style.marginBottom = '-6px';

          // 获取时间信息元素，用于轮换显示内容
          const timeInfoElement = newElement.querySelector('.time-info');

          // 轮换显示内容索引：0-时间范围，1-本月流量统计，2-进度条百分比
          let toggleIndex = 0;

          // 轮换内容定时器，3秒切换一次
          const toggleInterval = setInterval(() => {
            if (!document.body.contains(timeInfoElement)) {
              clearInterval(toggleInterval);
              return;
            }

            if (toggleIndex === 0) {
              fadeOutIn(timeInfoElement, `
                <span class="from-date">${fromFormatted}</span>
                <span class="text-neutral-500 dark:text-neutral-400">-</span>
                <span class="to-date">${toFormatted}</span>
              `);
            } else if (toggleIndex === 1) {
              fadeOutIn(timeInfoElement, `<span class="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">本月流量统计</span>`);
            } else if (toggleIndex === 2) {
              fadeOutIn(timeInfoElement, `<span class="percentage-value" style="color: ${progressColor};">${percentage}%</span>`);
            }

            toggleIndex = (toggleIndex + 1) % 3;
          }, 3000);
        }
      });
    }

    // 更新流量统计数据函数，支持强制刷新
    function updateTrafficStats(force = false) {
      const now = Date.now();
      if (!force && trafficCache && (now - trafficCache.timestamp < config.interval)) {
        renderTrafficStats(trafficCache.data);
        return;
      }

      fetch('/api/v1/service')
        .then(res => res.json())
        .then(data => {
          if (!data.success) return;
          const trafficData = data.data.cycle_transfer_stats;
          trafficCache = {
            timestamp: now,
            data: trafficData
          };
          renderTrafficStats(trafficData);
        })
        .catch(err => console.error('[updateTrafficStats] 获取失败:', err));
    }

    // 启动定时刷新
    function startPeriodicRefresh() {
      if (!trafficTimer) {
        trafficTimer = setInterval(() => {
          updateTrafficStats();
        }, config.interval);
      }
    }

    // DOM变动触发更新
    function onDomChildListChange() {
      updateTrafficStats();
      if (!trafficTimer) {
        startPeriodicRefresh();
      }
    }

    const TARGET_SELECTOR = 'section.server-card-list, section.server-inline-list';

    let currentSection = null;
    let childObserver = null;

    // 观察当前section的子元素变化
    function observeSection(section) {
      if (childObserver) childObserver.disconnect();
      currentSection = section;
      childObserver = new MutationObserver(mutations => {
        for (const m of mutations) {
          if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
            onDomChildListChange();
            break;
          }
        }
      });
      childObserver.observe(currentSection, { childList: true, subtree: false });
      updateTrafficStats();
    }

    // 监听页面中目标section的出现与切换
    const sectionDetector = new MutationObserver(() => {
      const section = document.querySelector(TARGET_SELECTOR);
      if (section && section !== currentSection) {
        observeSection(section);
      }
    });

    const root = document.querySelector('main') || document.body;
    sectionDetector.observe(root, { childList: true, subtree: true });

    // 启动周期刷新
    startPeriodicRefresh();

    // 页面卸载时清理定时器和监听
    window.addEventListener('beforeunload', () => {
      if (trafficTimer) clearInterval(trafficTimer);
      if (childObserver) childObserver.disconnect();
      sectionDetector.disconnect();
    });
  })();
</script>
