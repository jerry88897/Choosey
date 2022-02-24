const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const path = require('path');
const {
  electron
} = require('process');

const ipc = require('electron').ipcMain;
const getWeb = require('./getWeb');
const parser = require('./parser');
const timer = require('./timer');
const makeJson = require('./makeJson');
const iconv = require("iconv-lite");
const screen = require('electron').screen;


let win
// Make a request for a user with a given ID


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const {
    width,
    height
  } = screen.getPrimaryDisplay().workAreaSize
  console.log(width + "x" + height);
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1400,
    minHeight: 850,
    show: false,
    backgroundColor: '#2b2a33',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged,
      webviewTag: true
    }
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
  })
  win = mainWindow;
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  
  // Register a shortcut listener for Ctrl + Shift + I
  //globalShortcut.register('Control+Shift+I', () => {
      // When the user presses Ctrl + Shift + I, this function will get called
      // You can modify this function to do other things, but if you just want
      // to disable the shortcut, you can just return false
      //return false;
  //});
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.



ipc.on('getMyClass', async function (e) {
  console.log("mainGetMyClass");
  var response = getWeb.loginAndGetClass();
  console.log(response);
  console.log('success');
  var myClass = parser.myClassParser(response);
  var allMyClass;
  let allPromise = [];
  myClass.then(async function (success) {
      allMyClass = success;
      for (let i = 0; i < allMyClass.length; i++) {
        //for (let i = 0; i < 2; i++) {
        allPromise.push(new Promise(function (resolve, reject) {
          console.log("parser RE " + allMyClass[i]["id"]);
          response = getWeb.getMyClassDate(allMyClass[i]["id"]);
          var addClassTime = parser.myClassDateParser(response);
          addClassTime.then(async function (success) {
              allMyClass[i]["time"] = success
              console.log("111111");
              resolve();
            })
            .catch(fail => {
              console.log(fail);
            });
        }))
      }
    }).then(success => {
      Promise.all(allPromise).then(function (values) {
        console.log("2222222");
        makeJson.myClassToJson(allMyClass);
        win.webContents.send("readyToShow");
        var currentPath = process.cwd();
        console.log('@@'+currentPath);
        win.webContents.send('appLocat',currentPath);
      });
    })
    .catch(fail => {
      console.log(fail);
    });


  //myClass[i] = parser.myClassDateParser(response,myClass[i]);

  //}


  //parser.myClassParser(iconv.decode(Buffer.from(success.data), "big5"));
  //console.log('!!'+iconv.decode(Buffer.from(s), "big5"));
  //win.webContents.send('myClass',iconv.decode(Buffer.from(Data), "big5"));*/
})

ipc.on('updatePreSelect', async function (e,data) {
  if(data["engage"]==true){
    timer.setPreSelectTimer(getWeb);
  }else{
    timer.deletPreSelectTimer();
  }
})

ipc.on('login', async function (e, data) {

  console.log(data);
  var resoult = await getWeb.login(data);
  console.log('!!' + resoult);
  win.webContents.send('loginRe', resoult);
  setInterval(function () {
    getWeb.passCheck();
  },3*60*1000)
})
ipc.on('loadPage2', async function (e) {
  win.loadFile(path.join(__dirname, './index2.html'));
})


//npm start