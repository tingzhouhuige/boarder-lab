const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("borderLabDesktop", {
  saveFile: async ({ suggestedName, mimeType, buffer }) => {
    return ipcRenderer.invoke("border-lab:save-file", {
      suggestedName,
      mimeType,
      data: Array.from(new Uint8Array(buffer))
    });
  }
});
