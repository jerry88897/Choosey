const { getElementById } = require("domutils");
const electron = require("electron");
const ipc = electron.ipcRenderer;

const fs = require("fs");
const { resolve } = require("path");
const titleCountDown = document.getElementById("titleCountDown");
const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main_frame = document.getElementById("main_frame");
const right_frame = document.getElementById("right_frame");
const controlCenter = document.getElementById("controlCenter");
const classClass = document.getElementById("classClass");
const generalClass = document.getElementById("generalClass");
const getMyClass = document.getElementById("getMyClass");
const preSelectClass = document.getElementById("preSelectClass");
const fastSelectClass = document.getElementById("fastSelectClass");
const setting = document.getElementById("setting");

window.addEventListener("load", ipc.send("getControlCenter"), false);

let _second = 1000;
let _minute = _second * 60;
let _hour = _minute * 60;
let _day = _hour * 24;

let myClassTableType = false;

let tickTimer;
let countDownTimer;
let tableHead = [
  "動作",
  "課程代碼",
  "課程名稱",
  "教師",
  "類別",
  "學分",
  "已選/上限",
  "附註",
];
let tableKey = [
  "action",
  "id",
  "name",
  "teacher",
  "type",
  "point",
  "student",
  "overflow",
  "ps",
];

let dateHead = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
let timeSeg = [
  "第一節<br>08:10~<br>09:00",
  "第二節<br>09:10~<br>10:00",
  "第三節<br>10:10~<br>11:00",
  "第四節<br>11:10~<br>12:00",
  "中　午<br>12:10~<br>13:00",
  "第五節<br>13:10~<br>14:00",
  "第六節<br>14:10~<br>15:00",
  "第七節<br>15:10~<br>16:00",
  "第八節<br>16:10~<br>17:00",
  "傍　晚<br>17:10~<br>18:00",
  "第九節<br>18:20~<br>19:10",
  "第10節<br>19:15~<br>20:05",
  "第11節<br>20:15~<br>21:05",
  "第12節<br>21:10~<br>22:00",
];
async function cleanFrame() {
  main_frame.innerHTML = "";
}
async function cleanRightFrame() {
  right_frame.innerHTML = "";
}

