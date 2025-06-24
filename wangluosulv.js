/* 小火焰动图边框 - 适用于等级4 */
.speed-level-4::after {
  content: "";
  position: absolute;
  top: -6px; left: -6px; right: -6px; bottom: -6px;
  background: url('https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif') no-repeat center;
  background-size: contain;
  pointer-events: none;
  z-index: -1;
  animation: flame-move 2s infinite linear;
  border-radius: 8px;
}

/* 大火焰动图边框 - 适用于等级5 */
.speed-level-5::after {
  content: "";
  position: absolute;
  top: -8px; left: -8px; right: -8px; bottom: -8px;
  background: url('https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif') no-repeat center;
  background-size: cover;
  pointer-events: none;
  z-index: -1;
  animation: flame-move 1.2s infinite linear;
  border-radius: 10px;
  filter: drop-shadow(0 0 5px rgba(255, 100, 0, 0.8));
}

/* 简单火焰动画，做点左右晃动 */
@keyframes flame-move {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5%); }
}
