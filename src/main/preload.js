// preload.js placeholder
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("backendAPI", {
  notification: (payload) => ipcRenderer.invoke("notification", payload),
  auditlog: (payload) => ipcRenderer.invoke("auditlog", payload),
  booking: (payload) => ipcRenderer.invoke("booking", payload),
  room: (payload) => ipcRenderer.invoke("room", payload),
  guest: (payload) => ipcRenderer.invoke("guest", payload),
  dashboard: (payload) => ipcRenderer.invoke("dashboard", payload),
  // 🪟 Window controls
  windowControl: (payload) => ipcRenderer.invoke("window-control", payload),
  systemConfig: (payload) => ipcRenderer.invoke("systemConfig", payload),

  // 👤 User & Auth
  user: (payload) => ipcRenderer.invoke("user", payload),
  // 📂 File System
  fs: (payload) => ipcRenderer.invoke("fs", payload),

  // 🎯 Event listeners
  onAppReady: (callback) => {
    ipcRenderer.on("app-ready", callback);
    return () => ipcRenderer.removeListener("app-ready", callback);
  },
  on: (event, callback) => {
    ipcRenderer.on(event, callback);
    return () => ipcRenderer.removeListener(event, callback);
  },

  minimizeApp: () => ipcRenderer.send("window-minimize"),
  maximizeApp: () => ipcRenderer.send("window-maximize"),
  closeApp: () => ipcRenderer.send("window-close"),
  quitApp: () => ipcRenderer.send("app-quit"),

  // Other utilities
  showAbout: () => ipcRenderer.send("show-about"),

  // Setup specific
  skipSetup: () => ipcRenderer.send("skip-setup"),

  // Listeners
  onSetupComplete: (callback) => ipcRenderer.on("setup-complete", callback),

  // Database
  getSetupStatus: () => ipcRenderer.invoke("get-setup-status"),

  // 🛠️ Logging
  log: {
    info: (message, data) => console.log("[Renderer]", message, data),
    error: (message, error) => console.error("[Renderer]", message, error),
    warn: (message, warning) => console.warn("[Renderer]", message, warning),
  },
});
