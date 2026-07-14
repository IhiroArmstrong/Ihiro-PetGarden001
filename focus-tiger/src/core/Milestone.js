// 职责：里程碑数据计算（连续天数、累计时长）。本任务只搭骨架，
// 真实的读写与判定逻辑是 Task 3/Task 7 的工作。

export class Milestone {
  constructor(storage) {
    this.storage = storage;
  }

  recordSession(durationMinutes) {
    // TODO(Task 3): 记录本次专注会话时长
  }

  getStreakDays() {
    // TODO(Task 3): 计算连续专注天数
    return 0;
  }

  getTotalMinutes() {
    // TODO(Task 3): 计算累计专注总时长
    return 0;
  }
}
