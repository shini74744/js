// == Traffic Script ==
const SCRIPT_VERSION = 'v20250617';

function injectCustomCSS() {
  const style = document.createElement('style');
  style.textContent = `.mt-4.w-full.mx-auto > div { display: none; }`;
  document.head.appendChild(style);
}
injectCustomCSS();

// == 工具函数模块 ==
const utils = (() => {
  function formatFileSize(bytes) {
    if (bytes === 0) return { value: '0', unit: 'B' };
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let size = bytes, unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return { value: size.toFixed(unitIndex === 0 ? 0 : 2), unit: units[unitIndex] };
  }

  function calculatePercentage(used, total) {
    used = Number(used); total = Number(total);
    if (used > 1e15 || total > 1e15) {
      used /= 1e10; total /= 1e10;
    }
    return total === 0 ? '0.00' : ((used / total) * 100).toFixed(2);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function safeSetTextContent(parent, selector, text) {
    const el = parent.querySelector(selector);
    if (el) el.textContent = text;
  }

  function getHslGradientColor(percentage) {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const p = clamp(Number(percentage), 0, 100);
    let h, s = 85, l = 50;
    h = p <= 50 ? 120 - (90 * (p / 50)) : 30 - (30 * ((p - 50) / 50));
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

  return { formatFileSize, calculatePercentage, formatDate, safeSetTextContent, getHslGradientColor, fadeOutIn };
})();

// == 渲染模块 ==
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
        const { max, from, to } = cycle;
        const next_update = cycle.next_update[serverId];
        if (serverName && transfer !== undefined && max && from && to) {
          serverMap.set(serverName, { id: serverId, transfer, max, name: cycle.name, from, to, next_update });
        }
      }
    }

    serverMap.forEach((serverData, serverName) => {
      const targetElement = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
        .find(section => section.querySelector('p')?.textContent.trim() === serverName.trim());
      if (!targetElement) return;

      const used = utils.formatFileSize(serverData.transfer);
      const total = utils.formatFileSize(serverData.max);
      const percent = utils.calculatePercentage(serverData.transfer, serverData.max);
      const progressColor = utils.getHslGradientColor(percent);

      const fromDate = utils.formatDate(serverData.from);
      const toDate = utils.formatDate(serverData.to);
      const nextUpdate = new Date(serverData.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

      const uniqueClass = 'traffic-stats-for-server-' + serverData.id;
      const containerDiv = targetElement.closest('div');
      if (!containerDiv) return;

      const log = (...args) => config.enableLog && console.log('[renderTrafficStats]', ...args);

      const existing = Array.from(containerDiv.querySelectorAll('.new-inserted-element'))
        .find(el => el.classList.contains(uniqueClass));

      const rotateContents = [
        `<span class="from-date" style="color:#ffffff;">${fromDate}</span><span style="color:#ffffff;"> - </span><span class="to-date" style="color:#ffffff;">${toDate}</span>`,
        `<span style="font-size:10px; font-weight:500; color:#ffffff;">本月流量统计</span>`,
        `<span class="percentage-value" style="color: ${progressColor}; font-weight: 500;">${percent}%</span>`
      ];

      if (existing) {
        utils.safeSetTextContent(existing, '.used-traffic', used.value);
        utils.safeSetTextContent(existing, '.used-unit', used.unit);
        utils.safeSetTextContent(existing, '.total-traffic', total.value);
        utils.safeSetTextContent(existing, '.total-unit', total.unit);
        utils.safeSetTextContent(existing, '.percentage-value', `${percent}%`);
        utils.safeSetTextContent(existing, '.from-date', fromDate);
        utils.safeSetTextContent(existing, '.to-date', toDate);
        utils.safeSetTextContent(existing, '.next-update', `next update: ${nextUpdate}`);

        const bar = existing.querySelector('.progress-bar');
        if (bar) {
          bar.style.width = `${percent}%`;
          bar.style.backgroundColor = progressColor;
        }
        const percentEl = existing.querySelector('.percentage-value');
        if (percentEl) percentEl.style.color = progressColor;

        log(`更新流量条目: ${serverName}`);
        return;
      }

      const refSection = containerDiv.querySelector('section.grid.items-center.gap-3') ||
                         containerDiv.querySelector('section.flex.items-center.w-full.justify-between.gap-1');
      if (!refSection) return;

      const wrapper = document.createElement('div');
      wrapper.classList.add('space-y-1.5', 'new-inserted-element', uniqueClass);
      wrapper.style.width = '100%';

      wrapper.innerHTML = `
        <div style="margin-top:-4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:baseline; gap:4px;">
              <span class="used-traffic" style="font-size:10px; font-weight:500; color:${progressColor};">${used.value}</span>
              <span class="used-unit" style="font-size:10px; font-weight:500; color:${progressColor};">${used.unit}</span>
              <span style="font-size:10px; color:#ffffff;">/</span>
              <span class="total-traffic" style="font-size:10px; color:#ffffff;">${total.value}</span>
              <span class="total-unit" style="font-size:10px; color:#ffffff;">${total.unit}</span>
            </div>
            <div class="time-info" style="font-size:10px; color:#ffffff; opacity:1; transition:opacity 0.3s;">
              ${rotateContents[0]}
            </div>
          </div>
          <div style="position:relative; height:6px; margin-top:1px; border-radius:9999px; background-color: rgba(100, 116, 139, 0.15);">
            <div class="progress-bar" style="position:absolute; top:0; left:0; bottom:0;
              border-radius:9999px; width:${percent}%; max-width:100%;
              background-color:${progressColor}; transition:width 0.3s ease;"></div>
          </div>
        </div>
      `;
      refSection.after(wrapper);
      log(`插入新流量条目: ${serverName}`);

      if (config.toggleInterval > 0) {
        const timeInfoElement = wrapper.querySelector('.time-info');
        if (timeInfoElement) {
          toggleElements.push({ el: timeInfoElement, contents: rotateContents });
        }
      }
    });
  }

  function startToggleCycle(interval, duration) {
    if (interval <= 0) return;
    let idx = 0;
    setInterval(() => {
      idx++;
      toggleElements.forEach(({ el, contents }) => {
        if (document.body.contains(el)) {
          const i = idx % contents.length;
          utils.fadeOutIn(el, contents[i], duration);
        }
      });
    }, interval);
  }

  return { renderTrafficStats, startToggleCycle };
})();

