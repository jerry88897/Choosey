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

getMyClass.addEventListener('click',async function(){
    ipc.send('getMyClass');
    console.log('getMyClass');
})
menu.addEventListener('click',async function(){
    sidebar.classList.toggle("active");
    console.log("open");
})

ipc.on('myClass', function (evt, myClass) {
    console.log(myClass);
    main_farm.innerHTML = myClass;
});
