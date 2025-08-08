function addBlueRotateWhenReady() {
  const target = document.querySelector('.scrollbar-hidden.z-50.flex.flex-col.items-start.overflow-x-scroll.rounded-\\[50px\\] > .flex.items-center.gap-1.rounded-\\[50px\\].bg-stone-100.p-\\[3px\\].dark\\:bg-stone-800');
  if (target) {
    if (!document.getElementById('blue-fine-rotate-style')) {
      const style = document.createElement('style');
      style.id = 'blue-fine-rotate-style';
      style.textContent = `
        .blue-fine-rotate {
          position: relative;
          border-radius: 50px;
          z-index: 0;
          border: 3px solid transparent;
        }
        .blue-fine-rotate::before {
          content: '';
          position: absolute;
          top: -3px; left: -3px; right: -3px; bottom: -3px;
          border-radius: 53px;
          border: 2px solid rgba(0, 112, 255, 0.8);
          box-shadow:
            0 0 5px 1px rgba(0, 112, 255, 0.7),
            0 0 10px 2px rgba(0, 112, 255, 0.5),
            0 0 15px 3px rgba(0, 112, 255, 0.3);
          animation: fine-rotate 1.5s linear infinite;
          z-index: -1;
          pointer-events: none;
        }
        @keyframes fine-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    target.classList.add('blue-fine-rotate');
  } else {
    // 元素没找到，1秒后再试
    setTimeout(addBlueRotateWhenReady, 1000);
  }
}

// 启动检测
addBlueRotateWhenReady();
