const path = require("path");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");

function createWindow() {
  const win = new BrowserWindow({
    width: 1520,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    autoHideMenuBar: true,
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

ipcMain.handle("border-lab:save-file", async (_event, payload) => {
  const { suggestedName, mimeType, data } = payload;
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const filterExtensions = extension === "png" ? ["png"] : ["jpg", "jpeg"];
  const result = await dialog.showSaveDialog({
    suggestedName,
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
  return { canceled: false, filePath: result.filePath };
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
