const fs = require("fs");
module.exports = {
  addPreSelectClass: function (aClass) {
    return addPreSelectClass(aClass);
  },
  removePreSelectClass: function (aClass) {
    return removePreSelectClass(aClass);
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
