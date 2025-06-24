/* 等级1：颜色变化，仅颜色 */
.speed-level-1,
.speed-level-1-dl {
  font-weight: normal;
  animation: none;
  text-shadow: none;
}

/* 等级2：呼吸闪烁 */
@keyframes subtle-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}
.speed-level-2,
.speed-level-2-dl {
  font-weight: bold;
  animation: subtle-glow 2s infinite ease-in-out;
}

/* 等级3：边框发光 */
.speed-level-3,
.speed-level-3-dl {
  font-weight: bold;
  animation: border-glow 1.5s infinite ease-in-out;
}

/* 等级4：加上背景脉冲 */
.speed-level-4 {
  font-weight: bold;
  animation: border-glow 1.5s infinite ease-in-out,
             background-pulse 1.8s infinite ease-in-out;
  background-color: rgba(255, 0, 0, 0.08);
  border-radius: 4px;
}
.speed-level-4-dl {
  font-weight: bold;
  animation: border-glow 1.5s infinite ease-in-out,
             background-pulse 1.8s infinite ease-in-out;
  background-color: rgba(0, 0, 255, 0.08);
  border-radius: 4px;
}

/* 等级5：全特效 */
.speed-level-5 {
  font-weight: bold;
  animation: color-glow 1.5s infinite ease-in-out,
             background-pulse 1.5s infinite ease-in-out,
             text-shadow-pulse 1.2s infinite ease-in-out,
             border-glow 1.2s infinite ease-in-out;
  text-shadow: 0 0 10px rgba(255, 0, 0, 1);
  background-color: rgba(255, 0, 0, 0.08);
  border-radius: 4px;
  border: 1px solid transparent;
  position: relative;
  z-index: 0;
}
.speed-level-5-dl {
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
