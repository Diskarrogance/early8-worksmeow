import { app, BrowserWindow, Tray, ipcMain, nativeImage } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 360,
    minHeight: 500,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, '../../resources/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 猫耳朵拖拽
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript(`
      document.addEventListener('mousedown', (e) => {
        if (e.target.closest('[data-drag-region]')) {
          window.electronAPI?.startDrag();
        }
      });
    `);
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../resources/icons/cat-tray.png')
  );
  tray = new Tray(icon.resize({ width: 24, height: 24 }));
  tray.setToolTip('EarlyEight · 我上早八');
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// IPC: 窗口控制
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:close', () => mainWindow?.hide());
ipcMain.on('window:drag', () => mainWindow?.webContents.send('window:drag-start'));
ipcMain.on('window:quit', () => app.quit());

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // 托盘留在系统，不退出
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
