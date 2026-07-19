// 职责：全局状态机唯一状态源。本任务只需定义状态常量和订阅机制骨架，
// 真正的状态流转规则（什么条件下从FOCUSING切到CELEBRATE等）是 Task 2 的工作。

export const STATES = Object.freeze({
  IDLE: 'IDLE',
  FOCUSING: 'FOCUSING',
  BREAK: 'BREAK',
  CELEBRATE: 'CELEBRATE',
  DORMANT: 'DORMANT'
});

export class StateManager {
  constructor() {
    this.state = STATES.IDLE;
    this._listeners = [];
  }

  setState(nextState) {
    // TODO(Task 2): 校验状态流转是否合法，非法流转应拒绝并给出警告
    if (nextState === this.state) return;
    this.state = nextState;
    this._listeners.forEach((cb) => cb(nextState));
  }

  onChange(callback) {
    this._listeners.push(callback);
  }
}
