const htmlparser2 = require("htmlparser2");
const iconv = require("iconv-lite");
const fs = require('fs');
const {
    Console
} = require("console");
module.exports = {
    myClassParser: function (response) {
        return myClassParser(response);
    },
    myClassDateParser: function (response, myClass) {
        return myClassDateParser(response, myClass);
    },
}



async function myClassParser(response) {
    let inTable = false;
    let countRows = false;
    let done = false;
    let tr = 0;
    let td = 0;
    var allClass = [];
    var outText = "";
    var aClass = {
        "ln": 0,
        "id": '',
        "name": '',
        "teacher": '',
        "type": '',
        "point": '',
        "student": '',
        "ps": '',
        "time": []
    }
    var nowClass;
    const MyClassParser = new htmlparser2.Parser({
        onattribute(name, value) {
            if (name === "class" && value === "cistab") {
                inTable = true;
            }
        },
        onopentag(name, attribs) {
            if (name === "tr") {
                if (attribs.bgcolor === "YellowGreen") {
                    inTable = false;
                }
                tr++;
                td = 0;
            }
        },
        ontext(text) {
            if (inTable && tr >= 2) {
                //console.log( "title: " + text );
                outText += text;

                if (td == 0) {
                    nowClass = {
                        "ln": 0,
                        "id": '',
                        "name": '',
                        "teacher": '',
                        "type": '',
                        "point": '',
                        "student": '',
                        "ps": '',
                        "time": []
                    };
                    nowClass.ln = tr - 2;
                } else if (td == 1) {
                    if (text != ' ') nowClass.id += text;
                } else if (td == 2) {
                    if (text != ' ' && text != '\n') nowClass.name += text;
                } else if (td == 3) {
                    nowClass.teacher = text;
                } else if (td == 4) {
                    if (text != ' ' && text != '\n') nowClass.type += text;
                } else if (td == 5) {
                    if (text != ' ' && text != '\n') nowClass.point += text;
                } else if (td == 6) {
                    nowClass.student += text;
                } else if (td == 7) {
                    nowClass.ps = text;
                    nowClass.name = nowClass.name.replace(/\s+/g, '');
                    nowClass.type = nowClass.type.replace(/\s+/g, '');
                    nowClass.point = nowClass.point.replace(/\s+/g, '');
                    nowClass.student = nowClass.student.replace(/\s+/g, '');
                    nowClass.ps = nowClass.ps.replace(/\s+/g, '');
                    allClass.push(nowClass);
                }
            }
        },
        onclosetag(tagname) {
            if (tagname === "html") {
                console.log("That's it!");
                done = true;
            } else if (tagname === "table") {
                inTable = false;
            } else if (tagname === "td") {
                td++;
            }
        }
    }, {
        decodeEntities: true
    });
    return new Promise((resolve, reject) => {
        response.then(success => {
                MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
                MyClassParser.end();
            })
            .then(success => {
                resolve(allClass);
            })
            .catch(fail => {
                console.log(fail);
            });
    });
}

async function myClassDateParser(response) {
    return new Promise((resolve, reject) => {
        let done = false;
        let inTable = false
        let tr = 0;
        let td = 0;
        let b = 0;
        var classTime= {
            "day": '',
            "seg": '',
            "loc": ''
        };
        var myClassTime = []
        const MyClassParser = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === "tr") {
                    tr++;
                    if (tr == 7) {
                        inTable = true;
                    } else {
                        inTable = false;
                    }
                    td = 0;
                } else if (name === "td") {
                    td++;
                } else if (name === "b" && inTable) {
                    b++;
                }
            },
            ontext(text) {
                if (td == 2 && tr == 7) {
                    if (b == 1) {
                        classTime.day += text;
                    } else if (b == 2) {
                        classTime.seg += text;
                    } else if (b == 3) {
                        classTime.loc += text;
                    }
                }
            },
            onclosetag(tagname) {
                if(tagname === "b"&&inTable == true){
                    if (b == 3) {
                        classTime.day = classTime.day.replace(/\s+/g, '');
                        classTime.seg = classTime.seg.replace(/\s+/g, '');
                        classTime.loc = classTime.loc.replace(/\s+/g, '');
                        myClassTime.push(classTime);
                        console.log(classTime.day)
                        classTime = {
                            "day": '',
                            "seg": '',
                            "loc": ''
                        };
                        b = 0;
                    }
                }
                else if (tagname === "html") {
                    console.log("That's it!");
                    done = true;
                }
            }
        }, {
            decodeEntities: true
        });
        response.then(success => {
                MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
                MyClassParser.end();
            })
            .then(success => {

                //setTimeout(function(){
                // 3 秒時間後，透過 resolve 來表示完成
                fs.writeFile('A.txt', myClassTime[0].seg, function (err) {
                    if (err)
                        console.log(err);
                    else
                        console.log('Write operation complete.');
                });
                resolve(myClassTime);
                //}, 3000);

            })
            .catch(fail => {
                console.log(fail);
            });
    });
}