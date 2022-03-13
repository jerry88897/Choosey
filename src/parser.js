const htmlparser2 = require("htmlparser2");
const iconv = require("iconv-lite");
const fs = require("fs");
const { Console } = require("console");
module.exports = {
  myClassParser: function (response) {
    return myClassParser(response);
  },
  ClassClassParser: function (response, SelDepNo, SelClassNo) {
    return ClassClassParser(response, SelDepNo, SelClassNo);
  },
  myClassDateParser: function (response, myClass) {
    return myClassDateParser(response, myClass);
  },
  gradeParser: function (response) {
    return gradeParser(response);
  },
};

async function ClassClassParser(response, SelDepNo, SelClassNo) {
  let inTable = false;
  let countRows = false;
  let done = false;
  let tr = 0;
  let td = 0;
  var allClass = [];
  var outText = "";
  var aClass = {
    ln: 0,
    id: "",
    name: "",
    DepNo: "",
    SelClassNo: "",
    teacher: "",
    type: "",
    point: "",
    student: "",
    ps: "",
    time: [],
  };
  var nowClass;
  const MyClassParser = new htmlparser2.Parser(
    {
      onattribute(name, value) {
        if (name === "class" && value === "cistab") {
          inTable = true;
        }
      },
      onopentag(name, attribs) {
        if (name === "tr") {
          if (attribs.bgcolor === "GreenYellow") {
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
              ln: 0,
              id: "",
              name: "",
              DepNo: "",
              SelClassNo: "",
              teacher: "",
              type: "",
              point: "",
              student: "",
              ps: "",
              time: [],
            };
            nowClass.DepNo = SelDepNo;
            nowClass.ClassNo = SelClassNo;
            nowClass.ln = tr - 2;
          } else if (td == 1) {
            if (text != " ") nowClass.id += text;
          } else if (td == 2) {
            if (text != " " && text != "\n") nowClass.name += text;
          } else if (td == 3) {
            nowClass.teacher += text;
          } else if (td == 4) {
            if (text != " " && text != "\n") nowClass.type += text;
          } else if (td == 5) {
            if (text != " " && text != "\n") nowClass.point += text;
          } else if (td == 6) {
            nowClass.student += text;
          } else if (td == 7) {
            nowClass.ps = text;
            nowClass.name = nowClass.name.replace(/\s+/g, "");
            nowClass.type = nowClass.type.replace(/\s+/g, "");
            nowClass.point = nowClass.point.replace(/\s+/g, "");
            nowClass.student = nowClass.student.replace(/\s+/g, "");
            nowClass.ps = nowClass.ps.replace(/\s+/g, "");
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
      },
    },
    {
      decodeEntities: true,
    }
  );
  return new Promise((resolve, reject) => {
    response
      .then((success) => {
        MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
        MyClassParser.end();
      })
      .then((success) => {
        resolve(allClass);
      })
      .catch((fail) => {
        console.log(fail);
      });
  });
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
    ln: 0,
    id: "",
    name: "",
    teacher: "",
    type: "",
    point: "",
    student: "",
    ps: "",
    time: [],
  };
  var nowClass;
  const MyClassParser = new htmlparser2.Parser(
    {
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
              ln: 0,
              id: "",
              name: "",
              teacher: "",
              type: "",
              point: "",
              student: "",
              ps: "",
              time: [],
            };
            nowClass.ln = tr - 2;
          } else if (td == 1) {
            if (text != " ") nowClass.id += text;
          } else if (td == 2) {
            if (text != " " && text != "\n") nowClass.name += text;
          } else if (td == 3) {
            nowClass.teacher += text;
          } else if (td == 4) {
            if (text != " " && text != "\n") nowClass.type += text;
          } else if (td == 5) {
            if (text != " " && text != "\n") nowClass.point += text;
          } else if (td == 6) {
            nowClass.student += text;
          } else if (td == 7) {
            nowClass.ps = text;
            nowClass.name = nowClass.name.replace(/\s+/g, "");
            nowClass.type = nowClass.type.replace(/\s+/g, "");
            nowClass.point = nowClass.point.replace(/\s+/g, "");
            nowClass.student = nowClass.student.replace(/\s+/g, "");
            nowClass.ps = nowClass.ps.replace(/\s+/g, "");
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
      },
    },
    {
      decodeEntities: true,
    }
  );
  return new Promise((resolve, reject) => {
    response
      .then((success) => {
        MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
        MyClassParser.end();
      })
      .then((success) => {
        resolve(allClass);
      })
      .catch((fail) => {
        console.log(fail);
      });
  });
}

