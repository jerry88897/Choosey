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
  updatedClassState: function () {
    return updatedClassState();
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
async function updatedClassState() {
  return new Promise((resolve, reject) => {
    let allPromise = [];
    let updatedClass;
    let getNowPoint = getWeb.getMyClass();
    let parserNowPoint = parser.pointParser(getNowPoint);
    parserNowPoint.then(function (point) {
      point = parseInt(parseFloat(point) * 10);
      let readFileProm = new Promise(function (resolve, reject) {
        fs.readFile("./src/data/PreSelectPage.json", function (err, classList) {
          if (err) {
          } else {
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
              if (i == classList.length - 1) resolve();
            }
          }
        });
      });
      readFileProm.then(function () {
        Promise.all(allPromise).then(function () {
          fs.writeFile(
            "./src/data/PreSelectPage.json",
            JSON.stringify(updatedClass),
            function (err) {
              if (err) {
                console.error(err);
              } else {
                resolve();
                console.log("write classFile...");
              }
            }
          );
        });
      });
    });
  });
}
async function patrolActionPerformed() {
  return new Promise((resolve, reject) => {
    //preSelectPageTimer = setInterval(function () {
    let allPromise = [];
    let updatedClass;
    let getNowPoint = getWeb.getMyClass();
    let parserNowPoint = parser.pointParser(getNowPoint);
    parserNowPoint.then(function (point) {
      point = parseInt(parseFloat(point) * 10);
      let readFileProm = new Promise(function (resolve, reject) {
        fs.readFile("./src/data/PreSelectPage.json", function (err, classList) {
          if (err) {
          } else {
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
              if (i == classList.length - 1) resolve();
            }
          }
        });
      });
      readFileProm.then(function () {
        let waitToAdd = [];
        let waitToRemove = [];
        let c = 0;
        let checkAction = new Promise(async function (resolve, reject) {
          for await (let item of allPromise) {
            console.log(
              c++ +
                " " +
                updatedClass[item]["id"] +
                "  " +
                updatedClass[item]["action"] +
                "  " +
                updatedClass[item]["point"]
            );
            if (updatedClass[item]["action"] === 1) {
              let classPoint = parseInt(
                parseFloat(updatedClass[item]["point"]) * 10
              );
              if (classPoint + point <= maxPoint) {
                point += classPoint;
                getWeb.sendAddClass(updatedClass[item]["id"]);
              } else {
                let waitToAddClass = {
                  id: "",
                  point: "",
                  priority: item,
                };
                waitToAddClass.id = updatedClass[item]["id"];
                waitToAddClass.point = updatedClass[item]["point"];
                waitToAdd.push(waitToAddClass);
              }
            } else if (
              updatedClass[item]["action"] === 0 &&
              updatedClass[item]["overflow"] === false
            ) {
              let waitToAddClass = {
                id: "",
                point: "",
                priority: item,
              };
              waitToAddClass.id = updatedClass[item]["id"];
              waitToAddClass.point = updatedClass[item]["point"];
              waitToAdd.push(waitToAddClass);
            } else if (
              updatedClass[item]["action"] === 2 &&
              updatedClass[item]["isLock"] === false &&
              updatedClass[item]["point"] !== "0.0"
            ) {
              let waitToRemoveClass = {
                id: "",
                point: "",
                priority: item,
              };
              waitToRemoveClass.id = updatedClass[item]["id"];
              waitToRemoveClass.point = updatedClass[item]["point"];
              waitToRemove.push(waitToRemoveClass);
            }
          }
          console.log("check end");
          resolve();
        });
        checkAction.then(function () {
          waitToRemove.reverse();
          for (let i = 0; i < waitToAdd.length; i++) {
            let needPoint =
              parseInt(parseFloat(waitToAdd[i]["point"]) * 10) -
              (maxPoint - point);
            let retreatPoint = 0;
            for (let j = 0; j < waitToRemove.length; j++) {
              if (waitToAdd[i]["priority"] < waitToRemove[j]["priority"]) {
                let delClassPromise = [];
                retreatPoint += parseInt(
                  parseFloat(waitToRemove[j]["point"]) * 10
                );
                if (retreatPoint == needPoint) {
                  for (let k = 0; k <= j; k++) {
                    delClassPromise.push(
                      getWeb.sendDelClass(waitToRemove[k]["id"])
                    );
                  }
                  for (let k = 0; k <= j; k++) {
                    waitToRemove.shift();
                  }
                  Promise.all(delClassPromise).then(function () {
                    point += waitToAdd[i]["point"];
                    getWeb.sendAddClass(waitToAdd[i]["id"]);
                  });
                  break;
                } else if (retreatPoint > needPoint) {
                  let differ = retreatPoint - needPoint;
                  let freeClass = [];
                  let needDelClass = [];
                  let freeClassCount = 0;
                  for (let k = j; k >= 0; k--) {
                    if (
                      parseInt(parseFloat(waitToRemove[k]["point"]) * 10) <=
                      differ
                    ) {
                      freeClass.push(waitToRemove[k]);
                      freeClassCount++;
                      differ -= parseInt(
                        parseFloat(waitToRemove[k]["point"]) * 10
                      );
                    } else {
                      needDelClass.push(waitToRemove[k]);
                    }
                  }
                  if (freeClassCount == 0) {
                    for (let k = 0; k <= j; k++) {
                      delClassPromise.push(
                        getWeb.sendDelClass(waitToRemove[k]["id"])
                      );
                      point -= waitToRemove[k]["point"];
                    }
                    for (let k = 0; k <= j; k++) {
                      waitToRemove.shift();
                    }
                  } else {
                    for (let k = 0; k < needDelClass.length; k++) {
                      delClassPromise.push(
                        getWeb.sendDelClass(needDelClass[k]["id"])
                      );
                      point -= needDelClass[k]["point"];
                    }
                  }
                  for (let k = 0; k <= j; k++) {
                    waitToRemove.shift();
                  }
                  for (let k = 0; k < freeClass.length; k++) {
                    waitToRemove.unshift(freeClass[k]);
                  }
                  Promise.all(delClassPromise).then(function () {
                    point += waitToAdd[i]["point"];
                    getWeb.sendAddClass(waitToAdd[i]["id"]);
                  });
                  break;
                }
              }
            }
          }
          for (let k = 0; k < 20; k++) {
            console.log(k);
          }
          console.log("countFin");
          resolve();
        });
      });
    });

    //}, 2 * 60 * 1000);
    //}, 1000);
  });
}
