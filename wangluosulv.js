(function () {
  const REFRESH_INTERVAL = 500; // 刷新间隔，单位毫秒
  const MAX_SPEED = 50 * 1024 * 1024; // 最大速度阈值，50MB/s

  // 动态创建style标签，插入页面，定义样式和动画
  const style = document.createElement('style');
  style.textContent = `
    /* 上传下载速度显示的p元素样式 */
    p[class*="text-[11px]"] {
      display: inline-flex !important;         /* 使用inline-flex布局，图标和文字横向排列 */
      align-items: center !important;          /* 垂直居中对齐 */
      line-height: 1 !important;                /* 行高设为1 */
      transition: color 0.5s ease;              /* 颜色渐变过渡 */
      position: relative;                        /* 相对定位，方便以后扩展 */
      padding: 0 !important;                    /* 去除默认内边距 */
      margin: 0 !important;                     /* 去除默认外边距 */
      border-radius: 4px;                       /* 圆角 */
    }

    /* svg图标样式，固定大小，和文字间距 */
    p[class*="text-[11px]"] svg {
      flex-shrink: 0 !important;                /* 不允许缩小 */
      width: 1em;                               /* 宽度1em，和字体大小一致 */
      height: 1em;                              /* 高度1em */
      margin-right: 4px !important;             /* 右侧留4px间距 */
      vertical-align: middle !important;        /* 垂直居中 */
    }

    /* 颜色闪烁动画，红色调 */
    @keyframes color-glow {
      0%, 100% { color: rgba(255, 0, 0, 0.7); text-shadow: 0 0 5px rgba(255, 0, 0, 0.7); }
      50% { color: rgba(255, 50, 50, 1); text-shadow: 0 0 12px rgba(255, 50, 50, 1); }
    }

    /* 边框发光动画，红色 */
    @keyframes border-glow {
      0%, 100% { box-shadow: 0 0 5px 0 rgba(255, 0, 0, 0.6); }
      50% { box-shadow: 0 0 15px 3px rgba(255, 0, 0, 1); }
    }

    /* 背景颜色脉冲，红色 */
    @keyframes background-pulse {
      0%, 100% { background-color: rgba(255, 0, 0, 0.1); }
      50% { background-color: rgba(255, 0, 0, 0.25); }
    }

    /* 文字阴影脉冲，红色 */
    @keyframes text-shadow-pulse {
      0%, 100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.6); }
      50% { text-shadow: 0 0 15px rgba(255, 0, 0, 1); }
    }

    /* 上传速度等级1效果 */
    .speed-boost-1 {
      font-weight: bold;                        /* 加粗字体 */
      animation: color-glow 1.5s infinite ease-in-out; /* 颜色闪烁动画 */
      text-shadow: 0 0 4px rgba(255, 0, 0, 0.5); /* 轻微红色阴影 */
    }

    /* 上传速度等级2效果 */
    .speed-boost-2 {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out; /* 颜色闪烁 */
      text-shadow: 0 0 6px rgba(255, 0, 0, 0.8);       /* 更明显红色阴影 */
    }

    /* 上传速度等级3效果（最高） */
    .speed-boost-3 {
      font-weight: bold;
      /* 颜色闪烁 + 背景脉冲 + 文字阴影脉冲 + 边框发光 多动画叠加 */
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out;
      text-shadow: 0 0 10px rgba(255, 0, 0, 1);           /* 强烈红色阴影 */
      background-color: rgba(255, 0, 0, 0.08);             /* 半透明红色背景 */
      border-radius: 4px;                                   /* 圆角 */
      border: 1px solid transparent;                        /* 透明边框，方便动画 */
      position: relative;
      z-index: 0;
    }

    /* 下载速度等级1效果，蓝色调 */
    .speed-boost-1-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 4px rgba(0, 0, 255, 0.5);
      color: rgba(0, 0, 255, 0.8) !important;
    }

    /* 下载速度等级2效果 */
    .speed-boost-2-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out;
      text-shadow: 0 0 6px rgba(0, 0, 255, 0.8);
      color: rgba(0, 0, 255, 1) !important;
    }

    /* 下载速度等级3效果（最高） */
    .speed-boost-3-dl {
      font-weight: bold;
      animation: color-glow 1.5s infinite ease-in-out,
                 background-pulse 1.5s infinite ease-in-out,
                 text-shadow-pulse 1.2s infinite ease-in-out,
                 border-glow 1.2s infinite ease-in-out;
      text-shadow: 0 0 10px rgba(0, 0, 255, 1);
      background-color: rgba(0, 0, 255, 0.08);
      border-radius: 4px;
      border: 1px solid transparent;
      color: rgba(0, 0, 255, 1) !important;
      position: relative;
      z-index: 0;
    }
  `;
  document.head.appendChild(style);

  /**
   * 解析速度字符串，转换为字节/秒
   * 支持单位 B/s, K/s, M/s, MiB/s, G/s, GiB/s
   * @param {string} speedStr - 速度字符串，如 "2.43 MiB/s"
   * @returns {number} 速度对应的字节数
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
    const regex = /^([\d.]+)\s*([BKMG]i?B\/s)$/i;
    const match = speedStr.match(regex);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2];
    return num * (units[unit] || 1);
  }

  /**
   * 根据速度计算对应颜色（对数映射），上传红色调，下载蓝色调
   * @param {number} speed - 当前速度，字节/秒
   * @param {number} maxSpeed - 速度最大值，字节/秒
   * @param {string} type - "upload" 或 "download"
   * @returns {string} rgb颜色字符串
   */
  function speedToColor(speed, maxSpeed, type) {
    const logSpeed = Math.log10(speed + 1);       // 避免log(0)
    const logMax = Math.log10(maxSpeed + 1);
    const ratio = Math.min(logSpeed / logMax, 1); // 归一化0~1

    if (type === 'upload') {
      const r = 255;
      const g = Math.round(255 * (1 - ratio));
      const b = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},${b})`;               // 红色渐变
    } else {
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * (1 - ratio));
      const b = 255;
      return `rgb(${r},${g},${b})`;               // 蓝色渐变
    }
  }

  /**
   * 给元素添加对应速度等级的动画样式类
   * @param {HTMLElement} elem - 目标元素
   * @param {number} speed - 当前速度，字节/秒
   * @param {string} type - "upload" 或 "download"
   */
  function applyEffect(elem, speed, type) {
    // 先移除所有相关动画类，避免叠加
    elem.classList.remove(
      'speed-boost-1', 'speed-boost-2', 'speed-boost-3',
      'speed-boost-1-dl', 'speed-boost-2-dl', 'speed-boost-3-dl'
    );
    // 根据速度等级添加对应类
    if (speed > 50 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-3' : 'speed-boost-3-dl');
    } else if (speed > 20 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-2' : 'speed-boost-2-dl');
    } else if (speed > 10 * 1024 * 1024) {
      elem.classList.add(type === 'upload' ? 'speed-boost-1' : 'speed-boost-1-dl');
    }
  }

  /**
   * 主函数：定时更新上传和下载速度颜色和动画
   */
  function updateSpeedColors() {
    // 选择所有符合条件的速度显示p标签
    const speedElems = document.querySelectorAll('p[class*="text-[11px]"].flex.items-center.text-nowrap.font-semibold');
    if (speedElems.length < 2) return;

    const uploadElem = speedElems[0];   // 第一个是上传
    const downloadElem = speedElems[1]; // 第二个是下载

    const uploadStr = uploadElem.textContent.trim();
    const downloadStr = downloadElem.textContent.trim();

    const uploadSpeed = parseSpeed(uploadStr);
    const downloadSpeed = parseSpeed(downloadStr);

    // 设置颜色
    uploadElem.style.color = speedToColor(uploadSpeed, MAX_SPEED, 'upload');
    downloadElem.style.color = speedToColor(downloadSpeed, MAX_SPEED, 'download');

    // 应用动画特效
    applyEffect(uploadElem, uploadSpeed, 'upload');
    applyEffect(downloadElem, downloadSpeed, 'download');
  }

  // 定时执行刷新函数，页面隐藏时停止刷新
  setInterval(() => {
    if (!document.hidden) updateSpeedColors();
  }, REFRESH_INTERVAL);
})();
