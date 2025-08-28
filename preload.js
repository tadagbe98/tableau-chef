// preload.js

// Toutes les API Node.js sont disponibles dans le processus de préchargement.
// Il a la même sandbox qu'une extension Chrome.
const { contextBridge, ipcRenderer } = require('electron');

// Par mesure de sécurité, n'exposez pas les API Node.js complètes au processus de rendu.
// Exposez uniquement les fonctionnalités nécessaires de manière contrôlée.
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemple d'une fonction que le processus de rendu peut appeler
  // et qui interagit avec le processus principal d'Electron.
  // sendMessage: (message) => ipcRenderer.send('some-channel', message)
});
