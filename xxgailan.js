const p = document.querySelector('p.text-base.font-semibold');

if (p) {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour >= 7 && hour < 9) {
    greeting = '🌅 早上好';
  } else if (hour >= 9 && hour < 12) {
    greeting = '☀️ 上午好';
  } else if (hour >= 12 && hour < 14) {
    greeting = '🍜 中午好';
  } else if (hour >= 14 && hour < 18) {
    greeting = '🌞 下午好';
  } else if (hour >= 18 && hour < 20) {
    greeting = '🌇 🌇 傍晚好，准备下班了吗～';
  } else if (hour >= 20 && hour < 24) {
    greeting = '🌙 晚上好';
  } else {
    greeting = '🌌 夜深了 该休息啦';
  }

  p.textContent = greeting;
}
