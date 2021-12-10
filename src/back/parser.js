const htmlparser2 = require("htmlparser2");
const iconv = require("iconv-lite");
const fs = require('fs');
module.exports = {
    myClassParser: function (response) {
        return myClassParser(response);
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
        "day":'',
        "seg":''
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
                        fs.writeFile('./src/data/myClass.json', JSON.stringify(allClass), function (err) {
                            if (err) {
                                console.error(err);
                            }
                            console.log('Add new user to userInfo...')
                        })
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
    response.then(success => {
        MyClassParser.write( iconv.decode(Buffer.from(success.data), "big5") );
        MyClassParser.end();
      })
      .then(success =>{
        fs.writeFile('./hello.md', outText,function (error) {
            console.log(error)
            console.log('文件寫入成功')
          })
      })
      .catch(fail => {
        console.log(fail);
      });
    
}