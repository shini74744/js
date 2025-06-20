const SCRIPT_VERSION = 'v20250617';
// == 样式注入模块 ==
function injectCustomCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .mt-4.w-full.mx-auto > div {
      display: none;
    }
  `;
  document.head.appendChild(style);
}
injectCustomCSS();

// == 工具函数模块 ==
const utils = (() => {
  function formatFileSize(bytes) {
    if (bytes === 0) return { value: '0', unit: 'B' };
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return {
      value: size.toFixed(unitIndex === 0 ? 0 : 2),
      unit: units[unitIndex]
    };
  }

  function calculatePercentage(used, total) {
    used = Number(used);
    total = Number(total);
    if (used > 1e15 || total > 1e15) {
      used /= 1e10;
      total /= 1e10;
    }
    return total === 0 ? '0.00' : ((used / total) * 100).toFixed(2);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  function safeSetTextContent(parent, selector, text) {
    const el = parent.querySelector(selector);
    if (el) el.textContent = text;
  }

  // ✅ 渐变颜色：绿色（≤50%）→ 橙色（50~80%）→ 红色（>80%）
  function getHslGradientColor(percentage) {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const p = clamp(Number(percentage), 0, 100);

    let h, s = 85, l = 50;
    if (p <= 50) {
      const t = p / 50;
      h = 120 - (90 * t); // green → orange
    } else {
      const t = (p - 50) / 50;
      h = 30 - (30 * t); // orange → red
    }

    return `hsl(${h.toFixed(0)}, ${s}%, ${l}%)`;
  }

  function fadeOutIn(element, newContent, duration = 500) {
    element.style.transition = `opacity ${duration / 2}ms`;
    element.style.opacity = '0';
    setTimeout(() => {
      element.innerHTML = newContent;
      element.style.transition = `opacity ${duration / 2}ms`;
      element.style.opacity = '1';
    }, duration / 2);
  }

  return {
    formatFileSize,
    calculatePercentage,
    formatDate,
    safeSetTextContent,
    getHslGradientColor,
    fadeOutIn
  };
})();

// == 流量统计渲染模块 ==
const trafficRenderer = (() => {
  const toggleElements = [];

  function renderTrafficStats(trafficData, config) {
    const serverMap = new Map();

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
            transfer,
            max,
            name: cycle.name,
            from,
            to,
            next_update
          });
        }
      }
    }

    serverMap.forEach((serverData, serverName) => {
      const targetElement = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
        .find(section => {
          const firstText = section.querySelector('p')?.textContent.trim();
          return firstText === serverName.trim();
        });
      if (!targetElement) return;

      const usedFormatted = utils.formatFileSize(serverData.transfer);
      const totalFormatted = utils.formatFileSize(serverData.max);
      const percentage = utils.calculatePercentage(serverData.transfer, serverData.max);
      const fromFormatted = utils.formatDate(serverData.from);
      const toFormatted = utils.formatDate(serverData.to);
      const nextUpdateFormatted = new Date(serverData.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
      const uniqueClassName = 'traffic-stats-for-server-' + serverData.id;
      const progressColor = utils.getHslGradientColor(percentage);
      const containerDiv = targetElement.closest('div');
      if (!containerDiv) return;
      const log = (...args) => { if (config.enableLog) console.log('[renderTrafficStats]', ...args); };

      const existing = Array.from(containerDiv.querySelectorAll('.new-inserted-element'))
        .find(el => el.classList.contains(uniqueClassName));

      if (!config.showTrafficStats) {
        if (existing) {
          existing.remove();
          log(`移除流量条目: ${serverName}`);
        }
        return;
      }

      if (existing) {
        utils.safeSetTextContent(existing, '.used-traffic', usedFormatted.value);
        utils.safeSetTextContent(existing, '.used-unit', usedFormatted.unit);
        utils.safeSetTextContent(existing, '.total-traffic', totalFormatted.value);
        utils.safeSetTextContent(existing, '.total-unit', totalFormatted.unit);
        utils.safeSetTextContent(existing, '.from-date', fromFormatted);
        utils.safeSetTextContent(existing, '.to-date', toFormatted);
        utils.safeSetTextContent(existing, '.percentage-value', percentage + '%');
        utils.safeSetTextContent(existing, '.next-update', `next update: ${nextUpdateFormatted}`);

        const progressBar = existing.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = percentage + '%';
          progressBar.style.backgroundColor = progressColor;
        }

        // 设置已用流量数字颜色和百分比颜色为进度条颜色
        const usedTrafficEl = existing.querySelector('.used-traffic');
        const usedUnitEl = existing.querySelector('.used-unit');
        const percentageEl = existing.querySelector('.percentage-value');
        if (usedTrafficEl) usedTrafficEl.style.color = progressColor;
        if (usedUnitEl) usedUnitEl.style.color = progressColor;
        if (percentageEl) percentageEl.style.color = progressColor;

        log(`更新流量条目: ${serverName}`);
      } else {
        // 新建轮换内容数组：时间范围、本月流量统计、百分比
        const contents = [
          `<span class="from-date">${fromFormatted}</span>
           <span class="text-neutral-500 dark:text-neutral-400">-</span>
           <span class="to-date">${toFormatted}</span>`,
          `<span class="used-traffic" style="color: ${progressColor}; font-weight: 500;">${usedFormatted.value} ${usedFormatted.unit}</span>
           <span class="text-neutral-500 dark:text-neutral-400"> / </span>
           <span class="total-traffic">${totalFormatted.value} ${totalFormatted.unit}</span>`,
          `<span class="percentage-value" style="color: ${progressColor}; font-weight: 500;">${percentage}%</span>`
        ];

        let oldSection = null;
        if (config.insertAfter) {
          oldSection = containerDiv.querySelector('section.flex.items-center.w-full.justify-between.gap-1')
            || containerDiv.querySelector('section.grid.items-center.gap-3');
        } else {
          oldSection = containerDiv.querySelector('section.grid.items-center.gap-3');
        }
        if (!oldSection) return;

        const newElement = document.createElement('div');
        newElement.classList.add('space-y-1.5', 'new-inserted-element', uniqueClassName);
        newElement.style.width = '100%';
        newElement.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:baseline; gap:4px;">
              <span class="used-traffic" style="font-size:10px; font-weight:500; color: ${progressColor};">${usedFormatted.value}</span>
              <span class="used-unit" style="font-size:10px; font-weight:500; color: ${progressColor};">${usedFormatted.unit}</span>
              <span style="font-size:10px; color:#6b7280;">/</span>
              <span class="total-traffic" style="font-size:10px; color:#6b7280;">${totalFormatted.value}</span>
              <span class="total-unit" style="font-size:10px; color:#6b7280;">${totalFormatted.unit}</span>
            </div>
            <div class="time-info" style="font-size:10px; color:#4b5563; opacity:1; transition: opacity 0.3s;">
              ${contents[0]}
            </div>
          </div>
          <div style="position:relative; height:6px; margin-top:4px; border-radius:9999px; background-color:#e5e7eb;">
            <div class="progress-bar" style="
              position:absolute;
              top:0; left:0; bottom:0;
              border-radius:9999px;
              width: ${percentage}%;
              max-width: 100%;
              background-color: ${progressColor};
              transition: width 0.3s ease;
            "></div>
          </div>
        `;
        oldSection.after(newElement);
        log(`插入新流量条目: ${serverName}`);

        if (config.toggleInterval > 0) {
          const timeInfoElement = newElement.querySelector('.time-info');
          if (timeInfoElement) {
            toggleElements.push({
              el: timeInfoElement,
              contents
            });
          }
        }
      }
    });
  }

  function startToggleCycle(toggleInterval, duration) {
    if (toggleInterval <= 0) return;
    let toggleIndex = 0;
    setInterval(() => {
      toggleIndex++;
      toggleElements.forEach(({ el, contents }) => {
        if (!document.body.contains(el)) return;
        const index = toggleIndex % contents.length;
        utils.fadeOutIn(el, contents[index], duration);
      });
    }, toggleInterval);
  }

  return {
    renderTrafficStats,
    startToggleCycle
  };
})();

