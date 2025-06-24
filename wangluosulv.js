(function () {
  // 刷新间隔，单位毫秒
  const REFRESH_INTERVAL = 500;
  // 最大速度阈值，50MB/s，颜色映射的参考最大值
  const MAX_SPEED = 50 * 1024 * 1024;

  // 动态创建 style 标签，定义速度显示文字和动画效果的样式
  const style = document.createElement('style');
  style.textContent = `
    /* 速度显示文本p标签样式 */
    p[class*="text-[11px]"] {
      display: inline-flex !important;          /* 行内弹性布局，图标与文字横排 */
      align-items: center !important;           /* 垂直居中 */
      line-height: 1 !important;                 /* 行高为1，避免多余高度 */
      transition: color 0.5s ease !important;   /* 颜色变换平滑过渡 */
      position: relative;                        /* 相对定位，方便后续定位 */
      padding: 0 !important;                     /* 去除默认内边距 */
      margin: 0 !important;                      /* 去除默认外边距 */
      border-radius: 4px;                        /* 圆角效果 */
    }
    /* 速度文字前的 svg 图标样式 */
    p[class*="text-[11px]"] svg {
      flex-shrink: 0 !important;                 /* 禁止缩小 */
      width: 1em;                                /* 宽高和字体大小一致 */
      height: 1em;
      margin-right: 4px !important;              /* 图标和文字间距 */
      vertical-align: middle !important;         /* 垂直居中 */
    }

    /* 红色闪烁动画（上传速度高等级） */
    @keyframes color-glow {
      0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.7); }
      50% { text-shadow: 0 0 12px rgba(255, 50, 50, 1); }
    }
    /* 边框发光动画 */
    @keyframes border-glow {
      0%, 100% { box-shadow: 0 0 5px 0 rgba(255, 0, 0, 0.6); }
      50% { box-shadow: 0 0 15px 3px rgba(255, 0, 0, 1); }
    }
    /* 背景脉冲动画 */
    @keyframes background-pulse {
      0%, 100% { background-color: rgba(255, 0, 0, 0.1); }
      50% { background-color: rgba(255, 0, 0, 0.25); }
    }
    /* 文字阴影脉冲动画 */
    @keyframes text-shadow-pulse {
      0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.6); }
      50% { text-shadow: 0 0 15px rgba(255, 0, 0, 1); }
    }
    /* 轻微透明脉冲动画 */
    @keyframes subtle-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.75; }
    }

    /* 速度等级1：无动画，仅颜色渐变 */
    .speed-level-1,
    .speed-level-1-dl {
      animation: none !important;
      text-shadow: none !important;
    }
    /* 速度等级2：轻微动画，红色调加粗 */
    .speed-level-2 {
      animation: subtle-glow 2s infinite ease-in-out !important;
      text-shadow: 0 0 6px rgba(255, 50, 50, 0.6) !important;
      font-weight: bold !important;
      color: rgb(255, 100, 100) !important;
    }
    /* 速度等级2，下载蓝色调 */
    .speed-level-2-dl {
      animation: subtle-glow 2s infinite ease-in-out !important;
      text-shadow: 0 0 6px rgba(50, 50, 255, 0.6) !important;
      font-weight: bold !important;
      color: rgb(100, 100, 255) !important;
    }
    /* 速度等级3：边框发光动画 */
    .speed-level-3,
    .speed-level-3-dl {
      animation: border-glow 1.5s infinite ease-in-out !important;
    }
    /* 速度等级4：边框发光+背景脉冲，红色 */
    .speed-level-4 {
      animation: border-glow 1.5s infinite ease-in-out,
                 background-pulse 1.8s infinite ease-in-out !important;
      background-color: rgba(255, 0, 0, 0.08) !important;
    }
    /* 速度等级4，下载蓝色背景脉冲 */
    .speed-level-4-dl {
      animation: border-glow 1.5s infinite ease-in-out,
                 background-pulse 1.8s infinite ease-in-out !important;
      background-color: rgba(0, 0, 255, 0.08) !important;
    }
    /* 速度等级5：多重动画叠加，强烈红色效果 */
    .speed-level-5 {
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out !important;
      text-shadow: 0 0 10px rgba(255, 0, 0, 1) !important;
      background-color: rgba(255, 0, 0, 0.08) !important;
      border: 1px solid transparent !important;
    }
    /* 速度等级5，下载蓝色效果 */
    .speed-level-5-dl {
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out !important;
      text-shadow: 0 0 10px rgba(0, 0, 255, 1) !important;
      background-color: rgba(0, 0, 255, 0.08) !important;
      border: 1px solid transparent !important;
      color: rgba(0, 0, 255, 1) !important;
    }
  `;
  // 将样式插入文档头部
  document.head.appendChild(style);

  /**
   * 解析速度字符串，返回对应的字节数
   * @param {string} speedStr - 格式如 "2.43 MiB/s"
   * @returns {number} 速度，单位字节/秒
   */
  function parseSpeed(speedStr) {
    if (!speedStr) return 0;
    const units = {
      'B/s': 1,
      'K/s': 1024,
      'M/s': 1024 * 1024,
      'MiB/s': 1024 * 1024,
      'G/s': 1024 * 1024 * 1024,
      'GiB/s': 1024 * 1024 * 1024,
    };
    // 正则匹配数字和单位
    const regex = /^([\d.]+)\s*([BKMG]i?B\/s)$/i;
    const match = speedStr.match(regex);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2];
    return num * (units[unit] || 1);
  }

  /**
   * 颜色映射函数，使用平方根映射，保证颜色变化更均匀自然
   * @param {number} speed 当前速度，字节/秒
   * @param {number} maxSpeed 最大速度阈值，字节/秒
   * @param {string} type 上传或下载 "upload" | "download"
   * @returns {string} rgb颜色字符串
   */
  function speedToColor(speed, maxSpeed, type) {
    // 速度为0或无效时，返回浅色
    if (speed <= 0) return type === 'upload' ? 'rgb(255,200,200)' : 'rgb(200,200,255)';
    // 计算速度占比的平方根，做平滑渐变
    const ratio = Math.min(Math.sqrt(speed / maxSpeed), 1);

    if (type === 'upload') {
      // 红色调渐变，r固定255，g,b从200降至0
      const r = 255;
      const g = Math.round(200 * (1 - ratio));
      const b = Math.round(200 * (1 - ratio));
      return `rgb(${r},${g},${b})`;
    } else {
      // 蓝色调渐变，b固定255，r,g从200降至0
      const r = Math.round(200 * (1 - ratio));
      const g = Math.round(200 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  }

  /**
   * 根据速度给元素添加对应动画效果等级的class
   * @param {HTMLElement} elem 目标元素
   * @param {number} speed 当前速度，字节/秒
   * @param {string} type "upload" 或 "download"
   */
  function applyEffect(elem, speed, type) {
    // 移除所有等级class，避免叠加
    elem.classList.remove(
      'speed-level-1', 'speed-level-2', 'speed-level-3',
      'speed-level-4', 'speed-level-5',
      'speed-level-1-dl', 'speed-level-2-dl', 'speed-level-3-dl',
      'speed-level-4-dl', 'speed-level-5-dl'
    );

    const M = 1024 * 1024;
    let level = 0;
    // 根据速度区间划分等级
    if (speed > 50 * M) level = 5;
    else if (speed > 30 * M) level = 4;
    else if (speed > 20 * M) level = 3;
    else if (speed > 10 * M) level = 2;
    else if (speed > 0) level = 1;

    if (level > 0) {
      // 构造对应class名，区分上传和下载
      const className = `speed-level-${level}${type === 'download' ? '-dl' : ''}`;
      elem.classList.add(className);
    }
  }

  /**
   * 主刷新函数：读取速度文本，更新颜色和动画效果
   */
  function updateSpeedColors() {
    // 选择页面中符合条件的p标签（含上传和下载速度）
    const speedElems = document.querySelectorAll('p[class*="text-[11px]"]');
    if (speedElems.length < 2) return;

    const uploadElem = speedElems[0];    // 第一个是上传速度元素
    const downloadElem = speedElems[1];  // 第二个是下载速度元素

    const uploadStr = uploadElem.textContent.trim();
    const downloadStr = downloadElem.textContent.trim();

    // 解析速度字符串转字节
    const uploadSpeed = parseSpeed(uploadStr);
    const downloadSpeed = parseSpeed(downloadStr);

    // 更新颜色，使用平滑渐变函数
    uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
    downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

    // 根据速度应用动画效果等级
    applyEffect(uploadElem, uploadSpeed, 'upload');
    applyEffect(downloadElem, downloadSpeed, 'download');
  }

  // 定时调用刷新函数，页面不可见时暂停
  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
