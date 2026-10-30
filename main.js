if (process.argv.includes('--thumbnail-worker')) {
  require('./thumbnail-worker.cjs');
} else {
const path = require("path");
const { pathToFileURL } = require("url");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");
const { createPreferencesStore, resolveImportStartPath } = require("./preferences.cjs");

let cachedStore = null;
ipcMain.handle("border-lab:app-version", () => app.getVersion());
const browsedPhotos = new Map();
const photoThumbnails = new Map();
const { createThumbnailService } = require('./thumbnail-service.cjs');
const thumbnailService = createThumbnailService(process.execPath, app.getAppPath());
let thumbnailEpoch = 0;
ipcMain.handle('border-lab:pause-thumbnails', () => { thumbnailEpoch++; thumbnailService.cancel(); });
app.on('before-quit', () => thumbnailService.cancel());
ipcMain.handle("border-lab:photo-thumbnail", async (event, filePath) => {
  const epoch = thumbnailEpoch;
  if (!browsedPhotos.get(event.sender.id)?.has(filePath)) throw new Error("Unknown photo");
  const stat = await fs.stat(filePath);
  if (epoch !== thumbnailEpoch) return null;
  const key = `${filePath}:${stat.size}:${stat.mtimeMs}`;
  if (photoThumbnails.has(key)) {
    const cached = photoThumbnails.get(key);
    photoThumbnails.delete(key); photoThumbnails.set(key, cached);
    return cached;
  }
  const data = await thumbnailService.request(filePath,path.join(app.getPath('userData'),'photo-thumbnails'));
  if (!data) return null;
  photoThumbnails.set(key, data);
  while (photoThumbnails.size > 256) photoThumbnails.delete(photoThumbnails.keys().next().value);
  return data;
});

ipcMain.handle("border-lab:browse-photos", async (event, changeFolder) => {
  const store = getPreferenceStore();
  const saved = await store.read();
  let directory = saved.photoBrowserDir || saved.lastImportDir;
  if (changeFolder || !directory || !(await fs.stat(directory).catch(() => null))?.isDirectory()) {
    const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
      title: "选择照片文件夹", defaultPath: directory, properties: ["openDirectory"]
    });
    if (result.canceled) return { canceled: true };
    directory = result.filePaths[0];
  }
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const collator = new Intl.Collator("zh-CN", { numeric: true });
  const files = entries.filter(entry => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
    .sort((a, b) => collator.compare(a.name, b.name))
    .map(entry => ({ name: entry.name, path: path.join(directory, entry.name),
      url: pathToFileURL(path.join(directory, entry.name)).href,
      mimeType: /\.png$/i.test(entry.name) ? "image/png" : /\.webp$/i.test(entry.name) ? "image/webp" : "image/jpeg" }));
  browsedPhotos.set(event.sender.id, new Map(files.map(file => [file.path, file])));
  await store.merge({ photoBrowserDir: directory });
  return { directory, files, lastFile: saved.lastImportFile };
});

ipcMain.handle("border-lab:choose-photos", async (event, paths) => {
  const available = browsedPhotos.get(event.sender.id);
  if (!Array.isArray(paths) || !paths.length || paths.some(value => !available?.has(value))) {
    throw new Error("请重新打开照片文件夹后选择照片。");
  }
  const files = [...new Set(paths)].map(value => available.get(value));
  const last = files[files.length - 1].path;
  await getPreferenceStore().merge({ lastImportFile: last, lastImportDir: path.dirname(last) });
  return { canceled: false, files };
});

function getPreferenceStore() {
  if (!cachedStore) {
    cachedStore = createPreferencesStore(app.getPath("userData"));
  }
  return cachedStore;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1520,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    autoHideMenuBar: true,
    frame: false,
    show: true,
    backgroundColor: "#f5f5f7",
    icon: path.join(
      __dirname,
      "assets",
      process.platform === "win32" ? "app-icon.ico" : "app-icon.png"
    ),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  });

  const notifyFullscreen = () => win.webContents.send("border-lab:fullscreen-changed", win.isFullScreen());
  win.on("enter-full-screen", notifyFullscreen);
  win.on("leave-full-screen", notifyFullscreen);
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "Escape" && win.isFullScreen()) {
      event.preventDefault(); win.setFullScreen(false);
    }
  });
  win.loadFile("index.html");
}

