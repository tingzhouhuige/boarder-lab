const { spawn } = require('child_process');

// Windows shell thumbnail providers may stall. Never run them in the process
// that owns the application window; the whole worker can be discarded on input.
function createThumbnailService(executable, appPath, timeoutMs = 3000) {
  let worker = null, nextId = 0;
  const pending = new Map();
  const finish = (id, value) => {
    const item = pending.get(id);
    if (!item) return;
    clearTimeout(item.timer); pending.delete(id); item.resolve(value);
  };
  const cancel = () => {
    const old = worker; worker = null;
    for (const id of pending.keys()) finish(id, null);
    if (old) { old.removeAllListeners('message'); old.kill(); }
  };
  const start = () => {
    if (worker) return worker;
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = spawn(executable, [appPath, '--thumbnail-worker'], {
      windowsHide: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'], env
    });
    worker = child;
    child.on('message', message => { if (child === worker) finish(message.id, message.data || null); });
    const lost = () => { if (worker === child) cancel(); };
    child.on('error', lost); child.on('exit', lost);
    return child;
  };
  return {
    cancel,
    request(filePath, cacheDir) {
      return new Promise(resolve => {
        const id = ++nextId;
        pending.set(id, { resolve, timer: setTimeout(cancel, timeoutMs) });
        try { start().send({ id, filePath, cacheDir }, error => { if (error) finish(id, null); }); }
        catch { finish(id, null); }
      });
    }
  };
}
module.exports = { createThumbnailService };
