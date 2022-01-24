const electron = require("electron");
const ipc = electron.ipcRenderer

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
const fs = require('fs');
const {
    resolve
} = require("path");
const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main_farm = document.getElementById("main_farm");
const getMyClass = document.getElementById("getMyClass");
const preSelectClass = document.getElementById("preSelectClass");

let tableSwitch
let myClassTableType = false
async function cleanFrame() {
    main_farm.innerHTML = ""
}
async function preSelect() {
    await cleanFrame()
    let preSelectList = {
        "isLock": false,
        "preSelectBlock": []
    }
    let tableHead = ["分組", "啟用", "發送時刻(秒)", "酬載1", "酬載2"]
    let table = document.createElement("table");
    table.className = "preTable"
    tr = table.insertRow(-1);
    tr.className = "ptr"

    let preSelectPromise = new Promise(function (resolve, reject) {
        console.log(1)
        fs.readFile('./src/data/preSelect.json', function (err, preSelectListSaved) {
            if (err) {
                console.log("no PRS make new file");
                for (let i = 0; i < 5; i++) {
                    let preSelectBlock = {
                        "id": 0,
                        "enable": false,
                        "trigger": 0,
                        "list": ["", ""]
                    }
                    preSelectBlock.id = i;
                    preSelectList.preSelectBlock.push(preSelectBlock);
                }
                fs.writeFile('./src/data/preSelect.json', JSON.stringify(preSelectList), function (err) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log('make new file complete.');
                        resolve("make new");
                    }
                });

            } else {
                console.log("load PRS");
                //將二進制數據轉換為字串符
                preSelectListSaved = preSelectListSaved.toString();
                //將字符串轉換為 JSON 對象
                preSelectList = JSON.parse(preSelectListSaved);
                console.log(2)
                resolve("success");
            }
        })
    });

    for (let i = 0; i < 5; i++) {
        let th = document.createElement("th"); // TABLE HEADER.
        th.setAttribute('id', 'mheader');
        th.innerHTML = tableHead[i];
        tr.appendChild(th);
    }
    preSelectPromise.then(function (success) {
        console.log(3)
        console.log(success)
        for (let i = 0; i < 5; i++) {
            tr = table.insertRow(-1);
            tr.className = "ptr"

            let td = document.createElement("td");
            td.className = "ptd"
            td.innerHTML = i + 1;
            tr.appendChild(td);

            td = document.createElement("td");
            td.className = "ptd"
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.className = "preInput"
            checkbox.id = "checkbox" + i;
            if (preSelectList.preSelectBlock[i].enable == true) {
                checkbox.setAttribute("checked");
            }
            td.appendChild(checkbox);
            tr.appendChild(td);

            td = document.createElement("td");
            td.className = "ptd"
            let timeSelect = document.createElement("input");
            timeSelect.id = "timeSelect" + i;
            timeSelect.setAttribute("type", "number");
            timeSelect.setAttribute("min", -120);
            timeSelect.setAttribute("max", 120);
            timeSelect.setAttribute("step", 0.01);
            timeSelect.setAttribute("value", preSelectList.preSelectBlock[i].trigger);
            timeSelect.className = "preTime  preInput"
            td.appendChild(timeSelect);
            tr.appendChild(td);

            for (let j = 0; j < 2; j++) {
                let td = document.createElement("td");
                td.className = "ptd"
                let textarea = document.createElement("textarea");
                textarea.id = "textarea" + (i * 2 + j);
                textarea.className = "preTextrea  preInput"
                textarea.setAttribute("max-rows", 5)
                textarea.innerHTML = preSelectList.preSelectBlock[i].list[j];
                td.appendChild(textarea);
                tr.appendChild(td);
            }
        }
        let save = document.createElement("button");
        save.setAttribute("type", "button");
        save.className = "saveBTN";

        console.log(preSelectList.isLock)

        main_farm.appendChild(table);
        main_farm.appendChild(save);

        let preInput = document.querySelectorAll('.preInput');
        console.log(preInput)
        if (preSelectList.isLock == false) {
            save.innerHTML = "保存並鎖定"
            for (var i = 0; i < preInput.length; i++) {
                preInput[i].disabled = false;
            }
            for (let i = 0; i < 5; i++) {
                document.getElementById("textarea" + (i * 2)).className = "preTextrea";
                document.getElementById("textarea" + (i * 2 + 1)).className = "preTextrea";
            }
        } else {
            save.innerHTML = "解除鎖定"
            for (var i = 0; i < preInput.length; i++) {
                preInput[i].disabled = true;
            }
            for (let i = 0; i < 5; i++) {
                document.getElementById("textarea" + (i * 2)).className = "preTextreaDark";
                document.getElementById("textarea" + (i * 2 + 1)).className = "preTextreaDark";
            }
        }



        save.addEventListener('click', async function () {
            if (preSelectList.isLock == false) {
                save.innerHTML = "解除鎖定"
                preSelectList.isLock = true;
                for (var i = 0; i < preInput.length; i++) {
                    preInput[i].disabled = true;
                }
                for (let i = 0; i < 5; i++) {
                    preSelectList.preSelectBlock[i].enable = document.getElementById("checkbox" + i).checked;
                    preSelectList.preSelectBlock[i].trigger = document.getElementById("timeSelect" + i).value;
                    preSelectList.preSelectBlock[i].list[0] = document.getElementById("textarea" + (i * 2)).value;
                    document.getElementById("textarea" + (i * 2)).className = "preTextreaDark";
                    preSelectList.preSelectBlock[i].list[1] = document.getElementById("textarea" + (i * 2 + 1)).value;
                    document.getElementById("textarea" + (i * 2 + 1)).className = "preTextreaDark";
                }
                fs.writeFile('./src/data/preSelect.json', JSON.stringify(preSelectList), function (err) {
                    if (err)
                        console.log(err);
                    else
                        console.log('save file complete.');
                });
            } else {
                save.innerHTML = "保存並鎖定"
                preSelectList.isLock = false;
                for (var i = 0; i < preInput.length; i++) {
                    preInput[i].disabled = false;
                }
                for (let i = 0; i < 5; i++) {
                    document.getElementById("textarea" + (i * 2)).className = "preTextrea";
                    document.getElementById("textarea" + (i * 2 + 1)).className = "preTextrea";
                }
            }
        })
    })
}
async function showMyClass() {
    await cleanFrame()
    let table = document.createElement("table");
    table.className = "mtable"
    let switchLabel = document.createElement("label");
    let switchInput = document.createElement("input");
    let switchSpan = document.createElement("span");

    let tableHead = ["動作", "課程代碼", "課程名稱", "教師", "類別", "學分", "已選/上限", "附註"]
    let tableKey = ["ln", "id", "name", "teacher", "type", "point", "student", "ps"]


    fs.readFile('./src/data/myClass.json', function (err, myClass) {
        if (err) {
            return console.log(err);
        }
        console.log("start");
        //將二進制數據轉換為字串符
        let myclass = myClass.toString();
        //將字符串轉換為 JSON 對象
        myclass = JSON.parse(myclass);
        let tr = table.insertRow(-1); // TABLE ROW.
        tr.className = "mtr"

        for (let key of tableHead) {
            let th = document.createElement("th"); // TABLE HEADER.
            th.setAttribute('id', 'mheader');
            th.innerHTML = key;
            tr.appendChild(th);
        }
        for (let element of myclass) {
            tr = table.insertRow(-1);
            tr.className = "mtr"
            for (let key of tableKey) {
                let td = document.createElement("td");
                td.className = "mtd"
                td.innerHTML = element[key];
                tr.appendChild(td);
            }
        }
    })

    switchLabel.setAttribute('class', 'switch');
    switchInput.setAttribute('type', 'checkbox');
    switchInput.setAttribute('checked', myClassTableType);
    tableSwitch = switchInput;
    switchSpan.setAttribute('class', 'slider round');
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSpan);

    main_farm.appendChild(table);
    main_farm.appendChild(switchLabel);

}

preSelectClass.addEventListener('click', async function () {
    preSelect();
})
getMyClass.addEventListener('click', async function () {
    //ipc.send('getMyClass');
    //console.log('getMyClass');
    showMyClass();
    tableSwitch.addEventListener('click', async function () {
        console.log(tableSwitch.checked);
        myClassTableType = tableSwitch.checked;
        if (myClassTableType == false) {

        } else {

        }
    })
})

ipc.on("readyToShow", function (evt, myClass) {
    console.log("show");
    showMyClass();
});

menu.addEventListener('click', async function () {
    sidebar.classList.toggle("active");
    console.log("open");
})

ipc.on('myClass', function (evt, myClass) {
    console.log(myClass);
    main_farm.innerHTML = myClass;
});