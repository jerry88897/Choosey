const fs = require("fs");
let getWeb;
let parser;
let maxPoint;
let preSelectPageTimer;
module.exports = {
  setGetWeb: function (GetWeb) {
    getWeb = GetWeb;
  },
  setParser: function (Parser) {
    parser = Parser;
  },
  setMaxPoint: function (point) {
    maxPoint = point;
  },
  patrolActionPerformed: function () {
    return patrolActionPerformed();
  },
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
async function patrolActionPerformed() {
  //preSelectPageTimer = setInterval(function () {
  let allPromise = [];
  let updatedClass;
  let getNowPoint = getWeb.getMyClass();
  let parserNowPoint = parser.pointParser(getNowPoint);
  parserNowPoint.then(function (point) {
    point = parseInt(parseFloat(point) * 10);
    let readFileProm = new Promise(function (resolve, reject) {
      fs.readFile("./src/data/PreSelectPage.json", function (err, classList) {
        if (err) {} else {
          classList = classList.toString();
          classList = JSON.parse(classList);
          updatedClass = classList;
          for (let i = 0; i < classList.length; i++) {
            allPromise.push(
              new Promise(function (resolve, reject) {
                let response = getWeb.GetClassClass(
                  depNo.get(classList[i]["DepNo"]),
                  classList[i]["SelClassNo"]
                );
                let watchClass = parser.classClassParser(
                  response,
                  classList[i]["DepNo"],
                  classList[i]["SelClassNo"]
                );
                watchClass.then(function (data) {
                  for (let j = 0; j < data.length; j++) {
                    if (data[j]["id"] === classList[i]["id"]) {
                      updatedClass[i]["action"] = data[j]["action"];
                      updatedClass[i]["student"] = data[j]["student"];
                      updatedClass[i]["overflow"] = data[j]["overflow"];
                      resolve(i);
                      break;
                    }
                  }
                });
              })
            );
          }
          resolve();
        }
      });
    });
    readFileProm.then(function () {
      let waitToAdd = [];
      let waitToRemove = [];
      let c = 0;
      let checkAction = new Promise(function () {
        for await (let item of arr) {
          console.log("check " + c++);
          if (updatedClass[item]["action"] === 1) {
            let classPoint = parseInt(
              parseFloat(updatedClass[item]["point"]) * 10
            );
            if (classPoint + point <= maxPoint) {
              point += classPoint;
              //getWeb.sendAddClass(updatedClass[item]["id"])
            } else if (updatedClass[item]["action"] === 0 && updatedClass[item]["overflow"] === false) {
              let waitToAddClass = {
                id: "",
                point: ""
              }
              waitToAddClass.id = updatedClass[item]["id"];
              waitToAddClass.point = updatedClass[item]["point"]
              waitToAdd.push(waitToAddClass);
            } else if (updatedClass[item]["action"] === 2 && updatedClass[item]["isLock"] === false) {
              let waitToRemoveClass = {
                id: "",
                point: ""
              }
              waitToRemoveClass.id = updatedClass[item]["id"];
              waitToRemoveClass.point = updatedClass[item]["point"]
              waitToRemove.push(waitToRemoveClass);
            }
          }
        }
        console.log("check end");
        resolve();
      })
      checkAction.then(function () {
        waitToRemove.reverse();
        for (let i = 0; i < waitToAdd.length; i++) {
          let needPoint = parseInt(parseFloat(waitToAdd[i]["point"]) * 10);
          let retreatPoint = 0;
          for (let j = 0; j < waitToRemove.length; j++) {
            retreatPoint += parseInt(parseFloat(waitToRemove[j]["point"]) * 10);
            if (retreatPoint >= needPoint) {
              let delClassPromise = []
              for (let k = 0; k <= j; k++) {
                delClassPromise.push(getWeb.sendDelClass(waitToRemove[k]["id"]));
              }
              Promise.all(delClassPromise).then(function () {
                getWeb.sendAddClass(waitToAdd[i]["id"]);
              })
            }
          }
        }
      })
    });
  });

  //}, 2 * 60 * 1000);
  //}, 1000);
}