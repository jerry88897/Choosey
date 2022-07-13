const fs = require("fs");
const ntpClient = require("ntp-client");
const NtpTimeSync = require("ntp-time-sync").NtpTimeSync;
const sender = require("./sendSelect");
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

let timeDiff;
let allTimer = [];
let resendTimer;
let preSelectList;
let setting;
module.exports = {
  getNTPTime: function () {
    return getNTPTime();
  },
  setPreSelectTimer: function (getWeb) {
    return setPreSelectTimer(getWeb);
  },
  deletPreSelectTimer: function () {
    return deletPreSelectTimer();
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
    timeSync.getTime().then(function (result) {
      console.log("current system time", new Date());
      console.log("real time", result.now);
      console.log("offset in milliseconds", result.offset);
      resolve(result.offset);
    });
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
async function clearTimer() {
  for (let i = 0; i < allTimer.length; i++) {
    clearTimeout(allTimer[i]);
  }
}
