const { app, BrowserWindow } = require('electron')



let mainWindow = null;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        minWidth:500,
        minHeight:500,
        webPreferences: {nodeIntegration: true, contextIsolation: false, enableRemoteModule: true},
    })
    mainWindow.loadFile('index.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })

})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })