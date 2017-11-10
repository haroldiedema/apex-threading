const path          = require('path'),
      app           = require('electron').app,
      BrowserWindow = require('electron').BrowserWindow;

app.on('ready', () => {
    let hwnd = new BrowserWindow({
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });

    hwnd.loadURL(path.join('file://', __dirname, 'test.html'));
    hwnd.on('ready-to-show', () => {
        hwnd.show();
    });
    hwnd.webContents.openDevTools();
});
