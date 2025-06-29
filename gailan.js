const p = document.querySelector('p.text-base.font-semibold');
if (p && p.textContent.startsWith('👋')) {
  const text = p.textContent.slice(2);  // 去掉前面两个字符（包括emoji和空格）
  p.textContent = ' 🌟 ' + text;         // 替换为新 emoji 和原文字
}
