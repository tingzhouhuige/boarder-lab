const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("desktop-window");
  ipcRenderer.on("border-lab:fullscreen-changed", (_event, fullscreen) => {
    const button = document.querySelector('[data-window-action="fullscreen"]');
    if (!button) return;
    const label = fullscreen ? "退出全屏（Esc）" : "进入全屏";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(fullscreen));
    button.title = label;
  });
});

contextBridge.exposeInMainWorld("borderLabDesktop", {
  getVersion: () => ipcRenderer.invoke("border-lab:app-version"),
  photoThumbnail: (filePath) => ipcRenderer.invoke("border-lab:photo-thumbnail", filePath),
  pauseThumbnails: () => ipcRenderer.invoke("border-lab:pause-thumbnails"),
  browsePhotos: (changeFolder = false) => ipcRenderer.invoke("border-lab:browse-photos", changeFolder),
  choosePhotos: (paths) => ipcRenderer.invoke("border-lab:choose-photos", paths),
  openPhoto: async () => {
    return ipcRenderer.invoke("border-lab:open-photo");
  },
  readPhotoFile: async (filePath) => {
    return ipcRenderer.invoke("border-lab:read-photo-file", filePath);
  },
  windowControl: async (action) => {
    return ipcRenderer.invoke("border-lab:window-control", action);
  },
  saveFile: async ({ suggestedName, mimeType, buffer }) => {
    return ipcRenderer.invoke("border-lab:save-file", {
      suggestedName,
      mimeType,
      data: new Uint8Array(buffer)
    });
  },
  saveFiles: async ({ files }) => {
    return ipcRenderer.invoke("border-lab:save-files", {
      files: files.map((file) => ({
        name: file.name,
        mimeType: file.mimeType,
        data: new Uint8Array(file.buffer)
      }))
    });
  },
  saveWatermark: async (data, fileName) => {
    return ipcRenderer.invoke("border-lab:save-watermark", data, fileName);
  },
  loadWatermark: async () => {
    return ipcRenderer.invoke("border-lab:load-watermark");
  }
});
