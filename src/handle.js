const console = require("console");
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

window.addEventListener(
  "load",
  function () {
    ipc.send("getControlCenter");
    ipc.send("getUserData");
  },
  false
);

let userName = "";
let userClassAndNo = "";

let _second = 1000;
let _minute = _second * 60;
let _hour = _minute * 60;
let _day = _hour * 24;

let myClassTableType = false;

let isInPreSelectPage = false;

let titleCountDownTimer;
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
let activate = false;
async function showControlCenter(evt, ntpTimeDiff) {
  await cleanFrame();
  await cleanRightFrame();
  titleCountDown.innerHTML = "";
  newNTPTimeDiff = ntpTimeDiff;
  let setting = {
    selectStartDate: "2022-01-27T10:30",
    activate: false,
    key: "",
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
    activate = settingSaved["activate"];
    timeCenterHTMLData = `<div class="timeDivBox">
  <div class="timeBoxLeft">
    <div class="timeBox">
      <div class="timeName">本機時間 :</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">年</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">月</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">日</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">時</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">分</div>
      <div class="timeNum localTime">-</div>
      <div class="timeSeg">秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">NTP時間 :</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">年</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">月</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">日</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">時</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">分</div>
      <div class="timeNum NTPTime">-</div>
      <div class="timeSeg">秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">時間誤差 :</div>
      <div class="timeNum timeDiff timeNumLong">-</div>
      <div class="timeSeg">毫秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">選課時間 :</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">年</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">月</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">日</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">時</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">分</div>
      <div class="timeNum selTime">-</div>
      <div class="timeSeg">秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">執行倒數 :</div>
      <div class="timeNum countDownTime">-</div>
      <div class="timeSeg">日</div>
      <div class="timeNum countDownTime">-</div>
      <div class="timeSeg">小時</div>
      <div class="timeNum countDownTime">-</div>
      <div class="timeSeg">分鐘</div>
      <div class="timeNum countDownTime">-</div>
      <div class="timeSeg">秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">運算延遲 :</div>
      <div class="timeNum systemDelay">-</div>
      <div class="timeSeg">毫秒</div>
    </div>
    <div class="timeBox">
      <div class="timeName">授權金鑰 :</div>
      <div class="authKeyState" id="authKeyState"></div>
      <div class="authKeyState" id="authKeyDate"></div>
    </div>
  </div>
</div>`;
    let controlPanel = document.createElement("div");
    controlPanel.setAttribute("class", "controlPanel");
    let controlPanelRight = document.createElement("div");
    controlPanelRight.setAttribute("class", "controlPanel");
    let timeDivBox = document.createElement("div");
    timeDivBox.setAttribute("class", "timeDivBox");

    timeDivBox.innerHTML = timeCenterHTMLData;

    //let lowerPanelBox = document.createElement("div");
    //lowerPanelBox.setAttribute("class", "lowerPanelBox");

    let flowChartBox = document.createElement("div");
    flowChartBox.setAttribute("class", "flowChartBox");

    let InternetBox = document.createElement("div");
    InternetBox.setAttribute("class", "InternetBox");
    InternetBox.setAttribute("id", "InternetBox");
    InternetBox.innerHTML = `<div class="InternetStatusDivBox">
    <div class="InternetStatusTitleText">網路狀態:</div>
    <div class="InternetStatusBox">
      <div class="InternetStatusFromNameValue">
        <div class="InternetStatusFromName">Google</div>
        <div class="InternetStatusFromValue">0ms</div>
      </div>
      <div class="InternetStatusDiv">
        <div class="InternetStatus">
          <div class="statusName">開啟端口:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #f3afcc"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">DNS解析:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #9f6baa"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">TCP連線:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #ad5526"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">TLS交握:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #ad5526"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">等待:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #3c8ab2"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">接收:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #5d9847"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="InternetStatusBox">
      <div class="InternetStatusFromNameValue">
        <div class="InternetStatusFromName">TTU</div>
        <div class="InternetStatusFromValue">0ms</div>
      </div>
      <div class="InternetStatusDiv">
        <div class="InternetStatus">
          <div class="statusName">開啟端口:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #f3afcc"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">DNS解析:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #9f6baa"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">TCP連線:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #ad5526"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">TLS交握:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #ad5526"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">等待:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #3c8ab2"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
        <div class="InternetStatus">
          <div class="statusName">接收:</div>
          <div class="statusBarBox">
            <div
              class="statusBar"
              style="background-color: #5d9847"
            ></div>
            <div class="statusNumber"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

    let launchBox = document.createElement("div");
    launchBox.setAttribute("class", "launchBox");
    let launchActionTextBox = document.createElement("div");
    launchActionTextBox.setAttribute("class", "launchActionTextBox");
    let launchActionBox = document.createElement("div");
    launchActionBox.setAttribute("class", "launchActionBox");

    let systemStatusText0 = document.createElement("div");
    systemStatusText0.setAttribute("class", "systemStatusText");
    systemStatusText0.innerText = "系統狀態:";
    systemStatusText0.style.paddingRight = "10px";
    let systemStatusText1 = document.createElement("div");
    systemStatusText1.setAttribute("class", "systemStatusText");
    launchActionTextBox.appendChild(systemStatusText0);
    launchActionTextBox.appendChild(systemStatusText1);

    let startBtm = document.createElement("div");
    startBtm.setAttribute("class", "button");
    startBtm.setAttribute("id", "startBtm");
    let startBtmText = document.createElement("a");
    startBtmText.innerText = "運行";
    startBtm.appendChild(startBtmText);

    let stopBtm = document.createElement("div");
    stopBtm.setAttribute("class", "button");
    stopBtm.setAttribute("id", "stopBtm");
    let stopBtmText = document.createElement("a");
    stopBtmText.innerText = "中止";
    stopBtm.appendChild(stopBtmText);

    if (settingSaved["activate"] == true) {
      startBtmText.setAttribute("class", "startDown");
      stopBtmText.setAttribute("class", "stopUp");
      systemStatusText1.innerText = "運行中";
      systemStatusText1.style.color = "#62ff00";
    } else {
      startBtmText.setAttribute("class", "startUp");
      stopBtmText.setAttribute("class", "stopDown");
      systemStatusText1.innerText = "待命中";
      systemStatusText1.style.color = "#ed143d";
    }
    launchActionBox.appendChild(startBtm);
    launchActionBox.appendChild(stopBtm);
    launchBox.appendChild(launchActionTextBox);
    launchBox.appendChild(launchActionBox);
    controlPanelRight.appendChild(InternetBox);
    controlPanelRight.appendChild(launchBox);
    flowChartBox.innerHTML = `<div class="flowStepBox preLoadBox">
              <div class="flowIconBox" id="preLoadIconBox">
                <div class="iconBox">
                  <img src="./icon/archive.svg" class="icon" />
                </div>
                <div class="stepLinkBox">
                  <div class="stepLinkLineBox">
                    <div class="stepLinkLine" id="progLine"></div>
                  </div>
                </div>
              </div>
              <div class="flowStepInfoBox">
                <div class="stepName">預載模組</div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" id="preLoadIcon" />
                  </div>
                  <div class="info" id="preLoadText">未預載</div>
                </div>
              </div>
            </div>
            <div class="flowStepBox fastSelectBox">
              <div class="flowIconBox" id="fastSelectIconBox">
                <div class="iconBox">
                  <img src="./icon/flash_on.svg" class="icon" />
                </div>
              </div>
              <div class="flowStepInfoBox">
                <div class="stepName">快速選課模組</div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" class="icon fastSelectIcon" />
                  </div>
                  <div class="info">1區</div>
                  <div class="info classCount0">未啟用</div>
                  <div class="info infoSmall classUnit0"></div>
                  <div class="info infoSmall classCount1"></div>
                  <div class="info infoSmall classUnit1"></div>
                  <div class="info infoSmall classCount2"></div>
                  <div class="info infoSmall classUnit2"></div>
                  <div class="info infoSmall classCount3"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" class="icon fastSelectIcon" />
                  </div>
                  <div class="info">2區</div>
                  <div class="info classCount0">未啟用</div>
                  <div class="info infoSmall classUnit0"></div>
                  <div class="info infoSmall classCount1"></div>
                  <div class="info infoSmall classUnit1"></div>
                  <div class="info infoSmall classCount2"></div>
                  <div class="info infoSmall classUnit2"></div>
                  <div class="info infoSmall classCount3"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" class="icon fastSelectIcon" />
                  </div>
                  <div class="info">3區</div>
                  <div class="info classCount0">未啟用</div>
                  <div class="info infoSmall classUnit0"></div>
                  <div class="info infoSmall classCount1"></div>
                  <div class="info infoSmall classUnit1"></div>
                  <div class="info infoSmall classCount2"></div>
                  <div class="info infoSmall classUnit2"></div>
                  <div class="info infoSmall classCount3"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" class="icon fastSelectIcon" />
                  </div>
                  <div class="info">4區</div>
                  <div class="info classCount0">未啟用</div>
                  <div class="info infoSmall classUnit0"></div>
                  <div class="info infoSmall classCount1"></div>
                  <div class="info infoSmall classUnit1"></div>
                  <div class="info infoSmall classCount2"></div>
                  <div class="info infoSmall classUnit2"></div>
                  <div class="info infoSmall classCount3"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/bx-x.svg" class="icon fastSelectIcon" />
                  </div>
                  <div class="info">5區</div>
                  <div class="info classCount0">未啟用</div>
                  <div class="info infoSmall classUnit0"></div>
                  <div class="info infoSmall classCount1"></div>
                  <div class="info infoSmall classUnit1"></div>
                  <div class="info infoSmall classCount2"></div>
                  <div class="info infoSmall classUnit2"></div>
                  <div class="info infoSmall classCount3"></div>
                </div>
              </div>
            </div>
            <div class="flowStepBox preSelectBox">
              <div class="flowIconBox" id="preSelectIconBox">
                <div class="iconBox">
                  <img src="./icon/manage_search.svg" class="icon" />
                </div>
              </div>
              <div class="flowStepInfoBox">
                <div class="stepName">觀測選課模組</div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/power_settings.svg" class="icon preSelectIcon" />
                  </div>
                  <div class="info preSelectText">已啟用</div>
                  <div class="info preSelectText1"></div>
                  <div class="info preSelectText2"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/playlist_add.svg" class="icon preSelectIcon" />
                  </div>
                  <div class="info preSelectText"></div>
                  <div class="info preSelectText1"></div>
                  <div class="info preSelectText2"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/playlist_remove_24dp.svg" class="icon preSelectIcon" />
                  </div>
                  <div class="info preSelectText"></div>
                  <div class="info preSelectText1"></div>
                  <div class="info preSelectText2"></div>
                </div>
                <div class="stepInfo">
                  <div class="infoIconBox">
                    <img src="./icon/playlist_remove_24dp.svg" class="icon preSelectIcon" />
                  </div>
                  <div class="info preSelectText"></div>
                  <div class="info preSelectText1"></div>
                  <div class="info preSelectText2"></div>
                </div>
              </div>
            </div>`;
    controlPanel.appendChild(timeDivBox);
    controlPanel.appendChild(flowChartBox);
    //lowerPanelBox.appendChild(flowChartBox);
    //lowerPanelBox.appendChild(launchBox);
    //controlPanel.appendChild(lowerPanelBox);

    main_frame.appendChild(controlPanel);
    right_frame.appendChild(controlPanelRight);
    ipc.send("getNowState");
    ipc.send("getGoogleInternetStatus");
    ipc.send("getTTUInternetStatus");
    document
      .getElementById("startBtm")
      .addEventListener("click", async function () {
        if (activate == false) {
          settingSaved["activate"] = true;
          activate = true;
          let savePromise = new Promise(function (resolve, reject) {
            fs.writeFile(
              "./src/data/setting.json",
              JSON.stringify(settingSaved),
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
            startBtmText.setAttribute("class", "startDown");
            stopBtmText.setAttribute("class", "stopUp");
            systemStatusText1.innerText = "運行中";
            systemStatusText1.style.color = "#62ff00";
          });
          ipc.send("startSequence");
        }
      });

    document
      .getElementById("stopBtm")
      .addEventListener("click", async function () {
        if (activate == true) {
          settingSaved["activate"] = false;
          activate = false;
          let savePromise = new Promise(function (resolve, reject) {
            fs.writeFile(
              "./src/data/setting.json",
              JSON.stringify(settingSaved),
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
            startBtmText.setAttribute("class", "startUp");
            stopBtmText.setAttribute("class", "stopDown");
            systemStatusText1.innerText = "待命中";
            systemStatusText1.style.color = "#ed143d";
          });
          ipc.send("stopSequence");
          ipc.send("preSelectPagePlay", 0);
        }
      });

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
    clearInterval(countDownTimer);
    clearInterval(titleCountDownTimer);
    let flash = 0;

    function countDownF() {
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
        //console.log(days + "d" + hours + "h" + minutes + "m" + seconds + "s");
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
      timeNumList[2][0].innerText = (ntpTimeDiff * -1).toFixed(2);
      timeNumList[5][0].innerText = Date.now() - calculateStart;
    }
    countDownF();
    countDownTimer = setInterval(function () {
      countDownF();
    }, 1000);
  });
}
async function updateControlCenterState(stateData) {
  const fastSelectStateIcon = [
    "./icon/power_settings.svg",
    "./icon/work_history.svg",
    "./icon/bx-loader-circle.svg",
    "./icon/mark_email_read.svg",
    "./icon/cancel_schedule_send.svg",
  ];
  const fastSelectStateText = [
    "已啟用",
    "已排程",
    "已送出",
    "已回應",
    "無回應",
  ];
  if (document.getElementsByClassName("flowChartBox").length == 1) {
    let preLoadIcon = document.getElementById("preLoadIcon");
    let preLoadText = document.getElementById("preLoadText");
    let preLoadIconBox = document.getElementById("preLoadIconBox");
    let progLine = document.getElementById("progLine");
    progLine.style.width = stateData.barPo + "%";
    if (stateData.preload == 0) {
      preLoadIconBox.classList.remove("iconActiveBox");
      preLoadIcon.setAttribute("src", "./icon/bx-x.svg");
      preLoadText.innerText = "未預載";
    } else if (stateData.preload == 1) {
      preLoadIcon.setAttribute("src", "./icon/work_history.svg");
      preLoadText.innerText = "已排程";
      preLoadIconBox.classList.remove("iconActiveBox");
    } else if (stateData.preload == 2) {
      preLoadIcon.setAttribute("src", "./icon/bx-check.svg");
      preLoadText.innerText = "已預載";
      preLoadIconBox.classList.add("iconActiveBox");
    } else {
      preLoadIconBox.classList.add("iconActiveBox");
    }

    let authKeyState = document.getElementById("authKeyState");
    let authKeyDate = document.getElementById("authKeyDate");
    if (stateData["authKeyState"] == 4) {
      authKeyState.innerText = "已授權";
      authKeyDate.innerText = stateData["authKeyDate"] + "前 有效";
      authKeyState.style.color = "#62ff00";
    } else if (stateData["authKeyState"] == 3) {
      authKeyState.innerText = "驗證失敗";
      authKeyDate.innerText = "被授權人與目前登入不符";
      authKeyState.style.color = "#ed143d";
    } else if (stateData["authKeyState"] == 2) {
      authKeyState.innerText = "金鑰過期";
      authKeyDate.innerText = stateData["authKeyDate"] + "前 有效";
      authKeyState.style.color = "#ed143d";
    } else if (stateData["authKeyState"] == 1) {
      authKeyState.innerText = "驗證失敗";
      authKeyDate.innerText = "本機與網路時間誤差過大";
      authKeyState.style.color = "#ed143d";
    } else if (stateData["authKeyState"] == 0) {
      authKeyState.innerText = "驗證失敗";
      authKeyDate.innerText = "金鑰錯誤";
      authKeyState.style.color = "#ed143d";
    } else if (stateData["authKeyState"] == -1) {
      authKeyState.innerText = "無法驗證";
      authKeyDate.innerText = "請檢查網路連線";
      authKeyState.style.color = "#ed143d";
    }

    let fastSelectList;
    let fastSelectPromise = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/fastSelect.json",
        function (err, fastSelectListSaved) {
          if (err) {
            reject(err);
          } else {
            console.log("load FSS");
            //將二進制數據轉換為字串符
            fastSelectListSaved = fastSelectListSaved.toString();
            //將字符串轉換為 JSON 對象
            fastSelectList = JSON.parse(fastSelectListSaved);
            resolve(true);
          }
        }
      );
    });

    fastSelectPromise
      .then(function (haveFile) {
        let fastSelectIconBox = document.getElementById("fastSelectIconBox");
        let fastSelectIcons = document.getElementsByClassName("fastSelectIcon");
        let fastSelectCount0 = document.getElementsByClassName("classCount0");
        let fastSelectCount1 = document.getElementsByClassName("classCount1");
        let fastSelectCount2 = document.getElementsByClassName("classCount2");
        let fastSelectCount3 = document.getElementsByClassName("classCount3");
        let classUnit0 = document.getElementsByClassName("classUnit0");
        let classUnit1 = document.getElementsByClassName("classUnit1");
        let classUnit2 = document.getElementsByClassName("classUnit2");
        if (stateData.isFastSelectFinish) {
          fastSelectIconBox.classList.add("iconActiveBox");
        } else {
          fastSelectIconBox.classList.remove("iconActiveBox");
        }
        for (let i = 0; i < 5; i++) {
          fastSelectCount0[i].innerText = "";
          fastSelectCount1[i].innerText = "";
          fastSelectCount2[i].innerText = "";
          fastSelectCount3[i].innerText = "";
          classUnit0[i].innerText = "";
          classUnit1[i].innerText = "";
          classUnit2[i].innerText = "";
          let allPKG = Math.ceil(
            fastSelectList["fastSelectBlock"][i]["list"].length / 5
          );
          if (fastSelectList["fastSelectBlock"][i]["enable"] == true) {
            fastSelectIcons[i].setAttribute(
              "src",
              fastSelectStateIcon[stateData.fastSelect[i][0]]
            );
            fastSelectCount0[i].innerText =
              fastSelectStateText[stateData.fastSelect[i][0]];
            fastSelectIcons[i].classList.remove("loadingIcon");
            if (stateData.fastSelect[i][0] < 2) {
              classUnit0[i].innerText = "共";
              fastSelectCount1[i].innerText = allPKG;
              classUnit1[i].innerText = "組";
            } else if (stateData.fastSelect[i][0] == 2) {
              if (i == 4) {
                fastSelectIcons[i].classList.add("loadingIcon");
                fastSelectCount0[i].innerText = "執行中";
                classUnit0[i].innerText = "送出";
                fastSelectCount1[i].innerText = stateData.fastSelect[i][2];
                classUnit1[i].innerText = "次";
              } else {
                if (
                  allPKG ==
                  stateData.fastSelect[i][1] + stateData.fastSelect[i][2]
                ) {
                  if (stateData.fastSelect[i][2] == 0) {
                    fastSelectIcons[i].setAttribute(
                      "src",
                      "./icon/mark_email_read.svg"
                    );
                  } else {
                    fastSelectIcons[i].setAttribute(
                      "src",
                      "./icon/cancel_schedule_send.svg"
                    );
                  }
                  fastSelectCount0[i].innerText = "完成";
                  classUnit0[i].innerText = stateData.fastSelect[i][1];
                  fastSelectCount1[i].innerText = "成功";
                  classUnit1[i].innerText = stateData.fastSelect[i][2];
                  fastSelectCount2[i].innerText = "逾時";
                } else {
                  fastSelectIcons[i].classList.add("loadingIcon");
                  classUnit0[i].innerText = stateData.fastSelect[i][1];
                  fastSelectCount1[i].innerText = "成功";
                  classUnit1[i].innerText =
                    allPKG -
                    stateData.fastSelect[i][1] -
                    stateData.fastSelect[i][2];
                  fastSelectCount2[i].innerText = "等待";
                  classUnit2[i].innerText = stateData.fastSelect[i][2];
                  fastSelectCount3[i].innerText = "逾時";
                }
              }
            } else if (stateData.fastSelect[i][0] == 3) {
              classUnit0[i].innerText = "在第";
              fastSelectCount1[i].innerText = stateData.fastSelect[i][1];
              classUnit1[i].innerText = "次";
              fastSelectCount2[i].innerText = "共";
              classUnit2[i].innerText = stateData.fastSelect[i][2];
              fastSelectCount3[i].innerText = "次";
            } else {
              classUnit0[i].innerText = "超過50次上限";
            }
          } else {
            fastSelectIcons[i].setAttribute("src", "./icon/bx-x.svg");
            fastSelectCount0[i].innerText = "未啟用";
            fastSelectCount1[i].innerText = "";
            fastSelectCount2[i].innerText = "";
            fastSelectCount3[i].innerText = "";
            classUnit0[i].innerText = "";
            classUnit1[i].innerText = "";
            classUnit2[i].innerText = "";
          }
        }
      })
      .catch(function (err) {
        console.log(err);
      });
    let preSelectIcon = document.getElementsByClassName("preSelectIcon");
    let preSelectIconBox = document.getElementById("preSelectIconBox");
    let preSelectText = document.getElementsByClassName("preSelectText");
    let preSelectText1 = document.getElementsByClassName("preSelectText1");
    let preSelectText2 = document.getElementsByClassName("preSelectText2");
    let preSelectPromise = new Promise(function (resolve, reject) {
      fs.readFile(
        "./src/data/PreSelectPageSetting.json",
        function (err, preSelectPageSettingSaved) {
          if (err) {
            reject(err);
          } else {
            console.log("load FSS");
            //將二進制數據轉換為字串符
            preSelectPageSettingSaved = preSelectPageSettingSaved.toString();

            resolve(preSelectPageSettingSaved);
          }
        }
      );
    });
    preSelectPromise.then(function (preSelectPageSettingSaved) {
      //將字符串轉換為 JSON 對象
      preSelectPageSettingSaved = JSON.parse(preSelectPageSettingSaved);
      for (let i = 0; i < preSelectIcon.length; i++) {
        preSelectIcon[i].setAttribute("src", "");
        preSelectIcon[i].classList.remove("loadingIcon");
        preSelectText[i].innerText = "";
        preSelectText1[i].innerText = "";
        preSelectText2[i].innerText = "";
      }
      if (preSelectPageSettingSaved["isSet"]) {
        preSelectIconBox.classList.remove("iconActiveBox");
        if (stateData.preSelect[0] == 2) {
          preSelectIcon[0].setAttribute("src", "./icon/bx-loader-circle.svg");
          preSelectText[0].innerText = "等待執行";
          preSelectIcon[0].classList.add("loadingIcon");
        } else if (stateData.preSelect[0] == 3) {
          preSelectIcon[0].setAttribute("src", "./icon/autorenew.svg");
          preSelectText[0].innerText = "執行中";
          preSelectText1[0].innerText = stateData.preSelect[1];
          preSelectText2[0].innerText = "次";
          preSelectIcon[0].classList.add("loadingIcon");

          preSelectIcon[1].setAttribute("src", "./icon/playlist_add.svg");
          preSelectText[1].innerText = "已加選";
          preSelectText1[1].innerText = stateData.preSelect[2];
          preSelectText2[1].innerText = "堂";

          preSelectIcon[2].setAttribute(
            "src",
            "./icon/playlist_remove_24dp.svg"
          );
          preSelectText[2].innerText = "已退選";
          preSelectText1[2].innerText = stateData.preSelect[3];
          preSelectText2[2].innerText = "堂";

          preSelectIcon[3].setAttribute("src", "./icon/report.svg");
          preSelectText[3].innerText = "錯失/誤判";
          preSelectText1[3].innerText = stateData.preSelect[4];
          preSelectText2[3].innerText = "次";
        } else {
          preSelectIcon[0].setAttribute("src", "./icon/bx-check.svg");
          preSelectText[0].innerText = "已啟用";
        }
      } else {
        if (stateData.barPo == 100) {
          preSelectIconBox.classList.add("iconActiveBox");
        } else {
          preSelectIconBox.classList.remove("iconActiveBox");
        }
        preSelectIcon[0].setAttribute("src", "./icon/bx-x.svg");
        preSelectText[0].innerText = "未啟用";
      }
    });

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
    settingPromise.then(function (settingData) {
      settingSaved = JSON.parse(settingData);
      let systemStatusText1 =
        document.getElementsByClassName("systemStatusText");
      let startBtmText = document.getElementById("startBtm").firstChild;
      let stopBtmText = document.getElementById("stopBtm").firstChild;
      if (settingSaved["activate"] == true) {
        activate = true;
        startBtmText.setAttribute("class", "startDown");
        stopBtmText.setAttribute("class", "stopUp");
        systemStatusText1[1].innerText = "運行中";
        systemStatusText1[1].style.color = "#62ff00";
      } else {
        activate = false;
        startBtmText.setAttribute("class", "startUp");
        stopBtmText.setAttribute("class", "stopDown");
        systemStatusText1[1].innerText = "待命中";
        systemStatusText1[1].style.color = "#ed143d";
      }
    });
  }
}
async function updateInternetStatus(host, data) {
  if (document.getElementById("InternetBox") != null) {
    console.log(data);
    let typeList = [];
    let hostValue = document.getElementsByClassName("InternetStatusFromValue");
    let statusNumber = document.getElementsByClassName("statusNumber");
    let statusBar = document.getElementsByClassName("statusBar");
    let status = [
      Math.floor(data.durations.socketOpen),
      Math.floor(data.durations.dnsLookup),
      Math.floor(data.durations.tcpConnection),
      Math.floor(data.durations.tlsHandshake),
      Math.floor(data.durations.firstByte),
      Math.floor(data.durations.contentTransfer),
    ];
    let total = 0;
    for (let i = 0; i < status.length; i++) {
      total += status[i];
    }
    hostValue[host].innerText =
      status[0] + status[1] + status[2] + status[3] + "ms";
    let i = host * 6;
    // Addlet space = 0;
    for (let i = host * 6, j = 0; i < host * 6 + 6; i++, j++) {
      //statusBar[i].style.marginLeft = space + "%";
      statusBar[i].style.width = (status[j] / total) * 80 + "%";
      statusNumber[i].innerText = status[j] + "ms";
      //space += (status[j] / total) * 80;
    }
  }
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
            flexTableHead.setAttribute("class", "fheader fheaderButton");
          } else if (j == 2) {
            flexTableHead.setAttribute("class", "fheader fheaderTime");
          } else {
            flexTableHead.setAttribute("class", "fheader fheaderClass");
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
        showPreSelectClassAtPreSelectPage();
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
              if (areaSettingJson["isSet"]) preSelectClassPageReady = true;
              else preSelectClassPageReady = false;
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
      actionDiv.appendChild(viewTypeDiv);
      saveDiv.appendChild(saveImg);
      actionDiv.appendChild(saveDiv);
      readyDiv.appendChild(readyImg);
      actionDiv.appendChild(readyDiv);
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
          ipc.send("stopPreSelectPageTimer");
        } else {
          console.log("ready");
          preSelectClassPageReady = true;
          areaSettingJson["isSet"] = true;
          readyImg.setAttribute("src", "./icon/playlist_add_check_24dp.svg");
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
  let titleCountDownString;
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
    titleCountDown.innerHTML = `<li>
    <div class="titleCountDownIcon">
      <img class="icon" src="./icon/hourglass-regular.svg" />
    </div>
  </li>
  <li><a id="leftDay">-</a></li>
  <li><a>日</a></li>
  <li><a id="leftHour">-</a></li>
  <li><a>時</a></li>
  <li><a id="leftMinute">-</a></li>
  <li><a>分</a></li>
  <li><a id="leftSecond">-</a></li>
  <li><a>秒</a></li>
  `;
    clearInterval(countDownTimer);
    clearInterval(titleCountDownTimer);
    let sDay = Date.parse(setting["selectStartDate"]);
    if (sDay > Date.now()) {
      function titleCountDownF() {
        let start = Date.now();
        let leftTime = sDay - Date.now();
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
        //console.log(days + "d" + hours + "h" + minutes + "m" + seconds + "s");
      }
      titleCountDownF();
      titleCountDownTimer = setInterval(function () {
        titleCountDownF();
      }, 1000);
    } else {
      clearInterval(titleCountDownTimer);
      clearInterval(countDownTimer);
      document.getElementById("leftDay").innerHTML = "-";
      document.getElementById("leftHour").innerHTML = "-";
      document.getElementById("leftMinute").innerHTML = "-";
      document.getElementById("leftSecond").innerHTML = "-";
    }
  });
}

async function showSetting() {
  await cleanFrame();
  await cleanRightFrame();
  let tableHead = ["項目", "設定"];
  let settingName = ["選課開始時間", "授權金鑰"];
  let settingjsonName = ["selectStartDate", "key"];
  let settingType = ["datetime-local", "text"];
  let table = document.createElement("table");
  let actionDiv = document.createElement("div");
  actionDiv.setAttribute("class", "actionDiv");
  let saveDiv = document.createElement("div");
  let saveImg = document.createElement("img");
  table.className = "mtable";
  let setting = {
    selectStartDate: "2022-01-27T10:30",
    activate: false,
    key: "",
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
      if (i == 1) {
        input.style.width = "90%";
      }
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
      setting["activate"] = false;
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
        saveImg.setAttribute("src", "./icon/bx-save-check.svg");
        ipc.send("stopSequence");
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

async function updateUserData(userData) {
  let userName = document.getElementById("userName");
  let userClassAndNo = document.getElementById("userClassAndNo");
  if (userData.name !== "") {
    userName.innerText = userData.name;
    userClassAndNo.innerText = userData.id;
  }
}

preSelectClass.addEventListener("click", async function () {
  isInPreSelectPage = true;
  updateTime();
  preSelectClassPage();
  showPreSelectClassAtPreSelectPage();
});
fastSelectClass.addEventListener("click", async function () {
  isInPreSelectPage = false;
  updateTime();
  fastSelect();
  showPreSelectClassAtFastSelectPage();
});

controlCenter.addEventListener("click", async function () {
  isInPreSelectPage = false;
  ipc.send("getControlCenter");
});
classClass.addEventListener("click", async function () {
  isInPreSelectPage = false;
  ipc.send("getClassClass", SelDepNo, SelClassNo);
  updateTime();
  showPreSelectClass();
  console.log("getClassClass");
});
generalClass.addEventListener("click", async function () {
  isInPreSelectPage = false;
  ipc.send("getGeneralClass");
  updateTime();
  showPreSelectClass();
  console.log("getGeneralClass");
});

getMyClass.addEventListener("click", async function () {
  isInPreSelectPage = false;
  ipc.send("getMyClass");
  updateTime();
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
  isInPreSelectPage = false;
  showSetting();
  updateTime();
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
  if (isInPreSelectPage) {
    console.log("showPreSelectClass");
    preSelectClassPage();
    showPreSelectClassAtPreSelectPage();
  }
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
ipc.on("updateState", function (evt, nowState) {
  updateControlCenterState(nowState);
  console.log("updateControlCenterState");
});
ipc.on("updateGoogleInternetStatus", function (evt, data) {
  updateInternetStatus(0, data);
});
ipc.on("updateTTUInternetStatus", function (evt, data) {
  updateInternetStatus(1, data);
});
ipc.on("preSelectPagePlay", function () {
  updateControlCenterState();
  console.log("updateControlCenterState");
});
ipc.on("updateUserData", function (evt, userData) {
  updateUserData(userData);
});
