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
      webviewTag: true
    }
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  win = mainWindow;
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './index2.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
  myClass.then(async function (success) {
      return new Promise((resolve, reject) => {
        allMyClass = success;
        for (let i = 0; i < allMyClass.length; i++) {
          //for (let i = 0; i < 2; i++) {
          console.log("parser RE " + allMyClass[i]["id"]);
          response = getWeb.getMyClassDate(allMyClass[i]["id"]);
          var addClassTime = parser.myClassDateParser(response);
          addClassTime.then(async function (success){
              allMyClass[i]["time"]=success
              return new Promise((resolve, reject) => {
                console.log("111111");
                resolve();
              })
            }).then(success => {
              if (i == allMyClass.length - 1) {
                resolve();
              }
            })
            .catch(fail => {
              console.log(fail);
            });
        }
      });
    }).then(success => {
      console.log("2222222");
      makeJson.myClassToJson(allMyClass);
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

ipc.on('login', async function (e, data) {

  console.log(data);
  var resoult = await getWeb.login(data);
  console.log('!!' + resoult);
  win.webContents.send('loginRe', resoult);
})


//npm start