let newNTPTimeDiff;
async function showControlCenter(evt, ntpTimeDiff) {
  await cleanFrame();
  await cleanRightFrame();
  titleCountDown.innerHTML = "";
  newNTPTimeDiff = ntpTimeDiff;
  let setting = {
    selectStartDate: "2022-01-27T10:30",
  };
  let timeHead = [
    "localTime",
    "NTPTime",
    "timeDiff",
    "selTime",
    "countDownTime",
    "systemDelay",
  ];
  let timeNumList = [];
  let settingSaved;
  let settingPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile("./src/data/setting.json", function (err, settingData) {
      if (err) {
        console.log("no setting make new file");
        fs.writeFile(
          "./src/data/setting.json",
          JSON.stringify(setting),
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              console.log("make new setting file complete.");
              settingSaved = setting;
              resolve("make new save");
            }
          }
        );
      } else {
        console.log("load setting");
        //將二進制數據轉換為字串符
        settingData = settingData.toString();
        //將字符串轉換為 JSON 對象
        settingSaved = JSON.parse(settingData);
        resolve("success");
      }
    });
  });
  settingPromise.then(function (success) {
    let timeCenterHTML = new Promise(function (resolve, reject) {
      fs.readFile("./src/timeCenter.html", function (err, timeCenterHTMLData) {
        if (err) {
          reject("no file");
        } else {
          console.log("load HTML");
          //將二進制數據轉換為字串符
          resolve(timeCenterHTMLData);
        }
      });
    });
    timeCenterHTML.then(function (timeCenterHTMLData) {
      timeCenterHTMLData = timeCenterHTMLData.toString();
      let controlPanel = document.createElement("div");
      controlPanel.setAttribute("class", "controlPanel");
      let timeDivBox = document.createElement("div");
      timeDivBox.setAttribute("class", "timeDivBox");

      timeDivBox.innerHTML = timeCenterHTMLData;

      //let lowerPanelBox = document.createElement("div");
      //lowerPanelBox.setAttribute("class", "lowerPanelBox");

      let flowChartBox = document.createElement("div");
      flowChartBox.setAttribute("class", "flowChartBox");
      let launchBox = document.createElement("div");
      launchBox.setAttribute("class", "launchBox");

      let startBtm = document.createElement("div");
      startBtm.setAttribute("class", "button");
      let startBtmText = document.createElement("a");
      startBtmText.innerText = "運行";
      startBtm.appendChild(startBtmText);

      let stopBtm = document.createElement("div");
      stopBtm.setAttribute("class", "button");
      let stopBtmText = document.createElement("a");
      stopBtmText.innerText = "中止";
      stopBtm.appendChild(stopBtmText);

      launchBox.appendChild(startBtm);
      launchBox.appendChild(stopBtm);
      flowChartBox.innerHTML = "222";
      controlPanel.appendChild(timeDivBox);
      controlPanel.appendChild(flowChartBox);
      controlPanel.appendChild(launchBox);
      //lowerPanelBox.appendChild(flowChartBox);
      //lowerPanelBox.appendChild(launchBox);
      //controlPanel.appendChild(lowerPanelBox);

      main_frame.appendChild(controlPanel);

      for (let i = 0; i < 6; i++) {
        let timeOutput = document.getElementsByClassName(timeHead[i]);
        timeNumList.push(timeOutput);
      }

      let sDay = new Date(settingSaved["selectStartDate"]);
      console.log(settingSaved["selectStartDate"]);
      timeNumList[3][0].innerText = sDay.getFullYear();
      timeNumList[3][1].innerText = sDay.getMonth() + 1;
      timeNumList[3][2].innerText = sDay.getDate();
      timeNumList[3][3].innerText = sDay.getHours();
      timeNumList[3][4].innerText = sDay.getMinutes();
      timeNumList[3][5].innerText = sDay.getSeconds();
      console.log(sDay.getMonth());
      if (typeof countDownTimer != undefined) {
        clearInterval(countDownTimer);
      }
      if (typeof tickTimer != undefined) {
        clearInterval(tickTimer);
      }
      let flash = 0;
      countDownTimer = setInterval(function () {
        let calculateStart = Date.now();
        ntpTimeDiff = newNTPTimeDiff;
        let nowtime = new Date(Date.now());
        timeNumList[0][0].innerText = nowtime.getFullYear();
        timeNumList[0][1].innerText = nowtime.getMonth() + 1;
        timeNumList[0][2].innerText = nowtime.getDate();
        timeNumList[0][3].innerText = nowtime.getHours();
        timeNumList[0][4].innerText = nowtime.getMinutes();
        timeNumList[0][5].innerText = nowtime.getSeconds();

        nowtime.setMilliseconds(nowtime.getMilliseconds() + ntpTimeDiff);
        timeNumList[1][0].innerText = nowtime.getFullYear();
        timeNumList[1][1].innerText = nowtime.getMonth() + 1;
        timeNumList[1][2].innerText = nowtime.getDate();
        timeNumList[1][3].innerText = nowtime.getHours();
        timeNumList[1][4].innerText = nowtime.getMinutes();
        timeNumList[1][5].innerText = nowtime.getSeconds();

        let leftTime = sDay - Date.now();
        if (leftTime > 0) {
          let days = Math.floor(leftTime / _day);
          leftTime -= days * _day;
          let hours = Math.floor(leftTime / _hour);
          leftTime -= hours * _hour;
          let minutes = Math.floor(leftTime / _minute);
          leftTime -= minutes * _minute;
          let seconds = Math.floor(leftTime / _second);
          timeNumList[4][0].innerText = days;
          timeNumList[4][1].innerText = hours;
          timeNumList[4][2].innerText = minutes;
          timeNumList[4][3].innerText = seconds;
          console.log(days + "d" + hours + "h" + minutes + "m" + seconds + "s");
        } else {
          if (flash == 0) {
            flash = 1;
            timeNumList[4][0].innerText = "-";
            timeNumList[4][1].innerText = "-";
            timeNumList[4][2].innerText = "-";
            timeNumList[4][3].innerText = "-";
          } else {
            flash = 0;
            timeNumList[4][0].innerText = " ";
            timeNumList[4][1].innerText = " ";
            timeNumList[4][2].innerText = " ";
            timeNumList[4][3].innerText = " ";
          }
        }
        timeNumList[2][0].innerText = ntpTimeDiff * -1;
        timeNumList[5][0].innerText = Date.now() - calculateStart;
      }, 1000);
    });
  });
}
async function fastSelect() {
  await cleanFrame();
  let fastSelectList = {
    isLock: false,
    fastSelectBlock: [],
  };
  let tableHead = ["貼上", "啟用", "發送時刻(秒)", "課程"];
  let tableHead2 = ["貼上", "啟用", "發送間隔(秒)", "課程"];
  let flexTableHeadBox = document.createElement("div");
  flexTableHeadBox.setAttribute("class", "flexTableHeadBox");
  let flexTableHead;
  for (let i = 0; i < 4; i++) {
    flexTableHead = document.createElement("div"); // TABLE HEADER.
    if (i < 2) {
      flexTableHead.setAttribute("class", "fheader fheaderButton");
    } else if (i == 2) {
      flexTableHead.setAttribute("class", "fheader fheaderTime");
    } else {
      flexTableHead.setAttribute("class", "fheader fheaderClass");
    }

    flexTableHead.innerText = tableHead[i];
    flexTableHeadBox.appendChild(flexTableHead);
  }

  main_frame.appendChild(flexTableHeadBox);

  let fastSelectPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile(
      "./src/data/fastSelect.json",
      function (err, fastSelectListSaved) {
        if (err) {
          console.log("no FSS make new file");
          for (let i = 0; i < 5; i++) {
            let fastSelectBlock = {
              id: 0,
              enable: false,
              trigger: 0,
              list: [],
            };
            fastSelectBlock.id = i;
            fastSelectList.fastSelectBlock.push(fastSelectBlock);
          }
          fs.writeFile(
            "./src/data/fastSelect.json",
            JSON.stringify(fastSelectList),
            function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                console.log("make new file complete.");
                resolve("make new");
              }
            }
          );
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

  fastSelectPromise.then(function (success) {
    let pasteButtonArray = [];
    let deleteButtonArray = [[], [], [], [], []];
    let flexSendBlockListBox = document.createElement("div");
    flexSendBlockListBox.setAttribute("class", "flexSendBlockListBox");
    let actionDiv = document.createElement("div");
    actionDiv.setAttribute("class", "actionDiv");
    let saveDiv = document.createElement("div");
    let saveImg = document.createElement("img");
    for (let i = 0; i < 5; i++) {
      if (i == 4) {
        flexTableHeadBox = document.createElement("div");
        flexTableHeadBox.setAttribute("class", "flexTableSecondHeadBox");
        for (let j = 0; j < 4; j++) {
          flexTableHead = document.createElement("div"); // TABLE HEADER.
          if (j < 2) {
            flexTableHead.setAttribute("class", "fheader fheaderTime");
          } else if (j == 2) {
            flexTableHead.setAttribute("class", "fheader fheaderClass");
          } else {
            flexTableHead.setAttribute("class", "fheader fheaderButton");
          }

          flexTableHead.innerText = tableHead2[j];
          flexTableHeadBox.appendChild(flexTableHead);
        }
        main_frame.appendChild(flexSendBlockListBox);
        main_frame.appendChild(flexTableHeadBox);
        flexSendBlockListBox = document.createElement("div");
        flexSendBlockListBox.setAttribute("class", "flexSendBlockListBox");
      }

      let flexSendBlockBox = document.createElement("div");
      flexSendBlockBox.setAttribute("class", "flexSendBlockBox");

      let flexInputBox = document.createElement("div");
      flexInputBox.setAttribute("class", "flexInputBox");

      let pasteTd = document.createElement("div"); //貼上
      pasteTd.className = "fInputButton";

      let pasteButtonBox = document.createElement("div");
      pasteButtonBox.setAttribute("class", "pasteButtonBox");
      let pasteButton = document.createElement("div");
      pasteButton.setAttribute("class", "pasteButton");
      pasteButton.setAttribute("id", "pasteButton" + i);
      let pasteButtonImg = document.createElement("img");
      pasteButtonImg.setAttribute("src", "./icon/playlist_insert.svg");
      pasteButtonImg.setAttribute("class", "icon");
      pasteButton.appendChild(pasteButtonImg);
      pasteButtonBox.appendChild(pasteButton);
      pasteButtonArray.push(pasteButton);
      pasteTd.appendChild(pasteButtonBox);

      let actTd = document.createElement("div"); //啟用
      actTd.className = "fInputButton";

      let enableChecker = document.createElement("input");
      enableChecker.setAttribute("type", "checkbox");
      enableChecker.setAttribute("class", "fCheckbox userInput");
      if (fastSelectList["fastSelectBlock"][i].enable == true) {
        enableChecker.setAttribute("checked", "checked");
      }
      enableChecker.id = "checkbox" + i;
      actTd.appendChild(enableChecker);

      let timeTd = document.createElement("div"); //發送時刻(秒)
      timeTd.className = "fInputTime";

      let timeSelect = document.createElement("input");
      timeSelect.id = "timeSelect" + i;
      timeSelect.setAttribute("type", "number");
      timeSelect.setAttribute("min", -120);
      timeSelect.setAttribute("max", 120);
      timeSelect.setAttribute("step", 0.01);
      timeSelect.setAttribute(
        "value",
        fastSelectList["fastSelectBlock"][i].trigger
      );
      timeSelect.className = "fTime userInput";
      timeTd.appendChild(timeSelect);

      flexInputBox.appendChild(pasteTd);
      flexInputBox.appendChild(actTd);
      flexInputBox.appendChild(timeTd);
      flexSendBlockBox.appendChild(flexInputBox);

      let flexClassListBox = document.createElement("div");
      flexClassListBox.setAttribute("class", "flexClassListBox");
      let flexClassBox = document.createElement("div");
      flexClassBox.setAttribute("class", "flexClassBox");
      let flexClass;
      let flexClassInfo;
      for (let element of fastSelectList["fastSelectBlock"][i]["list"]) {
        flexClass = document.createElement("div");
        flexClass.setAttribute("class", "flexClass");

        flexClassInfo = document.createElement("div"); //刪除按鈕
        flexClassInfo.className = "flexClassInfo classDeleteButton";
        let deleteButton = document.createElement("div");
        deleteButton.setAttribute("class", "pasteButton");
        deleteButton.setAttribute("id", "deleteButton" + i);
        let deleteButtonImg = document.createElement("img");
        deleteButtonImg.setAttribute("src", "./icon/delete.svg");
        deleteButtonImg.setAttribute("class", "icon");
        deleteButton.appendChild(deleteButtonImg);
        flexClassInfo.appendChild(deleteButton);
        flexClass.appendChild(flexClassInfo);
        deleteButtonArray[i].push(deleteButton);

        flexClassInfo = document.createElement("div"); //課程代碼
        flexClassInfo.className = "flexClassInfo classId";
        flexClassInfo.innerText = element["id"];
        flexClass.appendChild(flexClassInfo);

        flexClassInfo = document.createElement("div"); //課程名稱
        flexClassInfo.className = "flexClassInfo className";
        flexClassInfo.innerText = element["name"];
        flexClass.appendChild(flexClassInfo);

        flexClassInfo = document.createElement("div"); //教師
        flexClassInfo.className = "flexClassInfo classTeacher";
        flexClassInfo.innerText = element["teacher"];
        flexClass.appendChild(flexClassInfo);

        flexClassInfo = document.createElement("div"); //必選修
        flexClassInfo.className = "flexClassInfo classType";
        flexClassInfo.innerText = element["type"];
        if (element["type"] === "必修") {
          flexClassInfo.style.color = "yellow";
        } else {
          flexClassInfo.style.color = "var(--yes-color)";
        }
        flexClass.appendChild(flexClassInfo);

        flexClassInfo = document.createElement("div"); //學分
        flexClassInfo.className = "flexClassInfo classPoint";
        flexClassInfo.innerText = element["point"];
        flexClass.appendChild(flexClassInfo);

        flexClassListBox.appendChild(flexClass);
      }
      flexSendBlockBox.appendChild(flexClassListBox);
      flexSendBlockListBox.appendChild(flexSendBlockBox);
    }
    main_frame.appendChild(flexSendBlockListBox);
    saveDiv.setAttribute("class", "save");
    saveImg.setAttribute("class", "icon");
    saveImg.setAttribute("src", "./icon/bx-save-check.svg");
    saveDiv.appendChild(saveImg);
    actionDiv.appendChild(saveDiv);
    main_frame.appendChild(actionDiv);
    saveDiv.addEventListener("click", async function () {
      for (let i = 0; i < 5; i++) {
        fastSelectList["fastSelectBlock"][i].enable = document.getElementById(
          "checkbox" + i
        ).checked;
        fastSelectList["fastSelectBlock"][i].trigger = document.getElementById(
          "timeSelect" + i
        ).value;
      }
      fs.writeFile(
        "./src/data/fastSelect.json",
        JSON.stringify(fastSelectList),
        function (err) {
          if (err) console.log(err);
          else {
            console.log("save file complete.");
            saveImg.setAttribute("src", "./icon/bx-save-check.svg");
          }
        }
      );
    });
    let userInput = document.getElementsByClassName("userInput");
    for (let element of userInput) {
      element.addEventListener("click", async function () {
        saveImg.setAttribute("src", "./icon/bx-save.svg");
      });
    }
    for (let element of pasteButtonArray) {
      element.addEventListener("click", async function () {
        console.log(element.id);
        fastSelectNo = element.id[11];
        ipc.send("fastSelectPaste", fastSelectNo);
      });
    }
    for (let i = 0; i < deleteButtonArray.length; i++) {
      for (let j = 0; j < deleteButtonArray[i].length; j++) {
        deleteButtonArray[i][j].addEventListener("click", async function () {
          console.log("fs delete " + i + " " + j);
          let pos = {
            row: i,
            column: j,
          };
          console.log(pos);
          console.log(i);
          console.log(j);
          ipc.send("fastSelectdelete", pos);
        });
      }
    }
  });
}

let SelDepNo = 0;
let SelClassNo = "UI3B";
let backclassList;
let showClassClassType = 0;
async function showClassClass(SelectedDepNo, SelectedClassNo, classList) {
  await cleanFrame();
  SelDepNo = SelectedDepNo;
  SelClassNo = SelectedClassNo;
  backclassList = classList;
  let actionDiv = document.createElement("div");
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let viewTypeDiv = document.createElement("div");
  let viewTypeImg = document.createElement("img");
  let toolBar = document.createElement("div");
  let dep = [
    "B",
    "C",
    "D",
    "E",
    "H",
    "I",
    "K",
    "L",
    "M",
    "N",
    "Q",
    "S",
    "T",
    "V",
    "W",
  ];
  let depName = new Map([
    ["M", "M機材"],
    ["E", "E電機"],
    ["C", "C化生"],
    ["D", "D工設"],
    ["B", "B事經"],
    ["I", "I資工"],
    ["T", "T機材"],
    ["S", "S化生"],
    ["W", "W通訊"],
    ["N", "N資經"],
    ["V", "V媒設"],
    ["L", "L應外"],
    ["Q", "Q工管"],
    ["K", "K設科"],
    ["H", "H工學"],
  ]);

  actionDiv.setAttribute("class", "actionDiv");
  fs.readFile("./src/data/ClassClass.json", function (err, myClass) {
    let preSelectThisClassDivArray = [];
    let preSelectlist;
    if (err) {
      return console.log(err);
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let myclass = myClass.toString();
    //將字符串轉換為 JSON 對象
    try {
      myclass = JSON.parse(myclass);
    } catch (error) {}
    let readshoppingCart = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/shoppingCart.json",
        function (err, preSelectlistData) {
          if (err) {
            console.error(err);
            preSelectlist = "[]";
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          } else {
            preSelectlist = preSelectlistData.toString();
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          }
        }
      );
    });
    readshoppingCart.then(function () {
      if (showClassClassType == 0) {
        //以列表方式顯示
        table.className = "mtable";
        for (let key of tableHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let element of myclass) {
          tr = table.insertRow(-1);
          tr.className = "mtr";
          let td = document.createElement("td");
          let selectThisClass = document.createElement("img");
          let preSelectThisClass = document.createElement("img");
          let selectThisClassDiv = document.createElement("div");
          let preSelectThisClassDiv = document.createElement("div");
          let classActionBox = document.createElement("div");
          selectThisClassDiv.setAttribute("class", "classActionDiv");
          if (element[tableKey[0]] == 1) {
            selectThisClass.setAttribute(
              "src",
              "./icon/add_circle_outline_white_24dp.svg"
            );
          } else if (element[tableKey[0]] == 2) {
            selectThisClass.setAttribute("src", "./icon/cancel_white_24dp.svg");
          } else {
            selectThisClassDiv.setAttribute("class", "classNoActionDiv");
            selectThisClass.setAttribute(
              "src",
              "./icon/selectThisClassEmpty.svg"
            );
          }
          preSelectThisClass.setAttribute("src", "./icon/bx-cart-arrow-in.svg");
          preSelectThisClass.setAttribute("id", element[tableKey[1]]);
          preSelectThisClassDiv.setAttribute("id", "0" + element[tableKey[1]]);
          if (!(preSelectlist === undefined)) {
            for (
              let preSelectlistPos = 0;
              preSelectlistPos < preSelectlist.length;
              preSelectlistPos++
            ) {
              if (preSelectlist[preSelectlistPos].id === element[tableKey[1]]) {
                preSelectThisClass.setAttribute(
                  "src",
                  "./icon/bx-cart-arrow-out.svg"
                );
                preSelectThisClassDiv.setAttribute(
                  "id",
                  "1" + element[tableKey[1]]
                );
                break;
              }
            }
          }
          selectThisClass.setAttribute("class", "classAction");
          preSelectThisClass.setAttribute("class", "classAction");
          selectThisClassDiv.appendChild(selectThisClass);
          preSelectThisClassDiv.appendChild(preSelectThisClass);
          preSelectThisClassDiv.setAttribute("class", "classActionDiv");
          preSelectThisClassDivArray.push(preSelectThisClassDiv);
          classActionBox.appendChild(selectThisClassDiv);
          classActionBox.appendChild(preSelectThisClassDiv);
          classActionBox.setAttribute("class", "classActionBox");
          td.appendChild(classActionBox);
          td.className = "mtd";
          tr.appendChild(td);
          for (let tabletd = 1; tabletd < 4; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[4]] === "必修") {
            td.style.color = "yellow";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[4]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[tableKey[5]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[7]]) {
            td.style.color = "var(--no-color)";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[6]];
          tr.appendChild(td);
          for (let tabletd = 8; tabletd < tableKey.length; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
        }
      } else {
        //以課表方式顯示
        table.className = "mBtable";
        let trSet = [];
        for (let key of dateHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let i = 0; i < 14; i++) {
          let tdSet = [];
          let tr = table.insertRow(-1); // TABLE ROW.
          for (let j = 0; j < 7; j++) {
            let td = document.createElement("td");
            if (j == 0) {
              td.innerHTML = timeSeg[i];
            }
            td.className = "mBtd";
            tdSet.push(td);
            tr.appendChild(td);
          }
          tr.className = "mBtr";
          trSet.push(tdSet);
        }
        for (let element of myclass) {
          for (let time of element["time"]) {
            let day = time.day + 1;
            let seg = time.seg;
            trSet[seg][day].innerHTML += element["name"] + "<br>";
          }
        }
      }
      viewTypeDiv.setAttribute("class", "viewType");
      viewTypeImg.setAttribute("class", "icon");
      if (showClassClassType == 0) {
        viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
      } else {
        viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
      }
      viewTypeDiv.appendChild(viewTypeImg);

      toolBar.setAttribute("class", "classClassToolBar"); //建立上方選科系班級區域
      actionDiv.appendChild(viewTypeDiv);
      main_frame.appendChild(table);
      let placeHolder = document.createElement("div");
      placeHolder.setAttribute("class", "placeHolder");
      main_frame.appendChild(actionDiv);
      main_frame.appendChild(placeHolder);

      for (
        let preSelectButton = 0;
        preSelectButton < preSelectThisClassDivArray.length;
        preSelectButton++
      ) {
        preSelectThisClassDivArray[preSelectButton].addEventListener(
          "click",
          async function () {
            let cart = document.getElementById(this.id.substring(1));
            if (this.id[0] === "1") {
              console.log("remove");
              ipc.send("removePreSelectClass", myclass[preSelectButton]);
              cart.src = "./icon/bx-cart-arrow-in.svg";
              this.id = "0" + this.id.substring(1);
            } else {
              console.log("add");
              ipc.send("addPreSelectClass", myclass[preSelectButton]);
              cart.src = "./icon/bx-cart-arrow-out.svg";
              this.id = "1" + this.id.substring(1);
            }
          }
        );
      }

      let depButtonBox = document.createElement("div"); //建立選科系區域
      depButtonBox.setAttribute("class", "depButtonBox");
      let depButtonArray = [];
      for (let element of dep) {
        //建立選科系按鈕
        let depButton = document.createElement("div");
        if (element === SelectedDepNo) {
          depButton.setAttribute("class", "depButtonSele");
        } else {
          depButton.setAttribute("class", "depButton");
        }

        depButton.setAttribute("role", "button");
        depButton.setAttribute("tablindex", "0");
        depButton.setAttribute("id", element);
        depButton.innerText = depName.get(element);
        depButtonBox.appendChild(depButton);
        depButtonArray.push(depButton);
      }
      toolBar.appendChild(depButtonBox);
      for (let element of depButtonArray) {
        element.addEventListener("click", async function () {
          console.log(element.id);
          SelDepNo = element.id;
          ipc.send("getClassClass", element.id, SelClassNo);
        });
      }
      let classButtonBox = document.createElement("div");
      classButtonBox.setAttribute("class", "classButtonBox");
      let classButtonArray = [];
      let classGroup = [];
      let classButtonGroup = document.createElement("div");
      classButtonGroup.setAttribute("class", "classButtonGroup");
      let groupMemberCount = 0;
      for (let element of classList) {
        let classButton = document.createElement("div");
        if (!classGroup.includes(element[0])) {
          classGroup.push(element[0]);
          if (groupMemberCount != 0) {
            classButtonBox.appendChild(classButtonGroup);
            groupMemberCount = 0;
          }
          let classGroupHead = document.createElement("div");
          classGroupHead.setAttribute("class", "classGroupHead");
          classGroupHead.innerText = element[0] + ":";
          classButtonGroup = document.createElement("div");
          classButtonGroup.setAttribute("class", "classButtonGroup");
          classButtonGroup.appendChild(classGroupHead);
        }
        if (element === SelectedClassNo) {
          classButton.setAttribute("class", "classButtonSele");
        } else {
          classButton.setAttribute("class", "classButton");
        }

        classButton.setAttribute("role", "button");
        classButton.setAttribute("tablindex", "0");
        classButton.setAttribute("id", element);
        classButton.innerText = element.replace(SelectedDepNo, "");
        classButton.innerText = classButton.innerText.replace(
          classButton.innerText[0],
          ""
        );
        classButtonGroup.appendChild(classButton);
        classButtonArray.push(classButton);
        groupMemberCount++;
      }
      classButtonBox.appendChild(classButtonGroup);
      toolBar.appendChild(classButtonBox);
      main_frame.appendChild(toolBar);
      for (let element of classButtonArray) {
        element.addEventListener("click", async function () {
          console.log(element.id);
          SelDepNo = element.id[1];
          ipc.send("getClassClass", SelDepNo, element.id);
        });
      }
      viewTypeDiv.addEventListener("click", async function () {
        console.log("change");
        if (showClassClassType == 0) {
          showClassClassType = 1;
          viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
        } else {
          showClassClassType = 0;
          viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
        }
        showClassClass(SelectedDepNo, SelectedClassNo, classList);
      });
    });
  });
}
async function showGeneralClass() {
  await cleanFrame();
  let actionDiv = document.createElement("div");
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let viewTypeDiv = document.createElement("div");
  let viewTypeImg = document.createElement("img");
  actionDiv.setAttribute("class", "actionDiv");
  fs.readFile("./src/data/generalClass.json", function (err, myClass) {
    let preSelectThisClassDivArray = [];
    let preSelectlist;
    if (err) {
      return console.log(err);
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let myclass = myClass.toString();
    //將字符串轉換為 JSON 對象
    try {
      myclass = JSON.parse(myclass);
    } catch (error) {}
    let readshoppingCart = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/shoppingCart.json",
        function (err, preSelectlistData) {
          if (err) {
            console.error(err);
            preSelectlist = "[]";
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          } else {
            preSelectlist = preSelectlistData.toString();
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          }
        }
      );
    });
    readshoppingCart.then(function () {
      if (showClassClassType == 0) {
        //以列表方式顯示
        table.className = "mtable";
        for (let key of tableHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let element of myclass) {
          tr = table.insertRow(-1);
          tr.className = "mtr";
          let td = document.createElement("td");
          let selectThisClass = document.createElement("img");
          let preSelectThisClass = document.createElement("img");
          let selectThisClassDiv = document.createElement("div");
          let preSelectThisClassDiv = document.createElement("div");
          let classActionBox = document.createElement("div");
          selectThisClassDiv.setAttribute("class", "classActionDiv");
          if (element[tableKey[0]] == 1) {
            selectThisClass.setAttribute(
              "src",
              "./icon/add_circle_outline_white_24dp.svg"
            );
          } else if (element[tableKey[0]] == 2) {
            selectThisClass.setAttribute("src", "./icon/cancel_white_24dp.svg");
          } else {
            selectThisClassDiv.setAttribute("class", "classNoActionDiv");
            selectThisClass.setAttribute(
              "src",
              "./icon/selectThisClassEmpty.svg"
            );
          }
          preSelectThisClass.setAttribute("src", "./icon/bx-cart-arrow-in.svg");
          preSelectThisClass.setAttribute("id", element[tableKey[1]]);
          preSelectThisClassDiv.setAttribute("id", "0" + element[tableKey[1]]);
          if (!(preSelectlist === undefined)) {
            for (
              let preSelectlistPos = 0;
              preSelectlistPos < preSelectlist.length;
              preSelectlistPos++
            ) {
              if (preSelectlist[preSelectlistPos].id === element[tableKey[1]]) {
                preSelectThisClass.setAttribute(
                  "src",
                  "./icon/bx-cart-arrow-out.svg"
                );
                preSelectThisClassDiv.setAttribute(
                  "id",
                  "1" + element[tableKey[1]]
                );
                break;
              }
            }
          }
          selectThisClass.setAttribute("class", "classAction");
          preSelectThisClass.setAttribute("class", "classAction");
          selectThisClassDiv.appendChild(selectThisClass);
          preSelectThisClassDiv.appendChild(preSelectThisClass);
          preSelectThisClassDiv.setAttribute("class", "classActionDiv");
          preSelectThisClassDivArray.push(preSelectThisClassDiv);
          classActionBox.appendChild(selectThisClassDiv);
          classActionBox.appendChild(preSelectThisClassDiv);
          classActionBox.setAttribute("class", "classActionBox");
          td.appendChild(classActionBox);
          td.className = "mtd";
          tr.appendChild(td);
          for (let tabletd = 1; tabletd < 4; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[4]] === "必修") {
            td.style.color = "yellow";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[4]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[tableKey[5]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[7]]) {
            td.style.color = "var(--no-color)";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[6]];
          tr.appendChild(td);
          for (let tabletd = 8; tabletd < tableKey.length; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
        }
      } else {
        //以課表方式顯示
        table.className = "mBtable";
        let trSet = [];
        for (let key of dateHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let i = 0; i < 14; i++) {
          let tdSet = [];
          let tr = table.insertRow(-1); // TABLE ROW.
          for (let j = 0; j < 7; j++) {
            let td = document.createElement("td");
            if (j == 0) {
              td.innerHTML = timeSeg[i];
            }
            td.className = "mBtd";
            tdSet.push(td);
            tr.appendChild(td);
          }
          tr.className = "mBtr";
          trSet.push(tdSet);
        }
        for (let element of myclass) {
          for (let time of element["time"]) {
            let day = time.day + 1;
            let seg = time.seg;
            trSet[seg][day].innerHTML += element["name"] + "<br>";
          }
        }
      }
      viewTypeDiv.setAttribute("class", "viewType");
      viewTypeImg.setAttribute("class", "icon");
      if (showClassClassType == 0) {
        viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
      } else {
        viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
      }
      viewTypeDiv.appendChild(viewTypeImg);
      actionDiv.appendChild(viewTypeDiv);
      main_frame.appendChild(table);
      let placeHolder = document.createElement("div");
      placeHolder.setAttribute("class", "placeHolder");
      main_frame.appendChild(actionDiv);
      main_frame.appendChild(placeHolder);

      for (
        let preSelectButton = 0;
        preSelectButton < preSelectThisClassDivArray.length;
        preSelectButton++
      ) {
        preSelectThisClassDivArray[preSelectButton].addEventListener(
          "click",
          async function () {
            let cart = document.getElementById(this.id.substring(1));
            if (this.id[0] === "1") {
              console.log("remove");
              ipc.send("removePreSelectClass", myclass[preSelectButton]);
              cart.src = "./icon/bx-cart-arrow-in.svg";
              this.id = "0" + this.id.substring(1);
            } else {
              console.log("add");
              ipc.send("addPreSelectClass", myclass[preSelectButton]);
              cart.src = "./icon/bx-cart-arrow-out.svg";
              this.id = "1" + this.id.substring(1);
            }
          }
        );
      }
      viewTypeDiv.addEventListener("click", async function () {
        console.log("change");
        if (showClassClassType == 0) {
          showClassClassType = 1;
          viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
        } else {
          showClassClassType = 0;
          viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
        }
        showGeneralClass();
      });
    });
  });
}
async function showPreSelectClass() {
  await cleanRightFrame();
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let viewShoppingCartDiv = document.createElement("div");
  let viewShoppingCartImg = document.createElement("img");
  let miniTableHead = ["動作", "課程代碼", "課程名稱", "教師", "類別", "學分"];
  fs.readFile("./src/data/shoppingCart.json", function (err, myClass) {
    let preSelectThisClassDivArray = [];
    if (err) {
      return console.log(err);
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let myclass = myClass.toString();
    //將字符串轉換為 JSON 對象
    try {
      myclass = JSON.parse(myclass);
    } catch (error) {}
    if (showMyClassType == 0) {
      //以列表方式顯示
      table.className = "sctable";
      for (let key of miniTableHead) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute("id", "scheader");
        th.innerHTML = key;
        tHead.appendChild(th);
      }
      table.appendChild(tHead);
      for (let element of myclass) {
        tr = table.insertRow(-1);
        tr.className = "sctr";
        let td = document.createElement("td");
        let preSelectThisClass = document.createElement("img");
        let preSelectThisClassDiv = document.createElement("div");
        let classActionBox = document.createElement("div");
        preSelectThisClass.setAttribute("src", "./icon/bx-cart-arrow-out.svg");
        preSelectThisClassDiv.setAttribute("id", "s" + element[tableKey[1]]);
        preSelectThisClass.setAttribute("class", "classAction");
        preSelectThisClassDiv.appendChild(preSelectThisClass);
        preSelectThisClassDiv.setAttribute("class", "classActionDiv");
        preSelectThisClassDivArray.push(preSelectThisClassDiv);
        classActionBox.appendChild(preSelectThisClassDiv);
        classActionBox.setAttribute("class", "classActionBox");
        td.appendChild(classActionBox);
        td.className = "sctd";
        tr.appendChild(td);
        for (let tabletd = 1; tabletd < 4; tabletd++) {
          let td = document.createElement("td");
          td.className = "sctd";
          td.innerHTML = element[tableKey[tabletd]];
          tr.appendChild(td);
        }
        td = document.createElement("td");
        td.className = "sctd";
        if (element[tableKey[4]] === "必修") {
          td.style.color = "yellow";
        } else {
          td.style.color = "var(--yes-color)";
        }
        td.innerHTML = element[tableKey[4]];
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = "sctd";
        td.innerHTML = element[tableKey[5]];
        tr.appendChild(td);
      }
    }
    viewShoppingCartDiv.setAttribute("class", "viewShoppingCart");
    viewShoppingCartImg.setAttribute("class", "icon");
    viewShoppingCartImg.setAttribute(
      "src",
      "./icon/shopping_cart_white_24dp.svg"
    );
    viewShoppingCartDiv.appendChild(viewShoppingCartImg);
    right_frame.appendChild(table);
    let placeHolder = document.createElement("div");
    placeHolder.setAttribute("class", "placeHolder");
    right_frame.appendChild(placeHolder);

    for (
      let preSelectButton = 0;
      preSelectButton < preSelectThisClassDivArray.length;
      preSelectButton++
    ) {
      preSelectThisClassDivArray[preSelectButton].addEventListener(
        "click",
        async function () {
          console.log("remove");
          ipc.send("removePreSelectClassAndUpdate", myclass[preSelectButton]);
        }
      );
    }
    right_frame.appendChild(viewShoppingCartDiv);
    viewShoppingCartDiv.addEventListener("click", async function () {
      showPreSelectClass();
    });
  });
}
async function showPreSelectClassAtPreSelectPage() {
  await cleanRightFrame();
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let viewShoppingCartDiv = document.createElement("div");
  let viewShoppingCartImg = document.createElement("img");
  let miniTableHead = ["動作", "課程代碼", "課程名稱", "教師", "類別", "學分"];
  fs.readFile("./src/data/shoppingCart.json", function (err, myClassData) {
    let preSelectThisClassDivArray = [];
    let exportThisClassDivArray = [];
    let exportThisClassArray = [];
    let myclass;
    if (err) {
      console.log(err);
      myclass = "[]";
    } else {
      myclass = myClassData.toString();
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let preSelectlist;
    let readPreSelectPage = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/PreSelectPage.json",
        function (err, preSelectlistData) {
          if (err) {
            console.error(err);
            preSelectlist = "[]";
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          } else {
            preSelectlist = preSelectlistData.toString();
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          }
        }
      );
    });
    readPreSelectPage.then(function () {
      //將字符串轉換為 JSON 對象
      try {
        myclass = JSON.parse(myClassData);
      } catch (error) {}
      table.className = "sctable";
      for (let key of miniTableHead) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute("id", "scheader");
        th.innerHTML = key;
        tHead.appendChild(th);
      }
      table.appendChild(tHead);
      for (let element of myclass) {
        tr = table.insertRow(-1);
        tr.className = "sctr";
        let td = document.createElement("td");
        let preSelectThisClass = document.createElement("img");
        let preSelectThisClassDiv = document.createElement("div");
        let exportThisClass = document.createElement("img");
        let exportThisClassDiv = document.createElement("div");
        let classActionBox = document.createElement("div");
        preSelectThisClass.setAttribute("src", "./icon/bx-cart-arrow-out.svg");
        preSelectThisClassDiv.setAttribute("id", "s" + element[tableKey[1]]);
        preSelectThisClass.setAttribute("class", "classAction");
        preSelectThisClassDiv.appendChild(preSelectThisClass);
        preSelectThisClassDiv.setAttribute("class", "classActionDiv");
        preSelectThisClassDivArray.push(preSelectThisClassDiv);
        exportThisClass.setAttribute("src", "./icon/bxs-file-export.svg");
        exportThisClassDiv.setAttribute("id", "e" + element[tableKey[1]]);
        exportThisClass.setAttribute("class", "classAction");
        exportThisClassDiv.appendChild(exportThisClass);
        exportThisClassDiv.setAttribute("class", "classActionDiv");
        let isIn = false;
        for (let i = 0; i < preSelectlist.length; i++) {
          if (preSelectlist[i].id === element.id) {
            isIn = true;
            break;
          }
        }
        if (!isIn) {
          exportThisClassArray.push(element);
          exportThisClassDivArray.push(exportThisClassDiv);
        } else {
          exportThisClass.setAttribute(
            "src",
            "./icon/selectThisClassEmpty.svg"
          );
          exportThisClassDiv.setAttribute("class", "classNoActionDiv");
        }
        classActionBox.appendChild(exportThisClassDiv);
        classActionBox.appendChild(preSelectThisClassDiv);
        classActionBox.setAttribute("class", "classActionBox");
        td.appendChild(classActionBox);
        td.className = "sctd";
        tr.appendChild(td);
        for (let tabletd = 1; tabletd < 4; tabletd++) {
          let td = document.createElement("td");
          td.className = "sctd";
          td.innerHTML = element[tableKey[tabletd]];
          tr.appendChild(td);
        }
        td = document.createElement("td");
        td.className = "sctd";
        if (element[tableKey[4]] === "必修") {
          td.style.color = "yellow";
        } else {
          td.style.color = "var(--yes-color)";
        }
        td.innerHTML = element[tableKey[4]];
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = "sctd";
        td.innerHTML = element[tableKey[5]];
        tr.appendChild(td);
      }
      viewShoppingCartDiv.setAttribute("class", "viewShoppingCart");
      viewShoppingCartImg.setAttribute("class", "icon");
      viewShoppingCartImg.setAttribute(
        "src",
        "./icon/shopping_cart_white_24dp.svg"
      );
      viewShoppingCartDiv.appendChild(viewShoppingCartImg);
      right_frame.appendChild(table);
      let placeHolder = document.createElement("div");
      placeHolder.setAttribute("class", "placeHolder");
      right_frame.appendChild(placeHolder);

      for (
        let preSelectButton = 0;
        preSelectButton < preSelectThisClassDivArray.length;
        preSelectButton++
      ) {
        preSelectThisClassDivArray[preSelectButton].addEventListener(
          "click",
          async function () {
            console.log("remove");
            ipc.send(
              "preSelectPageRemovePreSelectClass",
              myclass[preSelectButton]
            );
          }
        );
      }
      for (
        let exportSelectButton = 0;
        exportSelectButton < exportThisClassDivArray.length;
        exportSelectButton++
      ) {
        exportThisClassDivArray[exportSelectButton].addEventListener(
          "click",
          async function () {
            console.log("export");
            ipc.send(
              "exportPreSelectClass",
              exportThisClassArray[exportSelectButton]
            );
          }
        );
      }
      right_frame.appendChild(viewShoppingCartDiv);
      viewShoppingCartDiv.addEventListener("click", async function () {
        showPreSelectClass();
      });
    });
  });
}