async function myClassDateParser(response) {
  return new Promise((resolve, reject) => {
    let done = false;
    let inTable = false;
    let tr = 0;
    let td = 0;
    let b = 0;
    var classTime = {
      day: "",
      seg: "",
      Sday: "",
      Sseg: "",
      loc: "",
    };
    var myClassTime = [];
    const MyClassParser = new htmlparser2.Parser(
      {
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
          if (tagname === "b" && inTable == true) {
            if (b == 3) {
              classTime.Sday = classTime.day.replace(/\s+/g, "");
              classTime.Sseg = classTime.seg.replace(/\s+/g, "");
              classTime.loc = classTime.loc.replace(/\s+/g, "");
              if (classTime.Sday === "星期一") {
                classTime.day = 0;
              } else if (classTime.Sday === "星期二") {
                classTime.day = 1;
              } else if (classTime.Sday === "星期三") {
                classTime.day = 2;
              } else if (classTime.Sday === "星期四") {
                classTime.day = 3;
              } else if (classTime.Sday === "星期五") {
                classTime.day = 4;
              } else if (classTime.Sday === "星期六") {
                classTime.day = 5;
              } else {
                classTime.day = "N/A";
              }
              if (classTime.Sseg === "第一節") {
                classTime.seg = 0;
              } else if (classTime.Sseg === "第二節") {
                classTime.seg = 1;
              } else if (classTime.Sseg === "第三節") {
                classTime.seg = 2;
              } else if (classTime.Sseg === "第四節") {
                classTime.seg = 3;
              } else if (classTime.Sseg === "中午") {
                classTime.seg = 4;
              } else if (classTime.Sseg === "第五節") {
                classTime.seg = 5;
              } else if (classTime.Sseg === "第六節") {
                classTime.seg = 6;
              } else if (classTime.Sseg === "第七節") {
                classTime.seg = 7;
              } else if (classTime.Sseg === "第八節") {
                classTime.seg = 8;
              } else if (classTime.Sseg === "傍晚") {
                classTime.seg = 9;
              } else if (classTime.Sseg === "第九節") {
                classTime.seg = 10;
              } else if (classTime.Sseg === "第10節") {
                classTime.seg = 11;
              } else if (classTime.Sseg === "第11節") {
                classTime.seg = 12;
              } else if (classTime.Sseg === "第12節") {
                classTime.seg = 13;
              } else {
                classTime.seg = "N/A";
              }
              myClassTime.push(classTime);
              console.log(classTime.day);
              classTime = {
                day: "",
                seg: "",
                Sday: "",
                Sseg: "",
                loc: "",
              };
              b = 0;
            }
          } else if (tagname === "html") {
            console.log("That's it!");
            done = true;
          }
        },
      },
      {
        decodeEntities: true,
      }
    );
    response
      .then((success) => {
        MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
        MyClassParser.end();
      })
      .then((success) => {
        // fs.writeFile("A.txt", myClassTime[0].seg, function (err) {
        //   if (err) console.log(err);
        //   else console.log("Write operation complete.");
        // });
        resolve(myClassTime);
      })
      .catch((fail) => {
        console.log(fail);
      });
  });
}
async function gradeParser(response) {
  let b = 0;
  let seg = 0;
  let inB = false;
  let user = {
    grade: "",
    number: "",
    name: "",
  };
  const MyClassParser = new htmlparser2.Parser(
    {
      onopentag(name, attribs) {
        if (name === "b") {
          b++;
          if (b == 2) {
            inB = true;
          }
        }
      },
      ontext(text) {
        if (inB) {
          if (seg == 0) {
            user = {
              grade: "",
              number: "",
              name: "",
            };
            seg++;
          } else if (seg == 2) {
            user.grade = text.substring(0, 4);
            user.number = text.substring(4, text.length);
            seg++;
          } else if (seg >= 4) {
            user.name += text;
            seg++;
          } else {
            seg++;
          }
        }
      },
      onclosetag(tagname) {
        if (tagname === "html") {
          console.log("That's it!");
          done = true;
        } else if (tagname === "b") {
          inB = false;
        }
      },
    },
    {
      decodeEntities: true,
    }
  );
  return new Promise((resolve, reject) => {
    response
      .then((success) => {
        MyClassParser.write(iconv.decode(Buffer.from(success.data), "big5"));
        MyClassParser.end();
      })
      .then((success) => {
        resolve(user);
      })
      .catch((fail) => {
        console.log(fail);
      });
  });
}