ipcMain.handle("border-lab:open-photo", async (event) => {
  const store = getPreferenceStore();
  const saved = await store.read();
  const owner = BrowserWindow.fromWebContents(event.sender);
  const options = {
    title: "导入照片",
    // A file path opens the dialog with that photo already selected, so the
    // list is scrolled to the place the user left it. Falls back to the folder.
    defaultPath: await resolveImportStartPath(saved),
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "jpeg", "png", "webp"]
      }
    ]
  };
  // Passing the owner window keeps this the app's own dialog, which is what
  // lets defaultPath win over the system's own last-folder guess.
  const result = owner
    ? await dialog.showOpenDialog(owner, options)
    : await dialog.showOpenDialog(options);

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const firstPath = result.filePaths[0];
  await store.merge({
    lastImportFile: firstPath,
    lastImportDir: path.dirname(firstPath)
  });

  return {
    canceled: false,
    files: result.filePaths.map((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      const mimeType = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp"
      }[extension] || "application/octet-stream";

      return {
        name: path.basename(filePath),
        mimeType,
        path: filePath,
        url: pathToFileURL(filePath).href
      };
    })
  };
});

ipcMain.handle("border-lab:read-photo-file", async (_event, filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  }[extension] || "application/octet-stream";
  const data = await fs.readFile(filePath);

  return {
    name: path.basename(filePath),
    mimeType,
    data
  };
});

ipcMain.handle("border-lab:window-control", (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) {
    return;
  }

  if (action === "fullscreen") {
    const fullscreen = !win.isFullScreen();
    win.setFullScreen(fullscreen);
    win.webContents.send("border-lab:fullscreen-changed", fullscreen);
  } else if (action === "minimize") {
    win.minimize();
  } else if (action === "maximize") {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  } else if (action === "close") {
    win.close();
  }
});

ipcMain.handle("border-lab:save-file", async (_event, payload) => {
  const { suggestedName, mimeType, data } = payload;
  const store = getPreferenceStore();
  const saved = await store.read();
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const filterExtensions = extension === "png" ? ["png"] : ["jpg", "jpeg"];
  const suggestedPath = saved.lastExportDir
    ? path.join(saved.lastExportDir, suggestedName)
    : suggestedName;
  const result = await dialog.showSaveDialog({
    defaultPath: suggestedPath,
    filters: [
      {
        name: extension === "png" ? "PNG Image" : "JPEG Image",
        extensions: filterExtensions
      }
    ]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  await fs.writeFile(result.filePath, Buffer.from(data));
  await store.merge({ lastExportDir: path.dirname(result.filePath) });
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle("border-lab:save-files", async (_event, payload) => {
  const store = getPreferenceStore();
  const saved = await store.read();
  const result = await dialog.showOpenDialog({
    title: "选择导出文件夹",
    defaultPath: saved.lastExportDir,
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const directory = result.filePaths[0];
  for (const file of payload.files || []) {
    const safeName = path.basename(file.name);
    await fs.writeFile(path.join(directory, safeName), Buffer.from(file.data));
  }

  await store.merge({ lastExportDir: directory });
  return { canceled: false, directory };
});

ipcMain.handle("border-lab:save-watermark", async (_event, data, fileName) => {
  await getPreferenceStore().merge({ watermarkData: data, watermarkFileName: fileName });
  return { success: true };
});

ipcMain.handle("border-lab:load-watermark", async () => {
  const saved = await getPreferenceStore().read();
  return {
    data: saved.watermarkData || null,
    fileName: saved.watermarkFileName || null
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
}
