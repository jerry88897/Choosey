const electron = require("electron");
const ipc = electron.ipcRenderer;
const fs = require("fs");

const body = document.getElementById("body");
const loginBox = document.getElementById("login_box");
const login = document.getElementById("login");
const wave = document.getElementById("wave");

const Id = document.getElementById("id");
const Ps = document.getElementById("ps");

window.addEventListener(
  "load",
  function () {
    let idPromise = new Promise(function (resolve, reject) {
      fs.readFile("./src/data/id.json", function (err, idSaved) {
        if (err) {
          resolve("");
        } else {
          resolve(idSaved.toString());
        }
      });
    });
    idPromise.then(function (idSaved) {
      Id.value = idSaved.slice(0, 10);
    });
  },
  false
);

function Submit() {
  ipc.send("login", {
    id: Id.value,
    ps: Ps.value,
  });
  console.log({
    id: Id.value,
    ps: Ps.value,
  });
  fs.writeFile("./src/data/id.json", Id.value, function (err) {
    if (err) {
      console.log(err);
      reject(err);
    } else {
      console.log("make new setting file complete.");
      resolve("make new save");
    }
  });
  loginBox.style.animation = "flyout 1s forwards";
  wave.style.animation = "down 2s forwards";
  setTimeout(function () {
    ipc.send("loadPage2");
  }, 1 * 1000);
}

login.addEventListener("click", async function () {
  Submit();
});
window.addEventListener("keydown", function (e) {
  let keyID = e.code;
  if (keyID === "Enter") {
    Submit();
  }
});