async function showPreSelectClassAtFastSelectPage() {
  await cleanRightFrame();
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let viewShoppingCartDiv = document.createElement("div");
  let viewShoppingCartImg = document.createElement("img");
  let miniTableHead = ["動作", "課程代碼", "課程名稱", "教師", "類別", "學分"];
  fs.readFile("./src/data/shoppingCart.json", function (err, myClassData) {
    let preSelectThisClassDivArray = [];
    let copyThisClassDivArray = [];
    let copyThisClassArray = [];
    let myclass;
    if (err) {
      console.log(err);
      myclass = "[]";
    } else {
      myclass = myClassData.toString();
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let preSelectlist;
    let readPreSelectPage = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/PreSelectPage.json",
        function (err, preSelectlistData) {
          if (err) {
            console.error(err);
            preSelectlist = "[]";
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          } else {
            preSelectlist = preSelectlistData.toString();
            preSelectlist = JSON.parse(preSelectlist);
            resolve();
          }
        }
      );
    });
    readPreSelectPage.then(function () {
      //將字符串轉換為 JSON 對象
      try {
        myclass = JSON.parse(myClassData);
      } catch (error) {}
      table.className = "sctable";
      for (let key of miniTableHead) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute("id", "scheader");
        th.innerHTML = key;
        tHead.appendChild(th);
      }
      table.appendChild(tHead);
      for (let element of myclass) {
        tr = table.insertRow(-1);
        tr.className = "sctr";
        let td = document.createElement("td");
        let preSelectThisClass = document.createElement("img");
        let preSelectThisClassDiv = document.createElement("div");
        let copyThisClass = document.createElement("img");
        let copyThisClassDiv = document.createElement("div");
        let classActionBox = document.createElement("div");
        preSelectThisClass.setAttribute("src", "./icon/bx-cart-arrow-out.svg");
        preSelectThisClassDiv.setAttribute("id", "s" + element[tableKey[1]]);
        preSelectThisClass.setAttribute("class", "classAction");
        preSelectThisClassDiv.appendChild(preSelectThisClass);
        preSelectThisClassDiv.setAttribute("class", "classActionDiv");
        preSelectThisClassDivArray.push(preSelectThisClassDiv);
        copyThisClass.setAttribute("src", "./icon/bxs-eyedropper.svg");
        copyThisClassDiv.setAttribute("id", "e" + element[tableKey[1]]);
        copyThisClass.setAttribute("class", "classAction");
        copyThisClassDiv.appendChild(copyThisClass);
        copyThisClassDiv.setAttribute("class", "classActionDiv");
        let isIn = false;
        for (let i = 0; i < preSelectlist.length; i++) {
          if (preSelectlist[i].id === element.id) {
            isIn = true;
            break;
          }
        }
        copyThisClassArray.push(element);
        copyThisClassDivArray.push(copyThisClassDiv);
        classActionBox.appendChild(copyThisClassDiv);
        classActionBox.appendChild(preSelectThisClassDiv);
        classActionBox.setAttribute("class", "classActionBox");
        td.appendChild(classActionBox);
        td.className = "sctd";
        tr.appendChild(td);
        for (let tabletd = 1; tabletd < 4; tabletd++) {
          let td = document.createElement("td");
          td.className = "sctd";
          td.innerHTML = element[tableKey[tabletd]];
          tr.appendChild(td);
        }
        td = document.createElement("td");
        td.className = "sctd";
        if (element[tableKey[4]] === "必修") {
          td.style.color = "yellow";
        } else {
          td.style.color = "var(--yes-color)";
        }
        td.innerHTML = element[tableKey[4]];
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = "sctd";
        td.innerHTML = element[tableKey[5]];
        tr.appendChild(td);
      }
      viewShoppingCartDiv.setAttribute("class", "viewShoppingCart");
      viewShoppingCartImg.setAttribute("class", "icon");
      viewShoppingCartImg.setAttribute(
        "src",
        "./icon/shopping_cart_white_24dp.svg"
      );
      viewShoppingCartDiv.appendChild(viewShoppingCartImg);
      right_frame.appendChild(table);
      let placeHolder = document.createElement("div");
      placeHolder.setAttribute("class", "placeHolder");
      right_frame.appendChild(placeHolder);

      for (
        let preSelectButton = 0;
        preSelectButton < preSelectThisClassDivArray.length;
        preSelectButton++
      ) {
        preSelectThisClassDivArray[preSelectButton].addEventListener(
          "click",
          async function () {
            console.log("remove");
            ipc.send(
              "preSelectPageRemovePreSelectClass",
              myclass[preSelectButton]
            );
          }
        );
      }
      for (
        let copySelectButton = 0;
        copySelectButton < copyThisClassDivArray.length;
        copySelectButton++
      ) {
        copyThisClassDivArray[copySelectButton].addEventListener(
          "click",
          async function () {
            console.log("copied");
            ipc.send(
              "copyPreSelectClass",
              copyThisClassArray[copySelectButton]
            );
          }
        );
      }
      right_frame.appendChild(viewShoppingCartDiv);
      viewShoppingCartDiv.addEventListener("click", async function () {
        showPreSelectClassAtFastSelectPage();
      });
    });
  });
}

