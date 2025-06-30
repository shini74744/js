const p = document.querySelector('p.text-base.font-semibold');

if (p) {
  const hour = new Date().getHours();
  let greetings = [];

  if (hour >= 7 && hour < 9) {
    greetings = [
      '🌅 早上好，新的一天开始啦～',
      '☀️ 早安，今天也要充满朝气哦！',
      '🌤️ 美好的一天从阳光早餐开始～'
    ];
  } else if (hour >= 9 && hour < 12) {
    greetings = [
      '☀️ 上午好，今天也要元气满满哦～',
      '🕘 上午好，愿你效率满满～',
      '📈 保持状态，迎接高效的一上午！'
    ];
  } else if (hour >= 12 && hour < 14) {
    greetings = [
      '🍜 中午好，记得按时吃饭休息一下～',
      '☀️ 午饭时间到啦，来点能量吧～',
      '😌 放松一下，午休时间珍贵哦～'
    ];
  } else if (hour >= 14 && hour < 18) {
    greetings = [
      '🌞 下午好，继续加油，不要犯困哦～',
      '💼 下午时光，专注而充实～',
      '🫖 来杯茶，提提神再冲刺一波！'
    ];
  } else if (hour >= 18 && hour < 20) {
    greetings = [
      '🌇 傍晚好，辛苦啦，准备收工了吗～',
      '🧘‍♂️ 傍晚时分，放松一下吧～',
      '🌆 工作一天，别忘了犒劳自己～'
    ];
  } else if (hour >= 20 && hour < 24) {
    greetings = [
      '🌙 晚上好，放松一下，好好休息～',
      '📺 晚上适合追剧or放空自己～',
      '🛋️ 忙了一天，是时候享受静谧的夜晚～'
    ];
  } else {
    greetings = [
      '🌌 夜深了，早点休息，晚安～',
      '😴 别熬夜哦，身体最重要～',
      '🌙 夜已深，梦里也要开心～'
    ];
  }

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  p.textContent = randomGreeting;
}
