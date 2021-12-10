const htmlparser2 = require("htmlparser2");
const iconv = require("iconv-lite");
const fs = require('fs');
const { Console } = require("console");
module.exports = {
    myClassParser: function (response) {
        return myClassParser(response);
    },myClassDateParser: function (response,myClass) {
        return myClassDateParser(response,myClass);
    },
}



async function myClassParser(response) {
    let inTable = false;
    let countRows = false;
    let done = false;
    let tr = 0;
    let td = 0;
    var allClass=[];
    var outText="";
    var aClass ={
        "ln":0,
        "id":'',
        "name":'',
        "teacher":'',
        "type":'',
        "point":'',                                                                                                                                                                                                                                                                                                                                                                                          
        "student":'',
        "ps":'',
        "time":[]
    }
    var nowClass;
    const MyClassParser = new htmlparser2.Parser(
        {
            onattribute(name, value) {
                if ( name === "class" && value === "cistab") {
                    inTable = true;
                }
            },
            onopentag(name, attribs) {
                if (name === "tr" ) {
                    if(attribs.bgcolor==="YellowGreen"){
                        inTable = false;
                    }
                    tr++;
                    td=0;
                }
            },
            ontext(text) {
                if (inTable&&tr>=2) {
                    //console.log( "title: " + text );
                    outText+=text;

                    if(td==0){
                        nowClass={
                            "ln":0,
                            "id":'',
                            "name":'',
                            "teacher":'',
                            "type":'',
                            "point":'',                                                                                                                                                                                                                                                                                                                                                                                          
                            "student":'',
                            "ps":'',
                        };
                        nowClass.ln=tr-2;
                    }else if(td==1){
                        if(text!=' ')nowClass.id+=text;
                    }else if(td==2){
                        if(text!=' ' &&text!='\n')nowClass.name+=text;
                    }else if(td==3){
                        nowClass.teacher=text;
                    }else if(td==4){
                        if(text!=' ' &&text!='\n')nowClass.type+=text;
                    }else if(td==5){
                        if(text!=' ' &&text!='\n')nowClass.point+=text;
                    }else if(td==6){
                        nowClass.student+=text;
                    }else if(td==7){
                        nowClass.ps=text;
                        nowClass.name=nowClass.name.replace(/\s+/g,'');
                        nowClass.type=nowClass.type.replace(/\s+/g,'');
                        nowClass.point=nowClass.point.replace(/\s+/g,'');
                        nowClass.student=nowClass.student.replace(/\s+/g,'');
                        nowClass.ps=nowClass.ps.replace(/\s+/g,'');
                        allClass.push(nowClass);
                    }
                }
            },
            onclosetag(tagname) {
                if (tagname === "html") {
                    console.log("That's it!");
                    done = true;
                }else if(tagname === "table"){
                    inTable = false;
                }else if(tagname === "td"){
                    td++;
                }
            }
        },
        { decodeEntities: true }
    );
    return new Promise((resolve, reject) => {
        response.then(success => {
            MyClassParser.write( iconv.decode(Buffer.from(success.data), "big5") );
            MyClassParser.end();
        })
        .then(success =>{
            resolve(allClass);
        })
        .catch(fail => {
            console.log(fail);
        });
    });
}

async function myClassDateParser(response) {
    let done = false;
    let tr = 0;
    let td = 0;
    let b = 0;
    var classTime;
    const MyClassParser = new htmlparser2.Parser(
        {
            onopentag(name, attribs) {
                if (name === "tr" ) {
                    tr++;
                    td=0;
                }else if(name === "td"){
                    td++;
                }else if(name === "b"){
                    b++;
                    if(b==3){
                        classTime.day=classTime.day.replace(/\s+/g,'');
                        classTime.seg=classTime.seg.replace(/\s+/g,'');
                        classTime.loc=classTime.loc.replace(/\s+/g,'');
                        myClass.time.push(classTime);
                        b=0;
                    }
                }
            },
            ontext(text) {
                if (td==2&&tr==7) {
                    if(b==0){
                        classTime={
                            "day":'',
                            "seg":'',
                            "loc":''
                        };
                        classTime.day+=text;
                    }else if(b==1){
                        classTime.seg+=text;
                    }else if(b==2){
                        classTime.loc+=text;
                    }
                }
            },
            onclosetag(tagname) {
                if (tagname === "html") {
                    console.log("That's it!");
                    done = true;
                }
            }
        },
        { decodeEntities: true }
    );
    response.then(success => {
        fs.writeFile('A.txt', iconv.decode(Buffer.from(success.data), "big5"), function (err) {
            if (err)
                console.log(err);
            else
                console.log('Write operation complete.');
        });
        MyClassParser.write( iconv.decode(Buffer.from(success.data), "big5") );
        MyClassParser.end();
      })
      .then(success =>{
        return new Promise((resolve, reject) => {
            //setTimeout(function(){
            // 3 秒時間後，透過 resolve 來表示完成
             resolve(classTime);
            //}, 3000);
        });
      })
      .catch(fail => {
        console.log(fail);
      });
}