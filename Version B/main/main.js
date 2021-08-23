const {app, BrowserWindow, Menu, Tray, shell} = require('electron');
const path = require('path');
const ioHook = require('iohook');


var mainWindow = null;
var tray = null;

// ***************************************************
// *                app                       
// *************************************************** 
app.on('ready', () => {

    createMainWindow();
    createMainMenu();
    createTray();
    createDoublePressCtrlCListener();

})

app.on('before-quit', () => {
  ioHook.stop();
});

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

// ***************************************************
// *                mainWindow                       
// ***************************************************   
function createMainWindow() {                                       
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, '..', 'icon.ico'),
        // autoHideMenuBar: true,
        webPreferences: {
            // nodeIntegration: true, 
            // enableRemoteModule: true, 
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

    // opening link in new browser instead of in the app
    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    })
    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    })
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    })


    // mainWindow.webContents.openDevTools()

  }


// ***************************************************
// *                mainMenu                    
// *************************************************** 
function createMainMenu() {
    const template = [
      {
        label: "Options",
        submenu: [
          { 
            label: "Auto-delete newlines",
            type: "checkbox",
            checked: true,
            click(menuItem, browserWindow, event) {
                mainWindow.webContents.send("setAutoDeleteNewlines", menuItem.checked);
            }
          }, 
          { 
            label: "Auto-copy translation",
            type: "checkbox",
            checked: false,
            click(menuItem, browserWindow, event) {
                mainWindow.webContents.send("setAutoCopy", menuItem.checked);
            }
          }
        ]
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


// ***************************************************
// *                tray                    
// ***************************************************
function createTray() {
    tray = new Tray(path.join(__dirname, '..', 'icon.ico'));
    const template = [
        { label: 'Show', type: 'normal', click() {mainWindow.show();}},
        { label: 'Exit', type: 'normal', click() {app.isQuiting = true; app.quit();}},
        ];
    const contextMenu = Menu.buildFromTemplate(template);
    tray.setToolTip('MyDeepL');
    tray.setContextMenu(contextMenu);
    tray.on('click',()=>{
        mainWindow.show();
    })
}

// ***************************************************
// *                DoublePressCtrlCListener                    
// ***************************************************
function createDoublePressCtrlCListener() {
    var PressCtrlC = false;
    ioHook.on("keydown", event => {
        if(event.ctrlKey && event.keycode === 46 && !PressCtrlC) {
          PressCtrlC = true;
          setTimeout(() => {
            PressCtrlC = false;
          },400)
        } else if(event.ctrlKey && event.keycode === 46 && PressCtrlC) {
          mainWindow.webContents.send('translateClipboard');
          PressCtrlC = false;
          // 这里必须加个延时，不然可能无法正常聚焦窗口
          setTimeout(() => {
            mainWindow.show(); 
          },400)

        } else {
          PressCtrlC = false;
        }
        // console.log(event); // {keychar: 'f', keycode: 19, rawcode: 15, type: 'keup'}
     });
     ioHook.start();
}



