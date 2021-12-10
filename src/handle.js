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
    var Id = document.getElementById('id').value;
    var Ps = document.getElementById('ps').value;
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
const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main_farm = document.getElementById("main_farm");
const getMyClass = document.getElementById("getMyClass");

async function showMyClass() {
    var table = document.createElement("table");
    
    const fs = require('fs');
    var tableHead=["動作","課程代碼","課程名稱","教師","類別","學分","已選/上限","附註"]
    var tableKey=["ln","id","name","teacher","type","point","student","ps"]


    fs.readFile('./src/data/myClass.json', function (err, myClass) {
        if (err) {
            return console.log(err);
        }
        console.log("start");
    //將二進制數據轉換為字串符
        var myclass = myClass.toString();
    //將字符串轉換為 JSON 對象
        myclass = JSON.parse(myclass);
        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (let key of tableHead) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.setAttribute('id','header');
            th.innerHTML = key;
            tr.appendChild(th);
        }
        for(let element of myclass){
            tr = table.insertRow(-1);
            for(let key of tableKey){
                var td = document.createElement("td");
                td.innerHTML = element[key];
                tr.appendChild(td);
            }
        }
    })
    main_farm.appendChild(table);
}

getMyClass.addEventListener('click',async function(){
    ipc.send('getMyClass');
    //console.log('getMyClass');
    showMyClass();
})
menu.addEventListener('click',async function(){
    sidebar.classList.toggle("active");
    console.log("open");
})

ipc.on('myClass', function (evt, myClass) {
    console.log(myClass);
    main_farm.innerHTML = myClass;
});

