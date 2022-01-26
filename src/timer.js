const fs = require('fs');
const sender = require('./sendSelect');

let allTimer = []
let resendTimer
let preSelectList
let setting
module.exports = {
    setPreSelectTimer: function (getWeb) {
        return setPreSelectTimer(getWeb);
    },
    deletPreSelectTimer: function () {
        return deletPreSelectTimer();
    }
}


async function setPreSelectTimer(getWeb) {
    let readPreSelect = new Promise(function (resolve, reject) {
        fs.readFile('./src/data/preSelect.json', function (err, preSelectListSaved) {
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
        })
    })
    let readSetting = new Promise(function (resolve, reject) {
        fs.readFile('./src/data/setting.json', function (err, settingSaved) {
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
        })
    })
    Promise.all([readPreSelect, readSetting]).then(() => {
        console.log("setting time");
        let sDay = Date.parse(setting["選課開始時間"])
        let leftTime = sDay - Date.now()
        for (let i = 0; i < 4; i++) {
            if (preSelectList["preSelectBlock"][i].enable == true) {
                console.log("set")
                allTimer.push(setTimeout(function () {
                    console.log(i)
                    sender.setCookie(getWeb.getCookie())
                    if (preSelectList["preSelectBlock"][i]["list"][0].length > 2) {
                        console.log("send" + preSelectList["preSelectBlock"][i]["list"][0].replace(/[\r\n]+/gm, "%0D%0A"))
                        sender.sendFastSelect(preSelectList["preSelectBlock"][i]["list"][0].replace(/[\r\n]+/gm,"%0D%0A"));
                    }
                    if (preSelectList["preSelectBlock"][i]["list"][1].length > 2) {
                        console.log("send" + preSelectList["preSelectBlock"][i]["list"][1].replace(/[\r\n]+/gm, "%0D%0A"))
                        sender.sendFastSelect(preSelectList["preSelectBlock"][i]["list"][1].replace(/[\r\n]+/gm,"%0D%0A"));
                    }

                }, leftTime + preSelectList["preSelectBlock"][i].trigger * 1000))
            }
        }
        if (preSelectList["preSelectBlock"][4].enable == true) {
            console.log("set")
            allTimer.push(setTimeout(function () {
                resendTimer = setInterval(function () {
                    sender.setCookie(getWeb.getCookie())
                    console.log("send" + preSelectList["preSelectBlock"][4]["list"][0].replace(/[\r\n]+/gm, "%0D%0A"))
                    let senderPromise = sender.sendFastSelectResend(preSelectList["preSelectBlock"][4]["list"][0].replace(/[\r\n]+/gm,"%0D%0A",),preSelectList["preSelectBlock"][4].trigger * 1000);
                    senderPromise.then(function () {
                        clearInterval(resendTimer);
                        console.log("accecp")
                    })
                    .catch(fail => {
                        console.log("try again")
                    });
                }, preSelectList["preSelectBlock"][4].trigger * 1000)
            }, leftTime))

        }
    });
}

async function deletPreSelectTimer() {
    await clearTimer();
   
    try {
        clearInterval(resendTimer)
    } catch (error) {
        
    }
    allTimer = []
}
async function clearTimer() {
    for (let i = 0; i < allTimer.length; i++) {
        clearTimeout(allTimer[i]);
    }
}