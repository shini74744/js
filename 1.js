document.addEventListener('DOMContentLoaded', () => {
  const p = document.querySelector('p.text-base.font-semibold');
  if (!p) return;

  const greetings = {
    morning: ['🌅 早上好，新的一天开始啦～', '🌞 早上好！今天也要元气满满～'],
    forenoon: ['☀️ 上午好，保持专注～', '💼 上午好，工作顺利哦～'],
    noon: ['🍜 中午好，记得吃饭哦～', '🥢 中午好，适当休息一下吧～'],
    afternoon: ['🌞 下午好，加把劲再冲一波～', '📚 下午好，别打瞌睡哦～'],
    evening: ['🌇 傍晚好，准备下班了吗～', '🧘‍♂️ 傍晚好，放松一下～'],
    night: ['🌙 晚上好，放松放松～', '🛋️ 晚上好，看点喜欢的东西吧～'],
    late: ['🌌 夜深了，早点休息吧～', '🛏️ 夜深了，注意身体别熬夜～']
  };

  function getGreetingByHour(hour) {
    if (hour >= 7 && hour < 9) return random(greetings.morning);
    if (hour >= 9 && hour < 12) return random(greetings.forenoon);
    if (hour >= 12 && hour < 14) return random(greetings.noon);
    if (hour >= 14 && hour < 18) return random(greetings.afternoon);
    if (hour >= 18 && hour < 20) return random(greetings.evening);
    if (hour >= 20 && hour < 24) return random(greetings.night);
    return random(greetings.late);
  }

  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const hour = new Date().getHours();
  p.textContent = getGreetingByHour(hour);
});
