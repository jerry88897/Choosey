const fs = require('fs');

let allTimer = []
let preSelectList
let setting
module.exports = {
    setPreSelectTimer: function () {
        return setPreSelectTimer();
    },
    deletPreSelectTimer: function () {
        return deletPreSelectTimer();
    },
}


async function setPreSelectTimer() {
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
                console.log(2)
                resolve("success");
            }
        })
    })
    Promise.all([readPreSelect,readSetting]).then(() => {
        console.log("setting time");
    });
}

async function deletPreSelectTimer() {


}