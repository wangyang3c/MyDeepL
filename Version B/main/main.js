const {app, BrowserWindow, Menu, Tray, shell} = require('electron');
const path = require('path');
const ioHook = require('iohook');
const openAboutWindow = require('about-window').default;
const fs = require('fs');


let mainWindow = null;
let tray = null;

// ***************************************************
// *                create or load config                       
// *************************************************** 
const configFilePath = path.join(__dirname, '..', 'config.json');
var config = null;
if (!fs.existsSync(configFilePath)){
  config = { 
    autoDeleteNewlines: true,
    autoCopy: false,  
  };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), {flag: 'wx'})   // null - represents the replacer function.  2 - represents the spaces to indent.
} else {
  config = JSON.parse(fs.readFileSync(configFilePath));
}





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
  fs.writeFile(configFilePath, JSON.stringify(config, null, 2),(err) => {
    if (err) console.log('Config save failed!');
    else console.log('The config has been saved!');
  })
  console.log("Quit")
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

// 最多只能打开一个app实例， 重复打开会显示之前的
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.isQuiting = true;
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      mainWindow.show();
    }
  })
}

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


    mainWindow.webContents.openDevTools()

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
            checked: config.autoDeleteNewlines,
            click(menuItem, browserWindow, event) {
                config.autoDeleteNewlines = !config.autoDeleteNewlines
            }
          }, 
          { 
            label: "Auto-copy translation",
            type: "checkbox",
            checked: config.autoCopy,
            click(menuItem, browserWindow, event) {
                config.autoCopy = !config.autoCopy;
            }
          }
        ]
      },
      {
        label: "Help",
        submenu: [{
            label: "GitHub",
            click() {shell.openExternal("https://github.com/wangyang3c/MyDeepL");}
            },{
            label: "About",
            click() {
              openAboutWindow({
                icon_path: path.join(__dirname,"..", "icon.ico"),
                product_name: "MyDeepL",
                homepage: "https://github.com/wangyang3c/MyDeepL",
                copyright: "Copyright © 2021 wangyang3c",
                win_options: {
                  resizable: false,
                  parent: mainWindow,
                  modal: true,
              },
                show_close_button: 'Close',
              })
            }
        }]
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
          mainWindow.webContents.send('translateClipboard',config);
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



