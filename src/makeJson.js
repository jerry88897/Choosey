const fs = require("fs");

module.exports = {
  myClassToJson: function (myClass) {
    return myClassToJson(myClass);
  },
};

async function myClassToJson(myClass) {
  //console.log(myClass)
  return new Promise((resolve, reject) => {
    fs.writeFile(
      "./src/data/myClass.json",
      JSON.stringify(myClass),
      function (err) {
        if (err) {
          console.error(err);
        } else {
          resolve();
          console.log("write classFile...");
        }
      }
    );
  });
}
