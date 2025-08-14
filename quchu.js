// 去除顶部显示按钮

['radix-:r0:', 'radix-:r2:'].forEach(id => {
  const btn = document.querySelector(`button#${id.replace(/:/g, '\\:')}`);
  if (btn) btn.remove();
});
