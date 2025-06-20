const SCRIPT_VERSION = 'modular-v1.0';

// == 配置项 ==
const TrafficScriptConfig = {
  showTrafficStats: true,
  interval: 60000,
  toggleInterval: 5000,
  duration: 500,
  apiUrl: '/api/v1/service',
  enableLog: false
};

// == 工具函数 ==
const utils = (() => {
  function formatFileSize(bytes) {
    if (bytes === 0) return { value: '0', unit: 'B' };
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return { value: size.toFixed(i === 0 ? 0 : 2), unit: units[i] };
  }

  function calculatePercentage(used, total) {
    used = Number(used);
    total = Number(total);
    if (used > 1e15 || total > 1e15) {
      used /= 1e10;
      total /= 1e10;
    }
    return total === 0 ? '0.0' : (used / total * 100).toFixed(1);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  function safeSetTextContent(parent, selector, text) {
    const el = parent.querySelector(selector);
    if (el) el.textContent = text;
  }

  function getGradientColor(p) {
    p = Math.min(Math.max(Number(p), 0), 100);
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    let r, g, b;
    if (p <= 50) {
      const t = p / 50;
      r = lerp(16, 255, t);
      g = lerp(185, 165, t);
      b = lerp(129, 0, t);
    } else {
      const t = (p - 50) / 50;
      r = lerp(255, 239, t);
      g = lerp(165, 68, t);
      b = lerp(0, 68, t);
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  function fadeOutIn(el, newHTML, duration = 500) {
    el.style.transition = `opacity ${duration / 2}ms`;
    el.style.opacity = '0';
    setTimeout(() => {
      el.innerHTML = newHTML;
      el.style.transition = `opacity ${duration / 2}ms`;
      el.style.opacity = '1';
    }, duration / 2);
  }

  return {
    formatFileSize,
    calculatePercentage,
    formatDate,
    safeSetTextContent,
    getGradientColor,
    fadeOutIn
  };
})();

// == 渲染模块 ==
const trafficRenderer = (() => {
  const toggleElements = [];

  function render(trafficData, config) {
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
            id: serverId, transfer, max, from, to, next_update
          });
        }
      }
    }

    serverMap.forEach((server, serverName) => {
      const target = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
        .find(el => el.querySelector('p')?.textContent.trim() === serverName);
      if (!target) return;

      const container = target.closest('div');
      if (!container) return;

      const used = utils.formatFileSize(server.transfer);
      const total = utils.formatFileSize(server.max);
      const percent = utils.calculatePercentage(server.transfer, server.max);
      const from = utils.formatDate(server.from);
      const to = utils.formatDate(server.to);
      const color = utils.getGradientColor(percent);
      const next = new Date(server.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

      const unique = `traffic-stats-${server.id}`;
      const existing = container.querySelector(`.${unique}`);

      if (!config.showTrafficStats) {
        if (existing) existing.remove();
        return;
      }

      if (existing) {
        utils.safeSetTextContent(existing, '.used-traffic', used.value);
        utils.safeSetTextContent(existing, '.used-unit', used.unit);
        utils.safeSetTextContent(existing, '.total-traffic', total.value);
        utils.safeSetTextContent(existing, '.total-unit', total.unit);
        utils.safeSetTextContent(existing, '.percentage-value', percent + '%');

        const bar = existing.querySelector('.progress-bar');
        if (bar) {
          bar.style.width = percent + '%';
          bar.style.backgroundColor = color;
        }
      } else {
        const div = document.createElement('div');
        div.className = `space-y-1 new-inserted-element ${unique}`;
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-baseline gap-1">
              <span class="text-[10px] font-medium used-traffic" style="color:${color}">${used.value}</span>
              <span class="text-[10px] font-medium used-unit" style="color:${color}">${used.unit}</span>
              <span class="text-[10px] text-neutral-400">/</span>
              <span class="text-[10px] total-traffic" style="color:${color}">${total.value}</span>
              <span class="text-[10px] total-unit" style="color:${color}">${total.unit}</span>
            </div>
            <div class="text-[10px] text-neutral-500 time-info">${from} - ${to}</div>
          </div>
          <div class="relative h-1.5">
            <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
            <div class="absolute inset-0 progress-bar rounded-full transition-all duration-300" style="width: ${percent}%; background-color: ${color};"></div>
          </div>
        `;
        target.after(div);

        const timeEl = div.querySelector('.time-info');
        if (timeEl) {
          toggleElements.push({
            el: timeEl,
            contents: [
              `${from} - ${to}`,
              `<span class="percentage-value" style="color:${color}">${percent}%</span>`,
              `<span class="text-neutral-400">${next}</span>`
            ]
          });
        }
      }
    });
  }

  function startToggle(interval, duration) {
    let index = 0;
    setInterval(() => {
      index++;
      toggleElements.forEach(({ el, contents }) => {
        if (!document.body.contains(el)) return;
        const content = contents[index % contents.length];
        utils.fadeOutIn(el, content, duration);
      });
    }, interval);
  }

  return {
    render,
    startToggle
  };
})();

// == 数据模块 ==
const dataFetcher = (() => {
  let cache = null;
  function fetch(config, callback) {
    const now = Date.now();
    if (cache && (now - cache.timestamp < config.interval)) {
      return callback(cache.data);
    }
    fetch(config.apiUrl)
      .then(res => res.json())
      .then(data => {
        if (!data.success) return;
        cache = { timestamp: now, data: data.data.cycle_transfer_stats };
        callback(cache.data);
      })
      .catch(e => console.error('[TrafficScript] 请求失败:', e));
  }
  return { fetch };
})();

// == DOM 监听模块 ==
const domObserver = (() => {
  let section = null, observer = null;
  const selector = 'section.server-card-list, section.server-inline-list';

  function start(onChange) {
    const detect = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el && el !== section) {
        if (observer) observer.disconnect();
        section = el;
        observer = new MutationObserver(muts => {
          for (const m of muts) {
            if (m.type === 'childList') {
              onChange();
              break;
            }
          }
        });
        observer.observe(section, { childList: true });
        onChange();
      }
    });
    const root = document.querySelector('main') || document.body;
    detect.observe(root, { childList: true, subtree: true });
  }

  return { start };
})();

// == 主程序入口 ==
(function main() {
  console.log(`[TrafficScript] Loaded ${SCRIPT_VERSION}`);
  let timer = null;

  function refresh() {
    dataFetcher.fetch(TrafficScriptConfig, data => {
      trafficRenderer.render(data, TrafficScriptConfig);
    });
    if (!timer) {
      timer = setInterval(refresh, TrafficScriptConfig.interval);
    }
  }

  domObserver.start(refresh);
  trafficRenderer.startToggle(TrafficScriptConfig.toggleInterval, TrafficScriptConfig.duration);

  window.addEventListener('beforeunload', () => {
    if (timer) clearInterval(timer);
  });
})();
