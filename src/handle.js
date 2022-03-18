const { getElementById } = require("domutils");
const electron = require("electron");
const ipc = electron.ipcRenderer;

/*//const button = document.getElementById('getClass')
//1
const body =document.getElementById("body")
const loginBox = document.getElementById('login_box')
const login = document.getElementById('login')
const wave =document.getElementById("wave")



//button.addEventListener('click',async function(){
//    ipc.send('getClass')
//
//})
login.addEventListener('click',async function(){
    let Id = document.getElementById('id').value;
    let Ps = document.getElementById('ps').value;
    ipc.send('login',{id: Id,ps:Ps});
    console.log({id: Id,ps:Ps});
})

ipc.on('myClass', function (evt, message) {
    console.log(message);
    document.getElementById("classList").innerHTML = message;
});

ipc.on('loginRe', function (evt, resoult) {
    console.log(resoult);
    if(resoult==0){
        loginBox.style.animation = "flyout 1s forwards";
        wave.style.animation = "down 2s forwards";
    }
    //document.getElementById("classList").innerHTML = message;
});
*/

//2
const fs = require("fs");
const { resolve } = require("path");
const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main_frame = document.getElementById("main_frame");
const classClass = document.getElementById("classClass");
const getMyClass = document.getElementById("getMyClass");
const preSelectClass = document.getElementById("preSelectClass");
const setting = document.getElementById("setting");

