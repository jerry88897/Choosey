const fs = require("fs");
module.exports = {
  pasteSelectClass: function (CopiedPreSelectClass, fastSelectNo) {
    return pasteSelectClass(CopiedPreSelectClass, fastSelectNo);
  },
  deleteClass: function (i, j) {
    return deleteClass(i, j);
  },
};

async function pasteSelectClass(CopiedPreSelectClass, fastSelectNo) {
  let fastSelectSave;
  return new Promise((resolve, reject) => {
    let getFile = new Promise((resolve, reject) => {
      fs.readFile(
        "./src/data/fastSelect.json",
        function (err, shoppingCartData) {
          if (err) {
            console.error(err);
          } else {
            fastSelectSave = shoppingCartData.toString();
            fastSelectSave = JSON.parse(fastSelectSave);
            resolve();
            console.log("read fastSelectSave...");
          }
        }
      );
    });
    getFile
      .then(function () {
        console.log(1);
        fastSelectSave["fastSelectBlock"][fastSelectNo]["list"].push(
          CopiedPreSelectClass
        );
        let fastSelectSaved = new Promise(function (resolve, reject) {
          console.log(1);
          fs.writeFile(
            "./src/data/fastSelect.json",
            JSON.stringify(fastSelectSave),
            function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                console.log("save fastSelect complete.");
                resolve("save fastSelect");
              }
            }
          );
        });
        fastSelectSaved.then(function () {
          resolve();
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
async function deleteClass(row, column) {
  return new Promise((resolve, reject) => {
    let getFile = new Promise((resolve, reject) => {
      fs.readFile(
        "./src/data/fastSelect.json",
        function (err, shoppingCartData) {
          if (err) {
            console.error(err);
          } else {
            fastSelectSave = shoppingCartData.toString();
            fastSelectSave = JSON.parse(fastSelectSave);
            resolve();
            console.log("read fastSelectSave...");
          }
        }
      );
    });
    getFile
      .then(function () {
        console.log(1);
        fastSelectSave["fastSelectBlock"][row]["list"].splice(column, 1);
        let fastSelectSaved = new Promise(function (resolve, reject) {
          console.log(1);
          fs.writeFile(
            "./src/data/fastSelect.json",
            JSON.stringify(fastSelectSave),
            function (err) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                console.log("save fastSelect complete.");
                resolve("save fastSelect");
              }
            }
          );
        });
        fastSelectSaved.then(function () {
          resolve();
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
