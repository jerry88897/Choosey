const fs = require("fs");
module.exports = {
  removePreSelectClass: function (aClass) {
    return removePreSelectClass(aClass);
  },
};
async function removePreSelectClass(aClass) {
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
        for (let i = 0; i < shoppingCart.length; i++) {
          if (shoppingCart[i].id === aClass.id) {
            shoppingCart.splice(i, 1);
            break;
          }
        }
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
