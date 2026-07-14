// 职责：专注会话的计时与focusLevel计算。

export class FocusSession {
  constructor(targetMinutes = 25) {
    this.targetMinutes = targetMinutes;
    this.elapsedSeconds = 0;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
    this.elapsedSeconds = 0;
  }

  tick(deltaSeconds) {
    if (this.isRunning) {
      this.elapsedSeconds += deltaSeconds;
    }
  }

  getFocusLevel() {
    const targetSeconds = this.targetMinutes * 60;
    if (targetSeconds <= 0) return 0;
    return Math.min(this.elapsedSeconds / targetSeconds, 1);
  }
}
