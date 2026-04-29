const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("borderLabDesktop", {
  openPhoto: async () => {
    return ipcRenderer.invoke("border-lab:open-photo");
  },
  readPhotoFile: async (filePath) => {
    return ipcRenderer.invoke("border-lab:read-photo-file", filePath);
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
  }
});