let shadow;

let showpreSelectClassType = 0;
let preSelectClassPageReady = false;
let preSelectClassPagePlay = false;
async function preSelectClassPage() {
  await cleanFrame();
  let areaSettingJson;
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let actionDiv = document.createElement("div");
  let viewTypeDiv = document.createElement("div");
  let viewTypeImg = document.createElement("img");
  let saveDiv = document.createElement("div");
  let saveImg = document.createElement("img");
  let readyDiv = document.createElement("div");
  let readyImg = document.createElement("img");
  let playDiv = document.createElement("div");
  let playImg = document.createElement("img");
  actionDiv.setAttribute("class", "actionDiv");
  fs.readFile("./src/data/PreSelectPage.json", function (err, myClass) {
    let preSelectThisClassDivArray = [];
    let trArray = [];
    if (err) {
      console.log(err);
      myclass = "[]";
      //將字符串轉換為 JSON 對象
      try {
        myclass = JSON.parse(myclass);
      } catch (error) {}
    } else {
      myclass = myClass.toString();
      //將字符串轉換為 JSON 對象
      try {
        myclass = JSON.parse(myclass);
      } catch (error) {}
    }
    let areaSetting = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/PreSelectPageSetting.json",
        function (err, setting) {
          if (err) {
            console.log(err);
            setting = '{"isSet":false,"isPlay":false}';
            //將字符串轉換為 JSON 對象
            try {
              areaSettingJson = JSON.parse(setting);
              resolve();
            } catch (error) {}
          } else {
            setting = setting.toString();
            //將字符串轉換為 JSON 對象
            try {
              areaSettingJson = JSON.parse(setting);
              if (areaSetting["isSet"]) preSelectClassPageReady = true;
              if (areaSetting["isPlay"]) preSelectClassPagePlay = true;
              resolve();
            } catch (error) {}
          }
        }
      );
    });
    areaSetting.then(function () {
      console.log("start");

      if (showpreSelectClassType == 0) {
        //以列表方式顯示
        table.className = "mtable";
        for (let key of tableHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let element of myclass) {
          tr = table.insertRow(-1);
          tr.className = "mtr";
          tr.setAttribute("draggable", "true");
          trArray.push(tr);
          let td = document.createElement("td");
          let lockThisClass = document.createElement("img");
          let lockThisClassDiv = document.createElement("div");
          let selectThisClass = document.createElement("img");
          let selectThisClassDiv = document.createElement("div");
          let preSelectThisClass = document.createElement("img");
          let preSelectThisClassDiv = document.createElement("div");
          let classActionBox = document.createElement("div");
          selectThisClassDiv.setAttribute("class", "classActionDiv");
          lockThisClassDiv.setAttribute("class", "classActionDiv classLock");
          if (element[tableKey[0]] == 1) {
            selectThisClass.setAttribute(
              "src",
              "./icon/add_circle_outline_white_24dp.svg"
            );
          } else if (element[tableKey[0]] == 2) {
            selectThisClass.setAttribute("src", "./icon/cancel_white_24dp.svg");
          } else {
            selectThisClassDiv.setAttribute("class", "classNoActionDiv");
            selectThisClass.setAttribute(
              "src",
              "./icon/selectThisClassEmpty.svg"
            );
          }
          if (element["isLock"] == true) {
            lockThisClass.setAttribute("src", "./icon/bxs-lock.svg");
            lockThisClassDiv.classList.add("isLock");
          } else {
            lockThisClass.setAttribute("src", "./icon/bxs-lock-open.svg");
            lockThisClassDiv.classList.add("isUnLock");
          }
          lockThisClass.setAttribute("class", "classAction");
          lockThisClassDiv.appendChild(lockThisClass);
          preSelectThisClass.setAttribute(
            "src",
            "./icon/getout_white_24dp.svg"
          );
          preSelectThisClass.setAttribute("id", element[tableKey[1]]);
          selectThisClass.setAttribute("class", "classAction");
          preSelectThisClass.setAttribute("class", "classAction");
          selectThisClassDiv.appendChild(selectThisClass);
          preSelectThisClassDiv.appendChild(preSelectThisClass);
          preSelectThisClassDiv.setAttribute("class", "classActionDiv");
          preSelectThisClassDivArray.push(preSelectThisClassDiv);
          classActionBox.appendChild(selectThisClassDiv);
          classActionBox.appendChild(lockThisClassDiv);
          classActionBox.appendChild(preSelectThisClassDiv);
          classActionBox.setAttribute("class", "classActionBoxInPSCP");
          td.appendChild(classActionBox);
          td.className = "mtd";
          tr.appendChild(td);

          td = document.createElement("td");
          td.className = "mtd candidate";
          td.innerHTML = element[tableKey[1]];
          tr.appendChild(td);
          for (let tabletd = 2; tabletd < 4; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[4]] === "必修") {
            td.style.color = "yellow";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[4]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[tableKey[5]];
          tr.appendChild(td);
          td = document.createElement("td");
          td.className = "mtd";
          if (element[tableKey[7]]) {
            td.style.color = "var(--no-color)";
          } else {
            td.style.color = "var(--yes-color)";
          }
          td.innerHTML = element[tableKey[6]];
          tr.appendChild(td);
          for (let tabletd = 8; tabletd < tableKey.length; tabletd++) {
            let td = document.createElement("td");
            td.className = "mtd";
            td.innerHTML = element[tableKey[tabletd]];
            tr.appendChild(td);
          }
        }
      } else {
        //以課表方式顯示
        table.className = "mBtable";
        let trSet = [];
        for (let key of dateHead) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = key;
          tHead.appendChild(th);
        }
        table.appendChild(tHead);
        for (let i = 0; i < 14; i++) {
          let tdSet = [];
          let tr = table.insertRow(-1); // TABLE ROW.
          for (let j = 0; j < 7; j++) {
            let td = document.createElement("td");
            if (j == 0) {
              td.innerHTML = timeSeg[i];
            }
            td.className = "mBtd";
            tdSet.push(td);
            tr.appendChild(td);
          }
          tr.className = "mBtr";
          trSet.push(tdSet);
        }
        for (let element of myclass) {
          for (let time of element["time"]) {
            let day = time.day + 1;
            let seg = time.seg;
            trSet[seg][day].innerHTML += element["name"] + "<br>";
          }
        }
      }
      viewTypeDiv.setAttribute("class", "viewType");
      viewTypeImg.setAttribute("class", "icon");
      if (showClassClassType == 0) {
        viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
      } else {
        viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
      }
      saveDiv.setAttribute("class", "save");
      saveImg.setAttribute("class", "icon");
      saveImg.setAttribute("src", "./icon/bx-save-check.svg");
      saveDiv.appendChild(saveImg);
      readyDiv.setAttribute("class", "ready");
      readyImg.setAttribute("class", "icon");
      readyImg.setAttribute("src", "./icon/playlist_remove_24dp.svg");
      if (preSelectClassPageReady) {
        readyImg.setAttribute("src", "./icon/playlist_add_check_24dp.svg");
      } else {
        readyImg.setAttribute("src", "./icon/playlist_remove_24dp.svg");
      }
      viewTypeDiv.appendChild(viewTypeImg);
      if (preSelectClassPagePlay) {
        playImg.setAttribute("src", "./icon/stop_24dp.svg");
      } else {
        playImg.setAttribute("src", "./icon/play_arrow_24dp.svg");
      }
      playDiv.setAttribute("class", "save");
      playImg.setAttribute("class", "icon");
      playDiv.appendChild(playImg);
      actionDiv.appendChild(viewTypeDiv);
      saveDiv.appendChild(saveImg);
      actionDiv.appendChild(saveDiv);
      readyDiv.appendChild(readyImg);
      actionDiv.appendChild(readyDiv);
      actionDiv.appendChild(playDiv);
      main_frame.appendChild(table);
      main_frame.appendChild(actionDiv);
      let placeHolder = document.createElement("div");
      placeHolder.setAttribute("class", "placeHolder");
      main_frame.appendChild(placeHolder);
      for (let trCount = 0; trCount < trArray.length; trCount++) {
        trArray[trCount].addEventListener("dragstart", function dragit(event) {
          console.log("ondragstart");
          this.classList.add("dragging");
          shadow = event.target;
        });
        trArray[trCount].addEventListener("dragenter", function dragover(e) {
          console.log("ondragenter");
          saveImg.setAttribute("src", "./icon/bx-save.svg");
          let children = Array.from(e.target.parentNode.parentNode.children);
          if (
            children.indexOf(e.target.parentNode) > children.indexOf(shadow)
          ) {
            e.target.parentNode.after(shadow);
          } else {
            e.target.parentNode.before(shadow);
          }
        });
      }
      for (
        let preSelectButton = 0;
        preSelectButton < preSelectThisClassDivArray.length;
        preSelectButton++
      ) {
        preSelectThisClassDivArray[preSelectButton].addEventListener(
          "click",
          async function () {
            console.log("remove");
            ipc.send("preSelectPageRemoveClass", myclass[preSelectButton]);
          }
        );
      }
      viewTypeDiv.addEventListener("click", async function () {
        console.log("change");
        if (showpreSelectClassType == 0) {
          showpreSelectClassType = 1;
          viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
        } else {
          showpreSelectClassType = 0;
          viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
        }
        preSelectClassPage();
      });
      readyDiv.addEventListener("click", async function () {
        if (preSelectClassPageReady) {
          console.log("notReady");
          preSelectClassPageReady = false;
          areaSettingJson["isSet"] = false;
          readyImg.setAttribute("src", "./icon/playlist_remove_24dp.svg");
          ipc.send("preSelectPageState", 0);
        } else {
          console.log("ready");
          preSelectClassPageReady = true;
          areaSettingJson["isSet"] = true;
          readyImg.setAttribute("src", "./icon/playlist_add_check_24dp.svg");
          ipc.send("preSelectPageState", 1);
        }
        let saved = new Promise((resolve, reject) => {
          fs.writeFile(
            "./src/data/PreSelectPageSetting.json",
            JSON.stringify(areaSettingJson),
            function (err) {
              if (err) {
                console.error(err);
              } else {
                resolve();
                console.log("write saveFile...");
              }
            }
          );
        });
        saved.then(function (result) {
          saveImg.setAttribute("src", "./icon/bx-save-check.svg");
        });
      });
      let classLockList = document.getElementsByClassName("classLock");
      for (let element of classLockList) {
        element.addEventListener("click", async function () {
          let lockSvg = this.firstChild;
          if (element.classList.contains("isLock")) {
            this.classList.remove("isLock");
            this.classList.add("isUnLock");
            lockSvg.setAttribute("src", "./icon/bxs-lock-open.svg");
          } else {
            this.classList.remove("isUnLock");
            this.classList.add("isLock");
            lockSvg.setAttribute("src", "./icon/bxs-lock.svg");
          }
          saveImg.setAttribute("src", "./icon/bx-save.svg");
        });
      }
      playDiv.addEventListener("click", async function () {
        if (preSelectClassPagePlay) {
          console.log("stop");
          preSelectClassPagePlay = false;
          areaSettingJson["isPlay"] = false;
          playImg.setAttribute("src", "./icon/play_arrow_24dp.svg");
          ipc.send("preSelectPagePlay", 0);
        } else {
          console.log("play");
          preSelectClassPagePlay = true;
          areaSettingJson["isPlay"] = true;
          playImg.setAttribute("src", "./icon/stop_24dp.svg");
          ipc.send("preSelectPagePlay", 1);
        }
        let saved = new Promise((resolve, reject) => {
          fs.writeFile(
            "./src/data/PreSelectPageSetting.json",
            JSON.stringify(areaSettingJson),
            function (err) {
              if (err) {
                console.error(err);
              } else {
                resolve();
                console.log("write saveFile...");
              }
            }
          );
        });
        saved.then(function (result) {
          saveImg.setAttribute("src", "./icon/bx-save-check.svg");
        });
      });
      saveDiv.addEventListener("click", async function () {
        console.log("save");
        let classList = document.getElementsByClassName("candidate");
        let classLockList = document.getElementsByClassName("classLock");
        let newSave = [];
        for (let i = 0; i < classList.length; i++) {
          for (let element of myclass) {
            if (element.id === classList[i].innerHTML) {
              element.isLock = classLockList[i].classList.contains("isLock");
              newSave.push(element);
              break;
            }
          }
        }
        let saved = new Promise((resolve, reject) => {
          fs.writeFile(
            "./src/data/PreSelectPage.json",
            JSON.stringify(newSave),
            function (err) {
              if (err) {
                console.error(err);
              } else {
                resolve();
                console.log("write saveFile...");
              }
            }
          );
        });
        saved.then(function (result) {
          saveImg.setAttribute("src", "./icon/bx-save-check.svg");
        });
      });
    });
  });
}
let showMyClassType = 0;
async function showMyClass() {
  await cleanFrame();
  await cleanRightFrame();
  showPreSelectClass();
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
  let actionDiv = document.createElement("div");
  actionDiv.setAttribute("class", "actionDiv");
  let viewTypeDiv = document.createElement("div");
  let viewTypeImg = document.createElement("img");

  fs.readFile("./src/data/myClass.json", function (err, myClass) {
    if (err) {
      return console.log(err);
    }
    console.log("start");
    //將二進制數據轉換為字串符
    let myclass = myClass.toString();
    //將字符串轉換為 JSON 對象
    try {
      myclass = JSON.parse(myclass);
    } catch (error) {}
    if (showMyClassType == 0) {
      table.className = "mtable";
      for (let key of tableHead) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute("id", "mheader");
        th.innerHTML = key;
        tHead.appendChild(th);
      }
      table.appendChild(tHead);
      for (let element of myclass) {
        tr = table.insertRow(-1);
        tr.className = "mtr";
        let td = document.createElement("td");
        td.className = "mtd";
        let selectThisClass = document.createElement("img");
        let selectThisClassDiv = document.createElement("div");
        let classActionBox = document.createElement("div");
        selectThisClassDiv.setAttribute("class", "classActionDiv");
        if (element[tableKey[0]] == 1) {
          selectThisClass.setAttribute(
            "src",
            "./icon/add_circle_outline_white_24dp.svg"
          );
        } else if (element[tableKey[0]] == 2) {
          selectThisClass.setAttribute("src", "./icon/cancel_white_24dp.svg");
        } else {
          selectThisClassDiv.setAttribute("class", "classNoActionDiv");
          selectThisClass.setAttribute(
            "src",
            "./icon/selectThisClassEmpty.svg"
          );
        }
        selectThisClass.setAttribute("class", "classAction");
        selectThisClassDiv.appendChild(selectThisClass);
        classActionBox.appendChild(selectThisClassDiv);
        classActionBox.setAttribute("class", "classActionBox");
        td.appendChild(classActionBox);
        td.className = "mtd";
        tr.appendChild(td);
        for (let tabletd = 1; tabletd < 4; tabletd++) {
          let td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[tableKey[tabletd]];
          tr.appendChild(td);
        }
        td = document.createElement("td");
        td.className = "mtd";
        if (element[tableKey[4]] === "必修") {
          td.style.color = "yellow";
        } else {
          td.style.color = "var(--yes-color)";
        }
        td.innerHTML = element[tableKey[4]];
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = "mtd";
        td.innerHTML = element[tableKey[5]];
        tr.appendChild(td);
        td = document.createElement("td");
        td.className = "mtd";
        if (element[tableKey[7]]) {
          td.style.color = "var(--no-color)";
        } else {
          td.style.color = "var(--yes-color)";
        }
        td.innerHTML = element[tableKey[6]];
        tr.appendChild(td);
        for (let tabletd = 8; tabletd < tableKey.length; tabletd++) {
          let td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[tableKey[tabletd]];
          tr.appendChild(td);
        }
      }
    } else {
      table.className = "mBtable";
      let trSet = [];

      for (let key of dateHead) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute("id", "mheader");
        th.innerHTML = key;
        tHead.appendChild(th);
      }
      table.appendChild(tHead);
      for (let i = 0; i < 14; i++) {
        let tdSet = [];
        let tr = table.insertRow(-1); // TABLE ROW.
        for (let j = 0; j < 7; j++) {
          let td = document.createElement("td");
          if (j == 0) {
            td.innerHTML = timeSeg[i];
          }
          td.className = "mBtd";
          tdSet.push(td);
          tr.appendChild(td);
        }
        tr.className = "mBtr";
        trSet.push(tdSet);
      }
      for (let element of myclass) {
        for (let time of element["time"]) {
          let day = time.day + 1;
          let seg = time.seg;
          trSet[seg][day].innerHTML = element["name"] + "<br>";
        }
      }
    }
    viewTypeDiv.setAttribute("class", "viewType");
    viewTypeImg.setAttribute("class", "icon");
    if (showMyClassType == 0) {
      viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
    } else {
      viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
    }
    viewTypeDiv.appendChild(viewTypeImg);
    actionDiv.appendChild(viewTypeDiv);

    main_frame.appendChild(table);
    main_frame.appendChild(actionDiv);
    let placeHolder = document.createElement("div");
    placeHolder.setAttribute("class", "placeHolder");
    main_frame.appendChild(placeHolder);
    viewTypeDiv.addEventListener("click", async function () {
      console.log("change");
      if (showMyClassType == 0) {
        showMyClassType = 1;
        viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
      } else {
        showMyClassType = 0;
        viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
      }
      showMyClass();
    });
  });
}

