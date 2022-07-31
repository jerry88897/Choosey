const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const { dialog } = require("electron");
const ipc = require("electron").ipcMain;
const getWeb = require("./getWeb");
const parser = require("./parser");
const timer = require("./timer");
const makeJson = require("./makeJson");
const preSelect = require("./preSelect");
const preSelectPage = require("./preSelectPage");
const preSelectPageAction = require("./preSelectPageAction");
const fastSelect = require("./fastSelect");
const screen = require("electron").screen;

const fastSelectText = `{"isLock":false,"fastSelectBlock":[{"id":0,"enable":false,"trigger":0,"list":[]},{"id":1,"enable":false,"trigger":0,"list":[]},{"id":2,"enable":false,"trigger":0,"list":[]},{"id":3,"enable":false,"trigger":0,"list":[]},{"id":4,"enable":false,"trigger":0,"list":[]}]}`;
const gotTheLock = app.requestSingleInstanceLock();
let win;
let user = {
  id: "",
  grade: "",
  number: "",
  name: "",
  ps: "",
};
let depNo = new Map([
  ["M", "01"],
  ["E", "02"],
  ["C", "03"],
  ["D", "04"],
  ["B", "05"],
  ["I", "06"],
  ["T", "07"],
  ["S", "09"],
  ["W", "10"],
  ["N", "12"],
  ["V", "14"],
  ["L", "15"],
  ["Q", "16"],
  ["K", "17"],
  ["H", "19"],
]);
let NTPTimeDiff = 0;
preSelectPageAction.setGetWeb(getWeb);
preSelectPageAction.setParser(parser);
preSelectPageAction.setTimer(timer);
// Make a request for a user with a given ID

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  console.log(width + "x" + height);
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1400,
    minHeight: 850,
    show: false,
    backgroundColor: "#2b2a33",
    icon: __dirname + "./icon/Icon.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged,
      webviewTag: true,
    },
  });
  if (app.isPackaged) {
    mainWindow.removeMenu();
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  win = mainWindow;
  timer.setWindow(win);
  timer.setPreSelectPageAction(preSelectPageAction);
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "./index.html"));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", async function (e) {
    if (require("electron-squirrel-startup")) return;
    console.log("At dir " + __dirname);
    let loc = process.cwd();
    //dialog.showErrorBox("At dir", path.join(loc, "/src/data"));
    try {
      await fs.promises.access(path.join(loc, "/src/data"));
    } catch (e) {
      //dialog.showErrorBox("失敗", e.code);
      await fs.promises.mkdir(path.join(loc, "/src/data"), { recursive: true });
      await fs.promises.writeFile(
        path.join(loc, "/src/data/fastSelect.json"),
        fastSelectText
      );
      await fs.promises.writeFile(
        path.join(loc, "/src/data/PreSelectPage.json"),
        "[]"
      );
      await fs.promises.writeFile(
        path.join(loc, "/src/data/PreSelectPageSetting.json"),
        `{"isSet":false,"isPlay":false}`
      );
      await fs.promises.writeFile(
        path.join(loc, "/src/data/setting.json"),
        `{"selectStartDate":"2022-01-27T10:30","activate":false,"key":""}`
      );
      await fs.promises.writeFile(
        path.join(loc, "/src/data/shoppingCart.json"),
        "[]"
      );
      await fs.promises.writeFile(
        path.join(loc, "/src/data/state.json"),
        `{"preload":0,"fastSelect":[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],"isFastSelectFinish":false,"preSelect":[0,0,0,0,0],"barPo":0,"authKeyState":0,"authKeyDate":""}`
      );
    } finally {
      timer.loadState();
      let date = timer.getNTPTime();
      date
        .then(function (timeDiff) {
          NTPTimeDiff = timeDiff;
          createWindow();
          setInterval(function () {
            let date = timer.getNTPTime();
            date.then(function (timeDiff) {
              NTPTimeDiff = timeDiff;
              win.webContents.send("updateNTP", NTPTimeDiff);
            });
          }, 25 * 60 * 1000);
        })
        .catch(function (err) {
          dialog.showErrorBox(
            "連線失敗",
            "無法連線至外部終端機，請檢查網路連線"
          );
          createWindow();
          //app.quit();
        });
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipc.on("getControlCenter", async function (e) {
  // let date = timer.getNTPTime();
  // date.then(function (timeDiff) {
  //   console.log(timeDiff);
  //   win.webContents.send("readyToShowControlCenter", timeDiff);
  // });
  win.webContents.send("readyToShowControlCenter", NTPTimeDiff);
});

ipc.on("getMyClass", async function (e) {
  console.log("mainGetMyClass");
  let response = getWeb.getMyClass();
  console.log(response);
  console.log("success");
  let myClass = parser.myClassParser(response);
  let allMyClass;
  let allPromise = [];
  myClass
    .then(async function (success) {
      allMyClass = success;
      for (let i = 0; i < allMyClass.length; i++) {
        //for (let i = 0; i < 2; i++) {
        allPromise.push(
          new Promise(function (resolve, reject) {
            console.log("parser RE " + allMyClass[i]["id"]);
            response = getWeb.getMyClassDate(allMyClass[i]["id"]);
            let addClassTime = parser.myClassDateParser(response);
            addClassTime
              .then(async function (success) {
                allMyClass[i]["time"] = success;
                console.log("111111");
                resolve();
              })
              .catch((fail) => {
                console.log(fail);
              });
          })
        );
      }
    })
    .then((success) => {
      Promise.all(allPromise).then(function (values) {
        console.log("2222222");
        let makeFilePromise = makeJson.myClassToJson(allMyClass);
        makeFilePromise
          .then(async function (success) {
            win.webContents.send("readyToShow");
            console.log("readyToShow");
          })
          .catch((fail) => {
            console.log(fail);
          });

        let currentPath = process.cwd();
        console.log("@@" + currentPath);
        win.webContents.send("appLocat", currentPath);
      });
    })
    .catch((fail) => {
      console.log(fail);
    });

  //myClass[i] = parser.myClassDateParser(response,myClass[i]);

  //}

  //parser.myClassParser(iconv.decode(Buffer.from(success.data), "big5"));
  //console.log('!!'+iconv.decode(Buffer.from(s), "big5"));
  //win.webContents.send('myClass',iconv.decode(Buffer.from(Data), "big5"));*/
});

ipc.on("getClassClass", async function (e, SelDepNo, SelClassNo) {
  console.log("mainGetClassClass");
  if (SelDepNo == 0) {
    SelDepNo = user.grade.substring(1, 2);
    SelClassNo = user.grade;
  }
  let response = getWeb.GetClassClass(depNo.get(SelDepNo), SelClassNo);
  let classClassListparser = parser.classClassListParser(response);
  let allMyClass;
  let allPromise = [];

  classClassListparser
    .then(async function (data) {
      let selected = data[data.length - 1];
      data.pop();
      if (typeof selected == "undefined") {
        selected = data[0];
      }
      SelClassNo = selected;
      let myClass = parser.classClassParser(response, SelDepNo, SelClassNo);
      myClass
        .then(async function (success) {
          allMyClass = success;
          for (let i = 0; i < allMyClass.length; i++) {
            //for (let i = 0; i < 2; i++) {
            allPromise.push(
              new Promise(function (resolve, reject) {
                console.log("parser RE " + allMyClass[i]["id"]);
                response = getWeb.getMyClassDate(allMyClass[i]["id"]);
                let addClassTime = parser.myClassDateParser(response);
                addClassTime
                  .then(async function (success) {
                    allMyClass[i]["time"] = success;
                    console.log("111111");
                    resolve();
                  })
                  .catch((fail) => {
                    console.log(fail);
                  });
              })
            );
          }
        })
        .then((success) => {
          Promise.all(allPromise).then(function (values) {
            console.log("2222222");
            let makeFilePromise = makeJson.ClassClassToJson(allMyClass);
            makeFilePromise
              .then(async function (success) {
                win.webContents.send(
                  "readyToShowClassClass",
                  SelDepNo,
                  selected,
                  data
                );
              })
              .catch((fail) => {
                console.log(fail);
              });
            let currentPath = process.cwd();
            console.log("@@" + currentPath);
            win.webContents.send("appLocat", currentPath);
          });
        })
        .catch((fail) => {
          console.log(fail);
        });
    })
    .catch((fail) => {
      console.log(fail);
    });
});
ipc.on("getGeneralClass", async function (e) {
  console.log("getGeneralClass");
  let response = getWeb.getGeneralClass();
  let allGeneralClass;
  let allPromise = [];
  let generalClass = parser.classClassParser(response, "G", "");
  generalClass
    .then(async function (success) {
      allGeneralClass = success;
      for (let i = 0; i < allGeneralClass.length; i++) {
        allPromise.push(
          new Promise(function (resolve, reject) {
            console.log("parser RE " + allGeneralClass[i]["id"]);
            response = getWeb.getMyClassDate(allGeneralClass[i]["id"]);
            let addClassTime = parser.myClassDateParser(response);
            addClassTime
              .then(async function (success) {
                allGeneralClass[i]["time"] = success;
                console.log("111111");
                resolve();
              })
              .catch((fail) => {
                console.log(fail);
              });
          })
        );
      }
    })
    .then((success) => {
      Promise.all(allPromise).then(function (values) {
        console.log("2222222");
        let makeFilePromise = makeJson.generalClassToJson(allGeneralClass);
        makeFilePromise
          .then(async function (success) {
            win.webContents.send("readyToShowGeneralClass");
          })
          .catch((fail) => {
            console.log(fail);
          });
      });
    })
    .catch((fail) => {
      console.log(fail);
    });
});
ipc.on("addPreSelectClass", async function (e, preSelectThisClass, callFrom) {
  await preSelect.addPreSelectClass(preSelectThisClass);
  win.webContents.send("updatePreSelectClass", callFrom);
  console.log("addPreSelectClass");
});
ipc.on("removePreSelectClass", async function (e, removeThisClass, callFrom) {
  await preSelect.removePreSelectClass(removeThisClass);
  win.webContents.send("updatePreSelectClass", callFrom);
});
ipc.on(
  "removePreSelectClassAndUpdate",
  async function (e, removeThisClass, callFrom) {
    await preSelect.removePreSelectClass(removeThisClass);
    win.webContents.send("updatePreSelectClassAndMain", callFrom);
  }
);
ipc.on(
  "preSelectPageRemovePreSelectClass",
  async function (e, removeThisClass, callFrom) {
    await preSelect.removePreSelectClass(removeThisClass);
    win.webContents.send("updatePreSelectClassInPreSelectPage", callFrom);
  }
);
ipc.on("preSelectPageRemoveClass", async function (e, removeThisClass) {
  await preSelectPage.removePreSelectClass(removeThisClass);
  win.webContents.send("updatePreSelectPage");
});
ipc.on("exportPreSelectClass", async function (e, exportThisClass) {
  await preSelect.exportPreSelectClass(exportThisClass);
  win.webContents.send("updatePreSelectPage");
});
ipc.on("copyPreSelectClass", async function (e, exportThisClass) {
  await preSelect.copyPreSelectClass(exportThisClass);
});

ipc.on("fastSelectPaste", async function (e, fastSelectNo) {
  await fastSelect.pasteSelectClass(
    preSelect.getCopiedPreSelectClass(),
    fastSelectNo
  );
  win.webContents.send("updateFastSelectPage");
});
ipc.on("fastSelectdelete", async function (e, pos) {
  //let jpos = JSON.parse(pos);
  await fastSelect.deleteClass(pos.row, pos.column);
  win.webContents.send("updateFastSelectPage");
});

ipc.on("updatePreSelect", async function (e, data) {
  if (data["engage"] == true) {
    timer.setPreSelectTimer(getWeb);
  } else {
    timer.deletPreSelectTimer();
  }
});

ipc.on("login", async function (e, data) {
  console.log(data);
  user.id = data.id;
  user.ps = data.ps;
  timer.setUserId(user.id);
  let resoult = await getWeb.login(data);
  timer.setGetWeb(getWeb);
  console.log("!!" + resoult);
  win.webContents.send("loginRe", resoult);
  let userGradeResoult = getWeb.getUserGrade();
  let userData = parser.gradeParser(userGradeResoult);
  userData
    .then(async function (userData) {
      user.grade = userData.grade;
      user.number = userData.number;
      user.name = userData.name;
      if (
        user.grade[2] === "1" ||
        user.grade[2] === "2" ||
        user.grade[2] === "3"
      ) {
        preSelectPageAction.setMaxPoint(220);
      } else {
        preSelectPageAction.setMaxPoint(250);
      }
      timer.checkToRestartTimer();
    })
    .catch((fail) => {
      console.log(fail);
    });

  setInterval(function () {
    getWeb.passCheck();
  }, 3 * 60 * 1000);
});
ipc.on("loadPage2", async function (e) {
  win.loadFile(path.join(__dirname, "./index2.html"));
});

ipc.on("startSequence", async function () {
  timer.checkToRestartTimer();
});
ipc.on("stopSequence", async function () {
  timer.stopAllTimer();
});
ipc.on("getGoogleInternetStatus", async function () {
  let status = getWeb.getGoogleInternetStatus();
  status
    .then(function (data) {
      console.log(data.timing);
      win.webContents.send("updateGoogleInternetStatus", data.timing);
    })
    .catch((err) => {
      console.log(err);
    });
});
ipc.on("getTTUInternetStatus", async function () {
  let status = getWeb.getTTUInternetStatus();
  status
    .then(function (data) {
      console.log(data.timing);
      win.webContents.send("updateTTUInternetStatus", data.timing);
    })
    .catch((err) => {
      console.log(err);
    });
});
ipc.on("getUserData", async function () {
  win.webContents.send("updateUserData", user);
});
ipc.on("updatePreSelectClassInfo", async function () {
  preSelectPageAction.updatedClassState().then(function () {
    win.webContents.send("updatePreSelectClassInfo", user);
  });
});
ipc.on("doToThisClass", async function (e, data, page) {
  let [action, id] = data.split("_");
  if (action == "s") {
    getWeb.sendAddClass(id).then(function () {
      win.webContents.send("reLoadPage", page);
      console.log("add" + id);
    });
  } else if (action == "d") {
    getWeb.sendDelClass(id).then(function () {
      win.webContents.send("reLoadPage", page);
      console.log("des" + id);
    });
  }
});
ipc.on("restart", async function (e) {
  app.relaunch();
  app.quit();
});
