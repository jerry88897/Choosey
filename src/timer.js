const fs = require("fs");
const ntpClient = require("ntp-client");
const NtpTimeSync = require("ntp-time-sync").NtpTimeSync;
const sender = require("./sendSelect");
const ipc = require("electron").ipcMain;
const {
  generateKeyPairSync,
  sign,
  verify,
  publicEncrypt,
  privateDecrypt,
} = require("crypto");
const options = {
  // list of NTP time servers, optionally including a port (defaults to 123)
  servers: [
    "time.google.com",
    "time1.facebook.com",
    "time.cloudflare.com",
    "time.asia.apple.com",
    "time.windows.com",
  ],
  // required amount of valid samples in order to calculate the time
  sampleCount: 8,
  // amount of time in milliseconds to wait for a single NTP response
  replyTimeout: 3000,
};
const timeSync = NtpTimeSync.getInstance(options);

let lastTimeDiff;
let allTimer = [];
let resendTimer;
let preSelectList;

let getWeb;
let userId = "";
let preLoadTimer;
let preLoadClass = [];
let fastSelectTimer = [];
let fastSelectReportCount = 0;
let repeatSelectTimer;
let repeatSelectInterval;
let intervalCount = 0;
let setting;
let win;
let preSelectPageAction;
let preSelectPageTimer;
let nowState = {
  preload: 0,
  fastSelect: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  isFastSelectFinish: false,
  preSelect: [0, 0, 0, 0, 0],
  barPo: 0,
  authKeyState: 0,
  authKeyDate: "",
};

module.exports = {
  getNTPTime: function () {
    return getNTPTime();
  },
  checkToRestartTimer: function () {
    checkToRestartTimer();
    return 0;
  },
  stopAllTimer: function () {
    stopAllTimer();
    return 0;
  },
  deletPreSelectTimer: function () {
    return deletPreSelectTimer();
  },
  loadState: function () {
    loadState();
    return 0;
  },
  setWindow: function (mainWindow) {
    win = mainWindow;
    return 0;
  },
  setGetWeb: function (getWebS) {
    getWeb = getWebS;
    return 0;
  },
  setUserId: function (UserId) {
    userId = UserId;
    return 0;
  },
  setPreSelectPageAction: function (preSelectPage) {
    preSelectPageAction = preSelectPage;
    return 0;
  },
  checkToStartPreSelectPageAction: function () {
    checkToStartPreSelectPageAction();
    return 0;
  },
  stopPreSelectPageAction: function () {
    stopPreSelectPageAction();
    return 0;
  },
  upDatePreSelectPageReport: function (add, remove, miss) {
    nowState.preSelect[1] = add;
    nowState.preSelect[2] = remove;
    nowState.preSelect[3] = miss;
    upDateState();
    return 0;
  },
};
async function getNTPTime() {
  return new Promise((resolve, reject) => {
    // ntpClient.getNetworkTime("time.google.com", 123, function (err, date) {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    //   timeDiff = Date.now() - Date.parse(date);
    //   console.log(Date.now());
    //   console.log(date);
    //   console.log(NTPData);
    //   console.log(timeDiff);
    //   console.log("timeDiff : ");
    //   console.log(timeDiff);
    //   resolve(date);
    // });
    timeSync
      .getTime()
      .then(function (result) {
        console.log("current system time", new Date());
        console.log("real time", result.now);
        console.log("offset in milliseconds", result.offset);
        lastTimeDiff = result.offset;
        resolve(result.offset);
      })
      .catch(function (err) {
        lastTimeDiff = null;
        console.log(err);
        reject(err);
      });
  });
}

