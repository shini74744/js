function addBlueRotateWhenReady() {
  const target = document.querySelector('.scrollbar-hidden.z-50.flex.flex-col.items-start.overflow-x-scroll.rounded-\\[50px\\] > .flex.items-center.gap-1.rounded-\\[50px\\].bg-stone-100.p-\\[3px\\].dark\\:bg-stone-800');
  if (target) {
    if (!document.getElementById('blue-fine-rotate-style')) {
      const style = document.createElement('style');
      style.id = 'blue-fine-rotate-style';
      style.textContent = `
        .blue-fine-rotate {
          position: relative;
          /* 不设置border，避免撑大元素 */
          /* 不增加padding，保持大小 */
          outline: none;
          z-index: 0;
        }
        .blue-fine-rotate::before {
          content: '';
          position: absolute;
          top: -6px;    /* 向外扩展6px */
          left: -6px;
          right: -6px;
          bottom: -6px;
          border-radius: 56px; /* 根据元素圆角微调 */
          border: 2px solid rgba(0, 112, 255, 0.8);
          box-shadow:
            0 0 6px 1px rgba(0, 112, 255, 0.7),
            0 0 12px 3px rgba(0, 112, 255, 0.5),
            0 0 20px 5px rgba(0, 112, 255, 0.3);
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
    setTimeout(addBlueRotateWhenReady, 1000);
  }
}

addBlueRotateWhenReady();
