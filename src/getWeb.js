const axios = require('axios');


let cookie = "";



module.exports = {
    loginAndGetClass: function () {

        return loginAndGetMyClass();
    },

    login: function (loginData) {
        return login(loginData);
    },
    getMyClassDate: function (classId) {
        return getMyClassDate(classId);
    },
    passCheck: function () {
        return passCheck();
    },
    getCookie: function () {
        return cookie;
    }
}

async function login(loginData) {
    const str = "501:"
    return new Promise((resolve, reject) => {
        axios.post('https://stucis.ttu.edu.tw/login.php', "ID=" + loginData.id + "&PWD=" + loginData.ps + "&Submit=%B5n%A4J%A8t%B2%CE", {
        //axios.post('https://stucis.ttu.edu.tw/login.php', "ID=" + "410806250" + "&PWD=" + "" + "&Submit=%B5n%A4J%A8t%B2%CE", {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
                }
            }, {
                withCredentials: true
            })
            .then(function (response) {
                cookie = response.headers['set-cookie'][0].substring(0, 36);
                passCheck();
                resolve(cookie);
                /*console.log(response.data.search(str));
                if (response.data.search(str) == -1) {
                    console.log('true');
                    console.log('1');
                    resolve(0);
                } else {
                    console.log('false');
                    resolve(1);
                }*/
            })
            .catch(function (error) {
                console.log(error);
                resolve(2);
            });
    });
    
    //  return getMyClass();
}
async function getMyClass() {
    var MyClass
    await axios.get('https://stucis.ttu.edu.tw/selcourse/ListClassCourse.php', {
            responseType: 'arraybuffer',
            headers: {
                Cookie: cookie,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
            }
        }, {
            withCredentials: true
        })
        .then(function (myClass) {
            //console.log(myClass.data);
            MyClass = myClass;
        })
        .catch(function (error) {
            console.log(error);
        });
    return new Promise((resolve, reject) => {
        //setTimeout(function(){
        // 3 秒時間後，透過 resolve 來表示完成
        resolve(MyClass.data);
        //}, 3000);
    });
}

async function loginAndGetMyClass() {
    var MyClass
    //await login();
    await axios.get('https://stucis.ttu.edu.tw/selcourse/ListSelected.php', {
            responseType: 'arraybuffer',
            headers: {
                Cookie: cookie,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
            }
        }, {
            withCredentials: true
        })
        .then(function (myClass) {
            console.log(cookie);
            MyClass = myClass;
        })
        .catch(function (error) {
            console.log(error);
        });
    return new Promise((resolve, reject) => {
        resolve(MyClass);
    })
}

async function getMyClassDate(classId) {
    return new Promise((resolve, reject) => {
        axios.get('https://stucis.ttu.edu.tw/selcourse/SchdSbjDetail.php?SbjNo=' + classId, {
                responseType: 'arraybuffer',
                headers: {
                    Cookie: cookie,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
                }
            }, {
                withCredentials: true
            })
            .then(function (myClassData) {
                //console.log(myClass.data);
                resolve(myClassData);
            })
            .catch(function (error) {
                console.log(error);
            });
    });
}

async function passCheck() {
    await axios.get('https://stucis.ttu.edu.tw/menu/seltop.php', {
            responseType: 'arraybuffer',
            headers: {
                Cookie: cookie,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
            }
        }, {
            withCredentials: true
        })
        .then(function (myClass) {
            //console.log(myClass.data);
            setTimeout(function () {
                // 3 秒時間後，透過 resolve 來表示完成
                return;
            }, 3000);
        })
        .catch(function (error) {
            console.log(error);
            return;
        });
}