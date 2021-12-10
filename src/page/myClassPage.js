
const table = document.getElementById("mainTable");
const ti = document.getElementById("ti");
const fs = require('fs');
var tableHead=["動作","課程代碼","課程名稱","教師","類別","學分","已選/上限","附註"]
var tableKey=["ln","id","name","teacher","type","point","student","ps"]

ti.innerText="jghfjghj"

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