function checkToRestartTimer() {
  let settingSaved;
  let settingPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile("./src/data/setting.json", function (err, settingData) {
      if (err) {
        console.log("no setting make new file");
        stopAllTimer();
        reject(err);
      } else {
        console.log("load setting");
        //將二進制數據轉換為字串符
        settingData = settingData.toString();

        resolve(settingData);
      }
    });
  });
  settingPromise
    .then(function (settingData) {
      //將字符串轉換為 JSON 對象
      settingSaved = JSON.parse(settingData);
      let sDay = Date.parse(settingSaved["selectStartDate"]);
      check()
        .then(function () {
          nowState.authKeyState = 4;
          upDateState();
          if (settingSaved["activate"] == true) {
            if (sDay - Date.now() <= 0) {
              if (typeof preLoadTimer != undefined) {
                clearTimeout(preLoadTimer);
              }
              nowState.barPo = 100;
              nowState.preload = 3;
              nowState.isFastSelectFinish = true;
              upDateState();
              checkToStartPreSelectPageAction();
            } else if (sDay - Date.now() <= 70 * 1000) {
              if (typeof preLoadTimer != undefined) {
                clearTimeout(preLoadTimer);
              }
              nowState.barPo = 0;
              nowState.isFastSelectFinish = false;
              upDateState();
              preLoadFastSelectTimer(settingSaved).then(function () {
                console.log("preLoadedFastSelectTimer");
                setFastSelectTimer(settingSaved);
              });
            } else if (sDay - Date.now() > 70 * 1000) {
              nowState.preload = 1;
              nowState.barPo = 0;
              nowState.isFastSelectFinish = false;
              upDateState();
              if (typeof preLoadTimer != undefined) {
                clearTimeout(preLoadTimer);
              }
              preLoadTimer = setTimeout(function () {
                preLoadFastSelectTimer(settingSaved).then(function () {
                  console.log("preLoadedFastSelectTimer");
                  setFastSelectTimer(settingSaved);
                });
              }, sDay - Date.now() - 60 * 1000);
            }
          } else {
            stopAllTimer();
          }
        })
        .catch(function (err) {
          nowState = {
            preload: 0,
            fastSelect: [
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
            ],
            isFastSelectFinish: false,
            preSelect: [0, 0, 0, 0, 0],
            barPo: 0,
            authKeyState: 0,
            authKeyDate: 0,
          };
          check_LastNtp();
          console.log(err);
          settingSaved["activate"] = false;
          fs.writeFile(
            "./src/data/setting.json",
            JSON.stringify(settingSaved),
            function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("make new setting file complete.");
              }
            }
          );
        });
    })
    .catch(function (error) {
      console.log(error);
    });
}
async function preLoadFastSelectTimer(settingSaved) {
  return new Promise(function (resolve, reject) {
    nowState.preload = 2;
    nowState.preSelect[0] = 2;
    upDateState();
    preLoadClass = [];
    fastSelectReportCount = 0;
    let fastSelectList;
    let fastSelectPromise = new Promise(function (resolve, reject) {
      console.log(1);
      fs.readFile(
        "./src/data/fastSelect.json",
        function (err, fastSelectListSaved) {
          if (err) {
            console.log("no FSS make new file");
            reject(err);
          } else {
            console.log("load FSS");
            //將二進制數據轉換為字串符
            fastSelectListSaved = fastSelectListSaved.toString();
            //將字符串轉換為 JSON 對象
            fastSelectList = JSON.parse(fastSelectListSaved);
            console.log(2);
            resolve("success");
          }
        }
      );
    });
    fastSelectPromise
      .then(function (success) {
        let sDay = Date.parse(settingSaved["selectStartDate"]);
        for (let i = 0; i < fastSelectList["fastSelectBlock"].length; i++) {
          let classString = "";
          if (fastSelectList["fastSelectBlock"][i]["enable"] == true) {
            let classCount = 0;
            for (
              let j = 0;
              j <= fastSelectList["fastSelectBlock"][i]["list"].length;
              j++
            ) {
              if (classCount == 5) {
                let classPkg = {
                  block: 0,
                  trigger: 0,
                  classString: "",
                };
                classPkg.block = i;
                classPkg.trigger =
                  fastSelectList["fastSelectBlock"][i]["trigger"];
                classPkg.classString = classString;
                preLoadClass.push(classPkg);
                classCount = 0;
                classString = "";
                classString =
                  classString +
                  fastSelectList["fastSelectBlock"][i]["list"][j]["id"] +
                  "%0D%0A";
                classCount++;
              } else if (
                j == fastSelectList["fastSelectBlock"][i]["list"].length
              ) {
                let classPkg = {
                  block: 0,
                  trigger: 0,
                  classString: "",
                };
                classPkg.block = i;
                classPkg.trigger =
                  fastSelectList["fastSelectBlock"][i]["trigger"];
                classPkg.classString = classString;
                preLoadClass.push(classPkg);
              } else {
                classString =
                  classString +
                  fastSelectList["fastSelectBlock"][i]["list"][j]["id"] +
                  "%0D%0A";
                classCount++;
              }
            }
          }
        }
        resolve(0);
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      });
  });
}
function setFastSelectTimer(settingSaved) {
  console.log("setting fastSelectTimer");
  let sDay = Date.parse(settingSaved["selectStartDate"]);
  return new Promise(function (resolve, reject) {
    let repeatSelectPromise = [];
    nowState.barPo = 50;
    nowState.isFastSelectFinish = false;
    upDateState();
    for (let i = 0; i < preLoadClass.length; i++) {
      if (preLoadClass[i].block != 4) {
        nowState.fastSelect[preLoadClass[i].block][0] = 1;
        upDateState();
        fastSelectTimer.push(
          setTimeout(function () {
            sender.setCookie(getWeb.getCookie());
            console.log("send" + preLoadClass[i].classString);
            let senderResoult = sender.sendFastSelect(
              preLoadClass[i].classString,
              0
            );
            nowState.fastSelect[preLoadClass[i].block][0] = 2;
            upDateState();
            senderResoult
              .then(function () {
                nowState.fastSelect[preLoadClass[i].block][1] += 1;
                upDateState();
                fastSelectReportCount++;
                checkIfFastSelectFinish();
              })
              .catch(function () {
                nowState.fastSelect[preLoadClass[i].block][2] += 1;
                upDateState();
                fastSelectReportCount++;
                checkIfFastSelectFinish();
              });
          }, sDay - Date.now() + preLoadClass[i].trigger * 1000)
        );
      } else {
        nowState.fastSelect[preLoadClass[i].block][0] = 1;
        upDateState();
        repeatSelectTimer = setTimeout(function () {
          nowState.fastSelect[preLoadClass[i].block][0] = 2;
          upDateState();
          intervalCount = 0;
          sender.setCookie(getWeb.getCookie());
          repeatSelectInterval = setInterval(function () {
            if (intervalCount < 10) {
              console.log("To" + intervalCount);
              repeatSelectPromise.push(
                sender.sendFastSelect(
                  preLoadClass[i].classString,
                  intervalCount + 1
                )
              );
              nowState.fastSelect[preLoadClass[i].block][2] += 1;
              upDateState();
              intervalCount++;
              Promise.any(repeatSelectPromise)
                .then(function (number) {
                  if (typeof repeatSelectInterval != undefined) {
                    clearInterval(repeatSelectInterval);
                  }
                  nowState.fastSelect[preLoadClass[i].block][0] = 3;
                  nowState.fastSelect[preLoadClass[i].block][1] = number;
                  upDateState();
                  fastSelectReportCount++;
                  checkIfFastSelectFinish();
                  console.log("To" + intervalCount + "at" + number);
                })
                .catch(function (error) {
                  console.log(+intervalCount + "timeOut");
                });
            } else {
              nowState.fastSelect[preLoadClass[i].block][0] = 4;
              upDateState();
              fastSelectReportCount++;
              checkIfFastSelectFinish();
              if (typeof repeatSelectInterval != undefined) {
                clearInterval(repeatSelectInterval);
              }
            }
          }, preLoadClass[i].trigger * 1000);
        }, sDay - Date.now());
      }
    }
  });
}
async function setPreSelectTimer(getWeb) {
  let readPreSelect = new Promise(function (resolve, reject) {
    fs.readFile(
      "./src/data/preSelect.json",
      function (err, preSelectListSaved) {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log("load PRS");
          //將二進制數據轉換為字串符
          preSelectListSaved = preSelectListSaved.toString();
          //將字符串轉換為 JSON 對象
          preSelectList = JSON.parse(preSelectListSaved);
          resolve("success");
        }
      }
    );
  });
  let readSetting = new Promise(function (resolve, reject) {
    fs.readFile("./src/data/setting.json", function (err, settingSaved) {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log("load setting");
        //將二進制數據轉換為字串符
        settingSaved = settingSaved.toString();
        //將字符串轉換為 JSON 對象
        setting = JSON.parse(settingSaved);
        resolve("success");
      }
    });
  });
  Promise.all([readPreSelect, readSetting]).then(() => {
    console.log("setting time");
    let sDay = Date.parse(setting["selectStartDate"]);
    let leftTime = sDay - Date.now();
    for (let i = 0; i < 4; i++) {
      if (preSelectList["preSelectBlock"][i].enable == true) {
        console.log("set");
        allTimer.push(
          setTimeout(function () {
            console.log(i);
            sender.setCookie(getWeb.getCookie());
            if (preSelectList["preSelectBlock"][i]["list"][0].length > 2) {
              console.log(
                "send" +
                  preSelectList["preSelectBlock"][i]["list"][0].replace(
                    /[\r\n]+/gm,
                    "%0D%0A"
                  )
              );
              sender.sendFastSelect(
                preSelectList["preSelectBlock"][i]["list"][0].replace(
                  /[\r\n]+/gm,
                  "%0D%0A"
                )
              );
            }
            if (preSelectList["preSelectBlock"][i]["list"][1].length > 2) {
              console.log(
                "send" +
                  preSelectList["preSelectBlock"][i]["list"][1].replace(
                    /[\r\n]+/gm,
                    "%0D%0A"
                  )
              );
              sender.sendFastSelect(
                preSelectList["preSelectBlock"][i]["list"][1].replace(
                  /[\r\n]+/gm,
                  "%0D%0A"
                )
              );
            }
          }, leftTime + preSelectList["preSelectBlock"][i].trigger * 1000)
        );
      }
    }
    if (preSelectList["preSelectBlock"][4].enable == true) {
      console.log("set");
      allTimer.push(
        setTimeout(function () {
          resendTimer = setInterval(function () {
            sender.setCookie(getWeb.getCookie());
            console.log(
              "send" +
                preSelectList["preSelectBlock"][4]["list"][0].replace(
                  /[\r\n]+/gm,
                  "%0D%0A"
                )
            );
            let senderPromise = sender.sendFastSelectResend(
              preSelectList["preSelectBlock"][4]["list"][0].replace(
                /[\r\n]+/gm,
                "%0D%0A"
              ),
              preSelectList["preSelectBlock"][4].trigger * 1000
            );
            senderPromise
              .then(function () {
                clearInterval(resendTimer);
                console.log("accecp");
              })
              .catch((fail) => {
                console.log("try again");
              });
          }, preSelectList["preSelectBlock"][4].trigger * 1000);
        }, leftTime)
      );
    }
  });
}

