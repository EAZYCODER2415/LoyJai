export const createPausableTimeouts = () => {
  const pending = new Set();
  let paused = false;

  const start = (task) => {
    task.startedAt = performance.now();
    task.timeoutId = window.setTimeout(() => {
      task.timeoutId = null;
      if (paused) {
        task.remaining = 0;
        return;
      }
      pending.delete(task);
      task.callback();
    }, task.remaining);
  };

  return {
    schedule(callback, delay) {
      const task = {
        callback,
        remaining: Math.max(0, delay),
        startedAt: 0,
        timeoutId: null
      };
      pending.add(task);
      if (!paused) start(task);
      return () => {
        if (task.timeoutId !== null) window.clearTimeout(task.timeoutId);
        pending.delete(task);
      };
    },
    pause() {
      if (paused) return;
      paused = true;
      const now = performance.now();
      pending.forEach(task => {
        if (task.timeoutId === null) return;
        window.clearTimeout(task.timeoutId);
        task.timeoutId = null;
        task.remaining = Math.max(0, task.remaining - (now - task.startedAt));
      });
    },
    resume() {
      if (!paused) return;
      paused = false;
      pending.forEach(task => {
        if (task.timeoutId === null) start(task);
      });
    },
    clearAll() {
      pending.forEach(task => {
        if (task.timeoutId !== null) window.clearTimeout(task.timeoutId);
      });
      pending.clear();
    }
  };
};
