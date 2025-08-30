
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false, // Key change: Remove the default window frame
    titleBarStyle: 'hidden', // Hides title bar on macOS, necessary for custom ones
  });

  // Load the app.
  const startUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '../out/index.html')}`;
  win.loadURL(startUrl);

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }

  // IPC listeners for window controls
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    win.close();
  });
}

// Remove the default application menu
Menu.setApplicationMenu(null);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