async function deletPreSelectTimer() {
  await clearTimer();

  try {
    clearInterval(resendTimer);
  } catch (error) {}
  allTimer = [];
}
async function checkIfFastSelectFinish() {
  if (preLoadClass.length == fastSelectReportCount) {
    nowState.barPo = 100;
    nowState.isFastSelectFinish = true;
    upDateState();
    checkToStartPreSelectPageAction();
  }
}
async function stopAllTimer() {
  if (typeof preLoadTimer != undefined) {
    clearTimeout(preLoadTimer);
  }
  if (typeof preLoadTimer != undefined) {
    clearTimeout(preLoadTimer);
  }
  for (let i = 0; i < fastSelectTimer.length; i++) {
    if (typeof fastSelectTimer[i] != undefined) {
      clearTimeout(fastSelectTimer[i]);
    }
  }
  if (typeof repeatSelectTimer != undefined) {
    clearTimeout(repeatSelectTimer);
  }
  if (typeof repeatSelectInterval != undefined) {
    clearInterval(repeatSelectInterval);
  }
  stopPreSelectPageAction();
  nowState = {
    preload: 0,
    fastSelect: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    isFastSelectFinish: false,
    preSelect: [0, 0, 0, 0, 0],
    barPo: 0,
    authKeyState: 0,
    authKeyDate: "",
  };
  check_LastNtp();
  upDateState();
  console.log("launchCancel");
}
async function loadState() {
  let statePromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile("./src/data/state.json", function (err, stateData) {
      if (err) {
        console.log("no state make new file");
        fs.writeFile(
          "./src/data/state.json",
          JSON.stringify(nowState),
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              console.log("make new setting file complete.");
              resolve("make new save");
            }
          }
        );
        resolve(nowState);
      } else {
        console.log("load state");
        //將二進制數據轉換為字串符
        let stateString = stateData.toString();

        resolve(stateString);
      }
    });
  });
  statePromise.then(function (stateString) {
    //將字符串轉換為 JSON 對象
    stateData = JSON.parse(stateString);
    nowState = stateData;
  });
}
async function upDateState() {
  stateData = nowState;
  let saveStatePromise = new Promise(function (resolve, reject) {
    fs.writeFile(
      "./src/data/state.json",
      JSON.stringify(stateData),
      function (err) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("state saved");
          resolve("state saved");
        }
      }
    );
  });
  saveStatePromise.then(function () {
    win.webContents.send("updateState");
  });
}
async function checkToStartPreSelectPageAction() {
  let areaSettingJson;
  let areaSetting = new Promise(function (resolve, reject) {
    fs.readFile(
      "./src/data/PreSelectPageSetting.json",
      function (err, setting) {
        if (err) {
          console.log(err);
          reject();
        } else {
          setting = setting.toString();
          //將字符串轉換為 JSON 對象
          try {
            areaSettingJson = JSON.parse(setting);
            resolve();
          } catch (error) {}
        }
      }
    );
  });
  areaSetting.then(function () {
    if (areaSettingJson["isSet"]) {
      preSelectPageTimer = setInterval(function () {
        let patrolAction = preSelectPageAction.patrolActionPerformed();
        patrolAction.then(function () {
          let update = preSelectPageAction.updatedClassState();
          update.then(function () {
            win.webContents.send("updatePreSelectPage");
          });
        });
        if (nowState.preSelect[1] < Number.MAX_VALUE) {
          nowState.preSelect[1]++;
        }
        upDateState();
      }, 1000);
      nowState.preSelect[0] = 3;
      upDateState();
    } else {
      nowState.preSelect[0] = 0;
      upDateState();
    }
  });
}
async function stopPreSelectPageAction() {
  console.log("stop preSelectPageTimer");
  if (preSelectPageTimer != undefined) clearInterval(preSelectPageTimer);
  nowState.preSelect = [0, 0, 0, 0, 0];
}
async function check() {
  return new Promise(function (resolve, reject) {
    getNTPTime()
      .then(function (timeDiff) {
        if (Math.abs(timeDiff) <= 3600000) {
          let settingPromise = new Promise(function (resolve, reject) {
            console.log(1);
            fs.readFile("./src/data/setting.json", function (err, settingData) {
              if (err) {
                console.log("no setting make new file");
                reject(err);
              } else {
                console.log("load setting");
                //將二進制數據轉換為字串符
                settingData = settingData.toString();
                resolve(settingData);
              }
            });
          });
          settingPromise
            .then(function (settingData) {
              settingSaved = JSON.parse(settingData);
              let sDay = Date.parse(settingSaved["selectStartDate"]);
              const myPublic = fs.readFileSync(
                "./src/pem/myPublic.pem",
                "utf8"
              );
              const userPrivate = fs.readFileSync(
                "./src/pem/userPrivate.pem",
                "utf8"
              );
              let key = settingSaved["key"];
              const enc = Buffer.from(key.substring(0, 172), "base64");
              const signature = Buffer.from(
                key.substring(172, key.length),
                "base64"
              );
              const isValid = verify("sha256", enc, myPublic, signature);
              if (isValid) {
                const dec = privateDecrypt(userPrivate, enc);
                let keyDateString = dec.toString();
                console.log(">>>>>>>>>" + keyDateString);
                const [id, date] = keyDateString.split(",");
                nowState.authKeyDate = date;
                if (id == userId) {
                  if (Date.parse(date) - sDay > 0) {
                    nowState.authKeyState = 4;
                    upDateState();
                    resolve();
                  } else {
                    nowState.authKeyState = 2;
                    upDateState();
                    reject();
                  }
                } else {
                  nowState.authKeyState = 3;
                  upDateState();
                  reject();
                }
              } else {
                nowState.authKeyState = 0;
                upDateState();
                reject();
              }
            })
            .catch(function (err) {
              nowState.authKeyState = 0;
              upDateState();
              reject();
            });
        } else {
          nowState.authKeyState = 1;
          upDateState();
          reject();
        }
      })
      .catch(function (err) {
        console.log(err);
        nowState.authKeyState = -1;
        upDateState();
        reject();
      });
  });
}
async function check_LastNtp() {
  if (lastTimeDiff != null) {
    if (Math.abs(lastTimeDiff) <= 3600000) {
      let settingPromise = new Promise(function (resolve, reject) {
        console.log(1);
        fs.readFile("./src/data/setting.json", function (err, settingData) {
          if (err) {
            console.log("no setting make new file");
            reject(err);
          } else {
            console.log("load setting");
            //將二進制數據轉換為字串符
            settingData = settingData.toString();
            resolve(settingData);
          }
        });
      });
      settingPromise
        .then(function (settingData) {
          settingSaved = JSON.parse(settingData);
          let sDay = Date.parse(settingSaved["selectStartDate"]);
          const myPublic = fs.readFileSync("./src/pem/myPublic.pem", "utf8");
          const userPrivate = fs.readFileSync(
            "./src/pem/userPrivate.pem",
            "utf8"
          );
          let key = settingSaved["key"];
          const enc = Buffer.from(key.substring(0, 172), "base64");
          const signature = Buffer.from(
            key.substring(172, key.length),
            "base64"
          );
          const isValid = verify("sha256", enc, myPublic, signature);
          if (isValid) {
            const dec = privateDecrypt(userPrivate, enc);
            let keyDateString = dec.toString();
            console.log(">>>>>>>>>" + keyDateString);
            const [id, date] = keyDateString.split(",");
            nowState.authKeyDate = date;
            if (id == userId) {
              if (Date.parse(date) - sDay > 0) {
                nowState.authKeyState = 4;
                upDateState();
              } else {
                nowState.authKeyState = 2;
                upDateState();
              }
            } else {
              nowState.authKeyState = 3;
              upDateState();
            }
          } else {
            nowState.authKeyState = 0;
            upDateState();
          }
        })
        .catch(function (err) {
          nowState.authKeyState = 0;
          upDateState();
        });
    } else {
      nowState.authKeyState = 1;
      upDateState();
    }
  } else {
    console.log("lastTimeDiff too large");
    nowState.authKeyState = -1;
    upDateState();
  }
}
ipc.on("getNowState", async function (e) {
  upDateState();
  check_LastNtp();
});
ipc.on("stopPreSelectPageTimer", async function (e) {
  stopPreSelectPageAction();
});
