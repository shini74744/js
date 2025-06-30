const p = document.querySelector('p.text-base.font-semibold');

if (p) {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour >= 7 && hour < 9) {
    greeting = '🌅 早上好，新的一天开始啦～';
  } else if (hour >= 9 && hour < 12) {
    greeting = '☀️ 上午好，今天也要元气满满哦～';
  } else if (hour >= 12 && hour < 14) {
    greeting = '🍜 中午好，记得按时吃饭休息一下～';
  } else if (hour >= 14 && hour < 18) {
    greeting = '🌞 下午好，继续加油，不要犯困哦～';
  } else if (hour >= 18 && hour < 20) {
    greeting = '🌇 傍晚好，辛苦啦，准备收工了吗～';
  } else if (hour >= 20 && hour < 24) {
    greeting = '🌙 晚上好，放松一下，好好休息～';
  } else {
    greeting = '🌌 夜深了，早点休息，晚安～';
  }

  p.textContent = greeting;
}
