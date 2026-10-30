// Preference storage and dialog start-path helpers shared by the desktop shell.
// Kept free of Electron imports so the path rules can be tested with plain Node.
const path = require("path");
const fs = require("fs/promises");

function createPreferencesStore(userDataDir) {
  const filePath = path.join(userDataDir, "preferences.json");

  async function read() {
    try {
      const text = await fs.readFile(filePath, "utf8");
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  async function write(preferences) {
    await fs.mkdir(userDataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(preferences, null, 2), "utf8");
  }

  async function merge(patch) {
    const current = await read();
    const next = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value || key === "watermarkData" || key === "watermarkFileName") {
        next[key] = value;
      }
    }
    await write(next);
    return next;
  }

  return { filePath, read, write, merge };
}

async function pathExists(target) {
  if (!target) {
    return false;
  }
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

// Opens the import dialog on the photo picked last time, so the file list is
// already scrolled to it. Falls back to its folder, then to the system default.
async function resolveImportStartPath(preferences = {}) {
  if (await pathExists(preferences.lastImportFile)) {
    return preferences.lastImportFile;
  }
  if (await pathExists(preferences.lastImportDir)) {
    return preferences.lastImportDir;
  }
  return undefined;
}

module.exports = { createPreferencesStore, pathExists, resolveImportStartPath };
