const { app, BrowserWindow, globalShortcut} = require('electron')
const clipboard = require('electron-clipboard-extended')
const path = require('path')

let mainWindow = null;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // minWidth:650,
        // minHeight:600,
        webPreferences: {
            nodeIntegration: true, 
            enableRemoteModule: true, 
            preload: path.join(__dirname, 'js', 'preload.js')
        }      //要在electron里正常显示deepl网页版contextIsolation必须要是true
    })
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.loadURL("https://www.deepl.com/translator");

    clipboard.once('text-changed', checkDoublePressCtrlC)
    clipboard.startWatching();
})


// Quit when all windows are closed.
app.on("window-all-closed", function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  
  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

function checkDoublePressCtrlC() {
    clipboard.stopWatching();
    let currentText = clipboard.readText()
    clipboard.clear()
    setTimeout(() => {
        if(currentText == clipboard.readText()) {
            mainWindow.show();
            mainWindow.webContents.send('translateClipboard');
        } else {
            clipboard.writeText(currentText)
        }
        clipboard.once('text-changed', checkDoublePressCtrlC)
        clipboard.startWatching();
    },200)

}