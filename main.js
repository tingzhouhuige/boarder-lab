const path = require("path");
const { pathToFileURL } = require("url");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");

const preferencesPath = () => path.join(app.getPath("userData"), "preferences.json");

async function readPreferences() {
  try {
    const text = await fs.readFile(preferencesPath(), "utf8");
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function writePreferences(preferences) {
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(preferencesPath(), JSON.stringify(preferences, null, 2), "utf8");
}

async function updatePreference(key, value) {
  if (!value) {
    return;
  }
  const preferences = await readPreferences();
  preferences[key] = value;
  await writePreferences(preferences);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1520,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    autoHideMenuBar: true,
    frame: false,
    backgroundColor: "#f8f5ef",
    icon: path.join(
      __dirname,
      "assets",
      process.platform === "win32" ? "app-icon.ico" : "app-icon.png"
    ),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile("index.html");
}

ipcMain.handle("border-lab:open-photo", async () => {
  const preferences = await readPreferences();
  const result = await dialog.showOpenDialog({
    title: "导入照片",
    defaultPath: preferences.lastImportDir,
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "jpeg", "png", "webp"]
      }
    ]
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  await updatePreference("lastImportDir", path.dirname(result.filePaths[0]));

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

  if (action === "minimize") {
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
  const preferences = await readPreferences();
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const filterExtensions = extension === "png" ? ["png"] : ["jpg", "jpeg"];
  const suggestedPath = preferences.lastExportDir
    ? path.join(preferences.lastExportDir, suggestedName)
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
  await updatePreference("lastExportDir", path.dirname(result.filePath));
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle("border-lab:save-files", async (_event, payload) => {
  const preferences = await readPreferences();
  const result = await dialog.showOpenDialog({
    title: "选择导出文件夹",
    defaultPath: preferences.lastExportDir,
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

  await updatePreference("lastExportDir", directory);
  return { canceled: false, directory };
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
