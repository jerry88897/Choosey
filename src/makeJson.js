const fs = require('fs');


module.exports = {
    myClassToJson: function (myClass) {
        myClassToJson(myClass);
    }
}


async function myClassToJson(myClass) {
    //console.log(myClass)
    fs.writeFile('./src/data/myClass.json', JSON.stringify(myClass), function (err) {
        if (err) {
            console.error(err);
        }
        console.log('write classFile...')
    })
}