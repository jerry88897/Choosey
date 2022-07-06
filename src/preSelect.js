const fs = require("fs");
let copiedClass = "";
module.exports = {
  addPreSelectClass: function (aClass) {
    return addPreSelectClass(aClass);
  },
  removePreSelectClass: function (aClass) {
    return removePreSelectClass(aClass);
  },
  exportPreSelectClass: function (aClass) {
    return exportPreSelectClass(aClass);
  },
  copyPreSelectClass: function (aClass) {
    return copyPreSelectClass(aClass);
  },
  getCopiedPreSelectClass: function () {
    return copiedClass;
  },
};

async function addPreSelectClass(aClass) {
  //console.log(myClass)
  return new Promise((resolve, reject) => {
    let shoppingCart;
    let getFile = new Promise((resolve, reject) => {
      fs.readFile(
        "./src/data/shoppingCart.json",
        function (err, shoppingCartData) {
          if (err) {
            console.error(err);
            fs.writeFile("./src/data/shoppingCart.json", "[]", function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                shoppingCart = "[]";
                resolve();
              }
            });
          } else {
            shoppingCart = shoppingCartData.toString();
            resolve();
            console.log("write classFile...");
          }
        }
      );
    });
    getFile
      .then(function () {
        shoppingCart = JSON.parse(shoppingCart);
        shoppingCart.push(aClass);
        fs.writeFile(
          "./src/data/shoppingCart.json",
          JSON.stringify(shoppingCart),
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              shoppingCart = "";
              resolve();
            }
          }
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

async function removePreSelectClass(aClass) {
  //console.log(myClass)
  return new Promise((resolve, reject) => {
    let shoppingCart;
    let getFile = new Promise((resolve, reject) => {
      fs.readFile(
        "./src/data/shoppingCart.json",
        function (err, shoppingCartData) {
          if (err) {
            console.error(err);
            fs.writeFile("./src/data/shoppingCart.json", "[]", function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                shoppingCart = "[]";
                resolve();
              }
            });
          } else {
            shoppingCart = shoppingCartData.toString();
            resolve();
            console.log("write classFile...");
          }
        }
      );
    });
    getFile
      .then(function () {
        shoppingCart = JSON.parse(shoppingCart);
        for (let i = 0; i < shoppingCart.length; i++) {
          if (shoppingCart[i].id === aClass.id) {
            shoppingCart.splice(i, 1);
            break;
          }
        }
        fs.writeFile(
          "./src/data/shoppingCart.json",
          JSON.stringify(shoppingCart),
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              shoppingCart = "";
              resolve();
            }
          }
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
async function exportPreSelectClass(aClass) {
  //console.log(myClass)
  return new Promise((resolve, reject) => {
    let shoppingCart;
    let getFile = new Promise((resolve, reject) => {
      fs.readFile(
        "./src/data/PreSelectPage.json",
        function (err, shoppingCartData) {
          if (err) {
            console.error(err);
            fs.writeFile("./src/data/PreSelectPage.json", "[]", function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                shoppingCart = "[]";
                resolve();
              }
            });
          } else {
            shoppingCart = shoppingCartData.toString();
            resolve();
            console.log("write classFile...");
          }
        }
      );
    });
    getFile
      .then(function () {
        shoppingCart = JSON.parse(shoppingCart);
        aClass["isLock"] = false;
        shoppingCart.push(aClass);
        fs.writeFile(
          "./src/data/PreSelectPage.json",
          JSON.stringify(shoppingCart),
          function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              shoppingCart = "";
              resolve();
            }
          }
        );
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
async function copyPreSelectClass(aClass) {
  //console.log(myClass)
  return new Promise((resolve, reject) => {
    copiedClass = aClass;
    console.log(copiedClass);
    resolve();
  });
}