// == 数据请求和缓存模块 ==
const trafficDataManager = (() => {
  let trafficCache = null;

  function fetchTrafficData(apiUrl, config, callback) {
    const now = Date.now();
    if (trafficCache && (now - trafficCache.timestamp < config.interval)) {
      if (config.enableLog) console.log('[fetchTrafficData] 使用缓存数据');
      callback(trafficCache.data);
      return;
    }

    if (config.enableLog) console.log('[fetchTrafficData] 请求新数据...');
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          if (config.enableLog) console.warn('[fetchTrafficData] 请求成功但数据异常');
          return;
        }
        if (config.enableLog) console.log('[fetchTrafficData] 成功获取新数据');
        const trafficData = data.data.cycle_transfer_stats;
        trafficCache = {
          timestamp: now,
          data: trafficData
        };
        callback(trafficData);
      })
      .catch(err => {
        if (config.enableLog) console.error('[fetchTrafficData] 请求失败:', err);
      });
  }

  return {
    fetchTrafficData
  };
})();

// == DOM变化监听模块 ==
const domObserver = (() => {
  const TARGET_SELECTOR = 'section.server-card-list, section.server-inline-list';
  let currentSection = null;
  let childObserver = null;

  function onDomChildListChange(onChangeCallback) {
    onChangeCallback();
  }

  function observeSection(section, onChangeCallback) {
    if (childObserver) {
      childObserver.disconnect();
    }
    currentSection = section;
    childObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
          onDomChildListChange(onChangeCallback);
          break;
        }
      }
    });
    childObserver.observe(currentSection, { childList: true, subtree: false });
    onChangeCallback();
  }

  function startSectionDetector(onChangeCallback) {
    const sectionDetector = new MutationObserver(() => {
      const section = document.querySelector(TARGET_SELECTOR);
      if (section && section !== currentSection) {
        observeSection(section, onChangeCallback);
      }
    });
    const root = document.querySelector('main') || document.body;
    sectionDetector.observe(root, { childList: true, subtree: true });
    return sectionDetector;
  }

  function disconnectAll(sectionDetector) {
    if (childObserver) childObserver.disconnect();
    if (sectionDetector) sectionDetector.disconnect();
  }

  return {
    startSectionDetector,
    disconnectAll
  };
})();