let myClassTableType = false;
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
async function preSelect() {
  await cleanFrame();
  let preSelectList = {
    isLock: false,
    preSelectBlock: [],
  };
  let tableHead = ["分組", "啟用", "發送時刻(秒)", "酬載1", "酬載2"];
  let tableHead2 = ["分組", "啟用", "發送間隔(秒)", "酬載1", "酬載2"];
  let table = document.createElement("table");
  table.className = "preTable";
  tr = table.insertRow(-1);
  tr.className = "ptr";

  for (let i = 0; i < 5; i++) {
    let th = document.createElement("th"); // TABLE HEADER.
    th.setAttribute("id", "pheader");
    th.innerHTML = tableHead[i];
    tr.appendChild(th);
  }

  let preSelectPromise = new Promise(function (resolve, reject) {
    console.log(1);
    fs.readFile(
      "./src/data/preSelect.json",
      function (err, preSelectListSaved) {
        if (err) {
          console.log("no PRS make new file");
          for (let i = 0; i < 5; i++) {
            let preSelectBlock = {
              id: 0,
              enable: false,
              trigger: 0,
              list: ["", ""],
            };
            preSelectBlock.id = i;
            preSelectList.preSelectBlock.push(preSelectBlock);
          }
          fs.writeFile(
            "./src/data/preSelect.json",
            JSON.stringify(preSelectList),
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
          console.log("load PRS");
          //將二進制數據轉換為字串符
          preSelectListSaved = preSelectListSaved.toString();
          //將字符串轉換為 JSON 對象
          preSelectList = JSON.parse(preSelectListSaved);
          console.log(2);
          resolve("success");
        }
      }
    );
  });

  preSelectPromise.then(function (success) {
    console.log(3);
    console.log(success);
    for (let i = 0; i < 5; i++) {
      if (i == 4) {
        tr = table.insertRow(-1);
        tr.className = "ptr";
        for (let i = 0; i < 5; i++) {
          let th = document.createElement("th"); // TABLE HEADER.
          th.setAttribute("id", "mheader");
          th.innerHTML = tableHead2[i];
          tr.appendChild(th);
        }
      }
      tr = table.insertRow(-1);
      tr.className = "ptr";

      let td = document.createElement("td");
      td.className = "ptd";
      td.innerHTML = i + 1;
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "ptd";
      let checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.className = "preInput";
      checkbox.id = "checkbox" + i;
      if (preSelectList.preSelectBlock[i].enable == true) {
        checkbox.setAttribute("checked", true);
      }
      td.appendChild(checkbox);
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "ptd";
      let timeSelect = document.createElement("input");
      timeSelect.id = "timeSelect" + i;
      timeSelect.setAttribute("type", "number");
      timeSelect.setAttribute("min", -120);
      timeSelect.setAttribute("max", 120);
      timeSelect.setAttribute("step", 0.01);
      timeSelect.setAttribute("value", preSelectList.preSelectBlock[i].trigger);
      timeSelect.className = "preTime  preInput";
      td.appendChild(timeSelect);
      tr.appendChild(td);

      for (let j = 0; j < 2; j++) {
        let td = document.createElement("td");
        td.className = "ptd";
        let textarea = document.createElement("textarea");
        textarea.id = "textarea" + (i * 2 + j);
        textarea.className = "preTextrea  preInput";
        textarea.setAttribute("max-rows", 5);
        textarea.innerHTML = preSelectList.preSelectBlock[i].list[j];
        td.appendChild(textarea);
        tr.appendChild(td);
      }
    }
    let save = document.createElement("button");
    save.setAttribute("type", "button");
    save.className = "saveBTN";

    console.log(preSelectList.isLock);

    main_frame.appendChild(table);
    main_frame.appendChild(save);

    document.getElementById("textarea9").style.visibility = "hidden";

    let preInput = document.querySelectorAll(".preInput");
    console.log(preInput);
    if (preSelectList.isLock == false) {
      save.innerHTML = "保存並鎖定";
      for (var i = 0; i < preInput.length; i++) {
        preInput[i].disabled = false;
      }
      for (let i = 0; i < 5; i++) {
        document.getElementById("textarea" + i * 2).className = "preTextrea";
        document.getElementById("textarea" + (i * 2 + 1)).className =
          "preTextrea";
      }
    } else {
      save.innerHTML = "解除鎖定";
      for (var i = 0; i < preInput.length; i++) {
        preInput[i].disabled = true;
      }
      for (let i = 0; i < 5; i++) {
        document.getElementById("textarea" + i * 2).className =
          "preTextreaDark";
        document.getElementById("textarea" + (i * 2 + 1)).className =
          "preTextreaDark";
      }
    }

    save.addEventListener("click", async function () {
      if (preSelectList.isLock == false) {
        save.innerHTML = "解除鎖定";
        preSelectList.isLock = true;
        for (var i = 0; i < preInput.length; i++) {
          preInput[i].disabled = true;
        }
        for (let i = 0; i < 5; i++) {
          preSelectList.preSelectBlock[i].enable = document.getElementById(
            "checkbox" + i
          ).checked;
          preSelectList.preSelectBlock[i].trigger = document.getElementById(
            "timeSelect" + i
          ).value;
          preSelectList.preSelectBlock[i].list[0] = document.getElementById(
            "textarea" + i * 2
          ).value;
          document.getElementById("textarea" + i * 2).className =
            "preTextreaDark";
          preSelectList.preSelectBlock[i].list[1] = document.getElementById(
            "textarea" + (i * 2 + 1)
          ).value;
          document.getElementById("textarea" + (i * 2 + 1)).className =
            "preTextreaDark";
        }
        fs.writeFile(
          "./src/data/preSelect.json",
          JSON.stringify(preSelectList),
          function (err) {
            if (err) console.log(err);
            else {
              ipc.send("updatePreSelect", {
                engage: true,
              });
              console.log("save file complete.");
            }
          }
        );
      } else {
        save.innerHTML = "保存並鎖定";
        preSelectList.isLock = false;
        ipc.send("updatePreSelect", {
          engage: false,
        });
        for (var i = 0; i < preInput.length; i++) {
          preInput[i].disabled = false;
        }
        for (let i = 0; i < 5; i++) {
          document.getElementById("textarea" + i * 2).className = "preTextrea";
          document.getElementById("textarea" + (i * 2 + 1)).className =
            "preTextrea";
        }
        fs.writeFile(
          "./src/data/preSelect.json",
          JSON.stringify(preSelectList),
          function (err) {
            if (err) console.log(err);
            else {
              console.log("save file complete.");
            }
          }
        );
      }
    });
  });
}

let SelDepNo = 0;
let SelClassNo = "UI3B";
async function showClassClass(SelectedDepNo, SelectedClassNo, classList) {
  await cleanFrame();
  SelDepNo = SelectedDepNo;
  SelClassNo = SelectedClassNo;
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

  fs.readFile("./src/data/ClassClass.json", function (err, myClass) {
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
        let selectThisClass = document.createElement("img");
        let preSelectThisClass = document.createElement("img");
        let selectThisClassDiv = document.createElement("div");
        let preSelectThisClassDiv = document.createElement("div");
        let classActionBox = document.createElement("div");
        selectThisClassDiv.setAttribute("class", "classActionDiv");
        if (element[tableKey[0] == 1]) {
          selectThisClass.setAttribute(
            "src",
            "./icon/add_circle_outline_white_24dp.svg"
          );
        } else if (element[tableKey[0] == 2]) {
          selectThisClass.setAttribute("src", "./icon/cancel_white_24dp.svg");
        } else {
          selectThisClassDiv.setAttribute("class", "classNoActionDiv");
          selectThisClass.setAttribute(
            "src",
            "./icon/selectThisClassEmpty.svg"
          );
        }
        preSelectThisClass.setAttribute(
          "src",
          "./icon/add_shopping_cart_white_24dp.svg"
        );
        selectThisClass.setAttribute("class", "classAction");
        preSelectThisClass.setAttribute("class", "classAction");
        selectThisClassDiv.appendChild(selectThisClass);
        preSelectThisClassDiv.appendChild(preSelectThisClass);
        preSelectThisClassDiv.setAttribute("class", "classActionDiv");
        classActionBox.appendChild(selectThisClassDiv);
        classActionBox.appendChild(preSelectThisClassDiv);
        classActionBox.setAttribute("class", "classActionBox");
        td.appendChild(classActionBox);
        td.className = "mtd";
        tr.appendChild(td);
        for (let tabletd = 1; tabletd < tableKey.length; tabletd++) {
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
          trSet[seg][day].innerHTML += element["name"] + "<br>";
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

    toolBar.setAttribute("class", "classClassToolBar");
    toolBar.appendChild(viewTypeDiv);
    main_frame.appendChild(table);
    let placeHolder = document.createElement("div");
    placeHolder.setAttribute("class", "placeHolder");
    main_frame.appendChild(placeHolder);

    let depButtonBox = document.createElement("div");
    depButtonBox.setAttribute("class", "depButtonBox");
    let depButtonArray = [];
    for (let element of dep) {
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
      if (showMyClassType == 0) {
        showMyClassType = 1;
        viewTypeImg.setAttribute("src", "./icon/view_list_white_24dp.svg");
      } else {
        showMyClassType = 0;
        viewTypeImg.setAttribute("src", "./icon/view_module_white_24dp.svg");
      }
      showClassClass(SelectedDepNo, SelectedClassNo, classList);
    });
  });
}
let showMyClassType = 0;
async function showMyClass() {
  await cleanFrame();
  let table = document.createElement("table");
  let tHead = document.createElement("thead");
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
        for (let key of tableKey) {
          let td = document.createElement("td");
          td.className = "mtd";
          td.innerHTML = element[key];
          console.log(element[key]);
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

    main_frame.appendChild(table);
    main_frame.appendChild(viewTypeDiv);
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
    let sDay = Date.parse(setting["選課開始時間"]);
    if (sDay > Date.now()) {
      if (typeof countDownTimer != undefined) {
        clearInterval(countDownTimer);
      }
      countDownTimer = setInterval(function () {
        let leftDay;
        let leftHour;
        let leftMinute;
        let leftSecond;
        let leftTime = sDay - Date.now();
        if (leftTime > 0) {
          leftDay = Math.floor(leftTime / (24 * 3600 * 1000));
          leftTime -= leftDay * (24 * 3600 * 1000);
          leftHour = Math.floor(leftTime / (3600 * 1000));
          leftTime -= leftHour * (3600 * 1000);
          leftMinute = Math.floor(leftTime / (60 * 1000));
          leftTime -= leftMinute * (60 * 1000);
          leftSecond = Math.floor(leftTime / 1000);
          document.getElementById("leftDay").innerHTML = leftDay;
          document.getElementById("leftHour").innerHTML = leftHour;
          document.getElementById("leftMinute").innerHTML = leftMinute;
          document.getElementById("leftSecond").innerHTML = leftSecond;
        } else {
          document.getElementById("leftDay").innerHTML = "-";
          document.getElementById("leftHour").innerHTML = "-";
          document.getElementById("leftMinute").innerHTML = "-";
          document.getElementById("leftSecond").innerHTML = "-";
          clearInterval(countDownTimer);
          countDownTimer = undefined;
        }
        console.log(
          leftDay + "d" + leftHour + "h" + leftMinute + "m" + leftSecond + "s"
        );
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
  let tableHead = ["項目", "設定"];
  let settingName = ["選課開始時間"];
  let settingType = ["datetime-local"];
  let table = document.createElement("table");
  table.className = "sTable";
  tr = table.insertRow(-1);
  tr.className = "str";
  let setting = {
    選課開始時間: "2022-01-27T10:30",
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

  for (let i = 0; i < 2; i++) {
    let th = document.createElement("th"); // TABLE HEADER.
    th.setAttribute("id", "mheader");
    th.innerHTML = tableHead[i];
    tr.appendChild(th);
  }
  settingPromise.then(function (success) {
    for (let i = 0; i < settingName.length; i++) {
      tr = table.insertRow(-1);
      tr.className = "ptr";

      let td = document.createElement("td");
      td.className = "ptd";
      td.innerHTML = settingName[i];
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "ptd";
      let input = document.createElement("input");
      input.setAttribute("type", settingType[i]);
      input.className = "preInput";
      input.value = setting[settingName[i]];
      input.id = settingType[i] + i;

      td.appendChild(input);
      tr.appendChild(td);
    }

    let save = document.createElement("button");
    save.setAttribute("type", "button");
    save.className = "saveBTN";
    save.innerHTML = "保存";

    main_frame.appendChild(table);
    main_frame.appendChild(save);

    save.addEventListener("click", async function () {
      for (let i = 0; i < settingName.length; i++) {
        setting[settingName[i]] = document.getElementById(
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
  });
}

preSelectClass.addEventListener("click", async function () {
  preSelect();
});

window.onload = function () {
  updateTime();
};

classClass.addEventListener("click", async function () {
  ipc.send("getClassClass", SelDepNo, SelClassNo);
  console.log("getClassClass");
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

ipc.on(
  "readyToShowClassClass",
  function (evt, SelDepNo, SelClassNo, classList) {
    console.log("showClassClass");
    showClassClass(SelDepNo, SelClassNo, classList);
  }
);

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