// == 数据请求模块 ==
const trafficDataManager = (() => {
  let cache = null;
  function fetchTrafficData(apiUrl, config, callback) {
    const now = Date.now();
    if (cache && now - cache.timestamp < config.interval) {
      config.enableLog && console.log('[fetchTrafficData] 使用缓存数据');
      return callback(cache.data);
    }
    config.enableLog && console.log('[fetchTrafficData] 请求新数据...');
    fetch(apiUrl).then(r => r.json()).then(data => {
      if (!data.success) return;
      const trafficData = data.data.cycle_transfer_stats;
      cache = { timestamp: now, data: trafficData };
      callback(trafficData);
    }).catch(err => config.enableLog && console.error('[fetchTrafficData] 请求失败:', err));
  }
  return { fetchTrafficData };
})();

// == DOM变化监听模块 ==
const domObserver = (() => {
  const selector = 'section.server-card-list, section.server-inline-list';
  let current = null, childObs = null;

  function observeSection(section, callback) {
    childObs?.disconnect();
    current = section;
    childObs = new MutationObserver(muts => {
      if (muts.some(m => m.type === 'childList')) callback();
    });
    childObs.observe(current, { childList: true, subtree: false });
    callback();
  }

  function startDetector(callback) {
    const root = document.querySelector('main') || document.body;
    const detector = new MutationObserver(() => {
      const section = document.querySelector(selector);
      if (section && section !== current) observeSection(section, callback);
    });
    detector.observe(root, { childList: true, subtree: true });
    return detector;
  }

  function disconnectAll(detector) {
    childObs?.disconnect();
    detector?.disconnect();
  }

  return { startSectionDetector: startDetector, disconnectAll };
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

  config.enableLog && console.log(`[TrafficScript] 版本: ${SCRIPT_VERSION}`, config);

  const update = () => trafficDataManager.fetchTrafficData(config.apiUrl, config, d =>
    trafficRenderer.renderTrafficStats(d, config)
  );

  const onDomChange = () => {
    config.enableLog && console.log('[main] DOM变化，刷新流量数据');
    update();
    if (!timer) startPeriodicRefresh();
  };

  let timer = null;
  function startPeriodicRefresh() {
    if (!timer) {
      config.enableLog && console.log('[main] 启动周期刷新任务');
      timer = setInterval(update, config.interval);
    }
  }

  trafficRenderer.startToggleCycle(config.toggleInterval, config.duration);
  const detector = domObserver.startSectionDetector(onDomChange);
  onDomChange();

  setTimeout(() => {
    const newConfig = Object.assign({}, defaultConfig, window.TrafficScriptConfig || {});
    if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
      config = newConfig;
      startPeriodicRefresh();
      trafficRenderer.startToggleCycle(config.toggleInterval, config.duration);
      update();
    }
  }, 100);

  window.addEventListener('beforeunload', () => {
    domObserver.disconnectAll(detector);
    if (timer) clearInterval(timer);
  });
})();
