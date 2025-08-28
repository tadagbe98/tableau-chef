const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  // Créer la fenêtre du navigateur.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // et charger l'index.html de l'application.
  const startUrl = isDev
    ? 'http://localhost:9002' // URL du serveur de développement Next.js
    : `file://${path.join(__dirname, 'out/index.html')}`; // URL de la version buildée et statique
  
  win.loadURL(startUrl);

  // Ouvrir les outils de développement.
  if (isDev) {
    win.webContents.openDevTools();
  }
  
  // Créer un menu d'application personnalisé
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement après cet événement.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Sur macOS, il est commun de recréer une fenêtre dans l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées, sauf sur macOS. Sur macOS, il est commun
// pour les applications et leur barre de menu de rester actives jusqu’à ce que l’utilisateur
// quitte explicitement avec Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