async function updateTime() {
  let setting;
  let settingPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile("./src/data/setting.json", function (err, settingSaved) {
      if (err) {
        reject("no file");
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
  settingPromise.then(function (success) {
    let sDay = Date.parse(setting["selectStartDate"]);
    if (sDay > Date.now()) {
      if (typeof countDownTimer != undefined) {
        clearInterval(countDownTimer);
      }
      if (typeof tickTimer != undefined) {
        clearInterval(tickTimer);
      }
      countDownTimer = setInterval(function () {
        let start = Date.now();
        let leftTime = sDay - Date.now();
        if (leftTime > 0) {
          let days = Math.floor(leftTime / _day);
          leftTime -= days * _day;
          let hours = Math.floor(leftTime / _hour);
          leftTime -= hours * _hour;
          let minutes = Math.floor(leftTime / _minute);
          leftTime -= minutes * _minute;
          let seconds = Math.floor(leftTime / _second);
          document.getElementById("leftDay").innerHTML = days;
          document.getElementById("leftHour").innerHTML = hours;
          document.getElementById("leftMinute").innerHTML = minutes;
          document.getElementById("leftSecond").innerHTML = seconds;
          console.log(days + "d" + hours + "h" + minutes + "m" + seconds + "s");
        } else {
          document.getElementById("leftDay").innerHTML = "-";
          document.getElementById("leftHour").innerHTML = "-";
          document.getElementById("leftMinute").innerHTML = "-";
          document.getElementById("leftSecond").innerHTML = "-";
          clearInterval(countDownTimer);
          countDownTimer = undefined;
        }
        console.log(Date.now() - start);
      }, 1000);
    } else {
      if (typeof countDownTimer != undefined) {
        clearInterval(countDownTimer);
        countDownTimer = undefined;
      }
    }
  });
}

async function showSetting() {
  await cleanFrame();
  await cleanRightFrame();
  let tableHead = ["項目", "設定"];
  let settingName = ["選課開始時間"];
  let settingjsonName = ["selectStartDate"];
  let settingType = ["datetime-local"];
  let table = document.createElement("table");
  let actionDiv = document.createElement("div");
  actionDiv.setAttribute("class", "actionDiv");
  let saveDiv = document.createElement("div");
  let saveImg = document.createElement("img");
  table.className = "mtable";
  let setting = {
    selectStartDate: "2022-01-27T10:30",
  };
  let settingPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile("./src/data/setting.json", function (err, settingSaved) {
      if (err) {
        console.log("no setting make new file");
        fs.writeFile(
          "./src/data/setting.json",
          JSON.stringify(setting),
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
      } else {
        console.log("load setting");
        //將二進制數據轉換為字串符
        settingSaved = settingSaved.toString();
        //將字符串轉換為 JSON 對象
        try {
          setting = JSON.parse(settingSaved);
        } catch (error) {}
        console.log(2);
        resolve("success");
      }
    });
  });
  let tableHeader = document.createElement("thead");
  for (let i = 0; i < 2; i++) {
    let th = document.createElement("th"); // TABLE HEADER.
    th.setAttribute("id", "mheader");
    th.innerHTML = tableHead[i];
    tableHeader.appendChild(th);
  }
  table.appendChild(tableHeader);
  settingPromise.then(function (success) {
    for (let i = 0; i < settingName.length; i++) {
      tr = table.insertRow(-1);
      tr.className = "mtr";

      let td = document.createElement("td");
      td.className = "mtd";
      td.innerHTML = settingName[i];
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mtd";
      let input = document.createElement("input");
      input.setAttribute("type", settingType[i]);
      input.className = "preInput userInput";
      input.value = setting[settingjsonName[i]];
      input.id = settingType[i] + i;

      td.appendChild(input);
      tr.appendChild(td);
    }

    saveDiv.setAttribute("class", "save");
    saveImg.setAttribute("class", "icon");
    saveImg.setAttribute("src", "./icon/bx-save-check.svg");
    saveDiv.appendChild(saveImg);
    saveDiv.appendChild(saveImg);
    actionDiv.appendChild(saveDiv);
    main_frame.appendChild(table);
    main_frame.appendChild(actionDiv);

    saveDiv.addEventListener("click", async function () {
      for (let i = 0; i < settingName.length; i++) {
        setting[settingjsonName[i]] = document.getElementById(
          settingType[i] + i
        ).value;
      }
      let savePromise = new Promise(function (resolve, reject) {
        fs.writeFile(
          "./src/data/setting.json",
          JSON.stringify(setting),
          function (err) {
            if (err) {
              console.log(err);
              reject();
            } else {
              resolve();
              console.log("save file complete.");
            }
          }
        );
      });
      savePromise.then(function (success) {
        updateTime();
      });
    });
    let userInput = document.getElementsByClassName("userInput");
    for (let element of userInput) {
      element.addEventListener("click", async function () {
        saveImg.setAttribute("src", "./icon/bx-save.svg");
      });
    }
  });
}

preSelectClass.addEventListener("click", async function () {
  preSelectClassPage();
  showPreSelectClassAtPreSelectPage();
});
fastSelectClass.addEventListener("click", async function () {
  fastSelect();
  showPreSelectClassAtFastSelectPage();
});

window.onload = function () {
  updateTime();
};
controlCenter.addEventListener("click", async function () {
  ipc.send("getControlCenter");
});
classClass.addEventListener("click", async function () {
  ipc.send("getClassClass", SelDepNo, SelClassNo);
  showPreSelectClass();
  console.log("getClassClass");
});
generalClass.addEventListener("click", async function () {
  ipc.send("getGeneralClass");
  showPreSelectClass();
  console.log("getGeneralClass");
});

getMyClass.addEventListener("click", async function () {
  ipc.send("getMyClass");
  console.log("getMyClass");
  //showMyClass();
  /*tableSwitch.addEventListener('click', async function () {
        console.log(tableSwitch.checked);
        myClassTableType = tableSwitch.checked;
        if (myClassTableType == false) {

        } else {

        }
    })*/
});

setting.addEventListener("click", async function () {
  showSetting();
});
ipc.on("readyToShowControlCenter", function (evt, ntpTimeDiff) {
  console.log("showControlCenter");
  showControlCenter(evt, ntpTimeDiff);
});
ipc.on("updateNTP", function (evt, ntpTimeDiff) {
  newNTPTimeDiff = ntpTimeDiff;
});
ipc.on(
  "readyToShowClassClass",
  function (evt, SelDepNo, SelClassNo, classList) {
    console.log("showClassClass");
    showClassClass(SelDepNo, SelClassNo, classList);
  }
);
ipc.on(
  "readyToShowGeneralClass",
  function (evt, SelDepNo, SelClassNo, classList) {
    console.log("showClassClass");
    showGeneralClass();
  }
);
ipc.on("updatePreSelectClass", function (evt) {
  console.log("showPreSelectClass");
  showPreSelectClass();
});
ipc.on("updatePreSelectClassAndMain", function (evt) {
  console.log("showPreSelectClass");
  showClassClass(SelDepNo, SelClassNo, backclassList);
  showPreSelectClass();
});
ipc.on("updatePreSelectClassInPreSelectPage", function (evt) {
  console.log("showPreSelectClass");
  showPreSelectClassAtPreSelectPage();
});
ipc.on("updatePreSelectPage", function (evt) {
  console.log("showPreSelectClass");
  preSelectClassPage();
  showPreSelectClassAtPreSelectPage();
});

ipc.on("updateFastSelectPage", function (evt) {
  console.log("showFastSelectPage");
  fastSelect();
  showPreSelectClassAtFastSelectPage();
});

ipc.on("readyToShow", function (evt, myClass) {
  console.log("show");
  showMyClass();
});

// menu.addEventListener('click', async function () {
//     sidebar.classList.toggle("active");
//     console.log("open");
// })

ipc.on("myClass", function (evt, myClass) {
  console.log(myClass);
  main_frame.innerHTML = myClass;
});

ipc.on("appLocat", function (evt, appLocat) {
  console.log(appLocat);
});
