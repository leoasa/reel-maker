const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    saveFile: (options) => ipcRenderer.invoke('save-file', options),
    platform: process.platform
  }
); 