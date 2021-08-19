const {app, BrowserWindow, Menu, Tray} = require('electron');
const clipboard = require('electron-clipboard-extended');
const path = require('path');

let mainWindow = null;
let tray = null;

app.on('ready', () => {
    // ***************************************************
    // *                mainWindow                       
    // ***************************************************                                                           
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, '..', 'icon.ico'),
        // autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true, 
            enableRemoteModule: true, 
            preload: path.join(__dirname, '..', 'renderer', 'preload.js')
        }      //要在electron里正常显示deepl网页版contextIsolation必须要是true
    });
    mainWindow.on('close', (event) => {
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
        tray = null;

    });
    mainWindow.on('minimize',(event) => {
        event.preventDefault();
        mainWindow.hide();
    });
    mainWindow.loadURL("https://www.deepl.com/translator");


    // ***************************************************
    // *                    tray                       
    // ***************************************************  
    tray = new Tray(path.join(__dirname, '..', 'icon.ico'))
    const template = [
        { label: 'Show', type: 'normal', click() {mainWindow.show();} },
        { label: 'Exit', type: 'normal', click() {app.isQuiting = true; app.quit();} },
        ];
    const contextMenu = Menu.buildFromTemplate(template)
    tray.setToolTip('MyDeepL')
    tray.setContextMenu(contextMenu)
    tray.on('click',()=>{
        mainWindow.show();
    })



    // ***************************************************
    // *                clipboard                       
    // ***************************************************
    clipboard.once('text-changed', function checkDoublePressCtrlC() {
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
    
    })
    clipboard.startWatching();
})



// Quit when all windows are closed.
app.on("window-all-closed", function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.isQuiting = true;
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