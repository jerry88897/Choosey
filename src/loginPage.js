const electron = require("electron");
const ipc = electron.ipcRenderer

const body = document.getElementById("body")
const loginBox = document.getElementById('login_box')
const login = document.getElementById('login')
const wave = document.getElementById("wave")



login.addEventListener('click', async function () {
    var Id = document.getElementById('id').value;
    var Ps = document.getElementById('ps').value;
    ipc.send('login', {
        id: Id,
        ps: Ps
    });
    console.log({
        id: Id,
        ps: Ps
    });
    loginBox.style.animation = "flyout 1s forwards";
    wave.style.animation = "down 2s forwards";
    setTimeout(function () {
        ipc.send('loadPage2');
    }, 2 * 1000)
})

/*ipc.on('loginRe', function (evt, resoult) {
    console.log(resoult);
    if(resoult==0){
        loginBox.style.animation = "flyout 1s forwards";
        wave.style.animation = "down 2s forwards";
        setTimeout(function(){
            ipc.send('loadPage2');
        },2.5*1000)
    }
    //document.getElementById("classList").innerHTML = message;
});*/