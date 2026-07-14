/** 共享缓动函数（IncenseGreeting、PoseManager 等复用） */

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * 连续正弦振荡（与粒子湍流等 dt 驱动周期效果同一思路）。
 * @param {number} elapsedSec 累计时间（秒）
 * @param {number} cycleSec 完整周期（秒）
 * @param {number} [phaseRad=0] 初相位（弧度）
 */
export function sineWave(elapsedSec, cycleSec, phaseRad = 0) {
  return Math.sin((elapsedSec / cycleSec) * Math.PI * 2 + phaseRad);
}
