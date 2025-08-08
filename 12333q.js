function addBlueRotateWhenReady() {
  const target = document.querySelector('.scrollbar-hidden.z-50.flex.flex-col.items-start.overflow-x-scroll.rounded-\\[50px\\] > .flex.items-center.gap-1.rounded-\\[50px\\].bg-stone-100.p-\\[3px\\].dark\\:bg-stone-800');
  if (target) {
    if (!document.getElementById('blue-fine-rotate-style')) {
      const style = document.createElement('style');
      style.id = 'blue-fine-rotate-style';
      style.textContent = `
        .blue-fine-rotate {
          position: relative;
          z-index: 0;
          /* 不加 border 保持大小 */
          outline: none;
        }
        .blue-fine-rotate::before {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          border-radius: 56px;
          background: 
            conic-gradient(from 0deg, rgba(0,112,255,0.8), rgba(0,112,255,0) 70%);
          box-shadow:
            0 0 8px 3px rgba(0,112,255,0.6),
            0 0 12px 5px rgba(0,112,255,0.4);
          animation: fine-rotate 1.5s linear infinite;
          z-index: 1;
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
