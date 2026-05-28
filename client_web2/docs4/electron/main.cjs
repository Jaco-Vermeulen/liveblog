/**
 * Electron main process for Liveblog Docs4.
 * Loads the static export (docs4/build/index.html) in a window.
 * When packaged: build/ is in extraResources (process.resourcesPath/build).
 * When dev: build/ is docs4/build (run npm run build first).
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function getBuildDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build');
  }
  return path.join(__dirname, '..', 'build');
}

function createWindow() {
  const buildDir = getBuildDir();
  const indexHtml = path.join(buildDir, 'index.html');

  if (!fs.existsSync(indexHtml)) {
    console.error('Build not found. Run from docs4: npm run build first.');
    app.quit();
    return;
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Liveblog Documentation',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  win.loadFile(indexHtml, { query: {}, search: '' });
  win.on('closed', () => app.quit());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
