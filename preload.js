const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("desktop-window");
});

contextBridge.exposeInMainWorld("borderLabDesktop", {
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
