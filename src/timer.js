const fs = require('fs');
const sender = require('./sendSelect');

let allTimer = []
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
    Promise.all([readPreSelect,readSetting]).then(() => {
        console.log("setting time");
        let sDay =Date.parse(setting["選課開始時間"])
        let leftDay
        let leftHour
        let leftMinute
        let leftSecond
        let leftTime = sDay-Date.now()
        for(let i=0;i<5;i++){
            if(preSelectList["preSelectBlock"][i].enable==true){
                console.log("set")
                allTimer.push(setTimeout(function(){
                    console.log(i)
                    sender.setCookie(getWeb.getCookie())
                    //sender.sendFastSelect(preSelectList["preSelectBlock"][i]["list"][0].replace(/[\r\n]+/gm,"%0D%0A"));
                    //sender.sendFastSelect(preSelectList["preSelectBlock"][i]["list"][1].replace(/[\r\n]+/gm,"%0D%0A"));
                    console.log("send"+preSelectList["preSelectBlock"][i]["list"][0].replace(/[\r\n]+/gm,"%0D%0A"))

                }, leftTime+preSelectList["preSelectBlock"][i].trigger*1000))
            }
        }
        
        leftDay = Math.floor(leftTime/(24*3600*1000))
        leftTime-=leftDay*(24*3600*1000)
        leftHour =Math.floor((leftTime)/(3600*1000))
        leftTime-=leftHour*(3600*1000)
        leftMinute =Math.floor((leftTime)/(60*1000))
        leftTime-=leftMinute*(60*1000)
        leftSecond =Math.floor((leftTime)/(1000))
        console.log(leftDay+"d"+leftHour+"h"+leftMinute+"m"+leftSecond+"s")
        let tem = getWeb.getCookie()
        console.log(tem)
        

    });
}

async function deletPreSelectTimer() {


}