// == 主程序入口 ==
(function main() {
  const defaultConfig = {
    showTrafficStats: true,
    insertAfter: true,
    interval: 60000,
    toggleInterval: 5000,
    duration: 500,
    apiUrl: '/api/v1/service',
    enableLog: false
  };
  let config = Object.assign({}, defaultConfig, window.TrafficScriptConfig || {});
  if (config.enableLog) {
    console.log(`[TrafficScript] 版本: ${SCRIPT_VERSION}`);
    console.log('[TrafficScript] 最终配置如下:', config);
  }

  function updateTrafficStats() {
    trafficDataManager.fetchTrafficData(config.apiUrl, config, trafficData => {
      trafficRenderer.renderTrafficStats(trafficData, config);
    });
  }

  function onDomChange() {
    if (config.enableLog) console.log('[main] DOM变化，刷新流量数据');
    updateTrafficStats();
    if (!trafficTimer) startPeriodicRefresh();
  }

  let trafficTimer = null;

  function startPeriodicRefresh() {
    if (!trafficTimer) {
      if (config.enableLog) console.log('[main] 启动周期刷新任务');
      trafficTimer = setInterval(() => {
        updateTrafficStats();
      }, config.interval);
    }
  }

  trafficRenderer.startToggleCycle(config.toggleInterval, config.duration);
  const sectionDetector = domObserver.startSectionDetector(onDomChange);
  onDomChange();

  setTimeout(() => {
    const newConfig = Object.assign({}, defaultConfig, window.TrafficScriptConfig || {});
    if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
      if (config.enableLog) console.log('[main] 100ms后检测到新配置，更新配置并重启任务');
      config = newConfig;
      startPeriodicRefresh();
      trafficRenderer.startToggleCycle(config.toggleInterval, config.duration);
      updateTrafficStats();
    } else {
      if (config.enableLog) console.log('[main] 100ms后无新配置，保持原配置');
    }
  }, 100);

  window.addEventListener('beforeunload', () => {
    domObserver.disconnectAll(sectionDetector);
    if (trafficTimer) clearInterval(trafficTimer);
  });
})();
