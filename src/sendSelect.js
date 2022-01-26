const axios = require('axios');

let cookie = ""

module.exports = {
    sendFastSelect: function (data) {
        return sendFastSelect(data);
    },
    sendFastSelectResend: function (data,delay) {
        return sendFastSelectResend(data);
    },
    setCookie: function (newCookie) {
        cookie = newCookie;
    }
}

async function sendFastSelect(data) {
    return new Promise((resolve, reject) => {
        axios.post('https://stucis.ttu.edu.tw/selcourse/FastSelect.php', "EnterSbj=" + data + "&Confirm=+%B0e%A5X+", {
                headers: {
                    Cookie: cookie,
                    "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
                }
            }, {
                withCredentials: true
            })
            .then(function (response) {
                resolve();
            })
            .catch(function (error) {
                console.log(error);
                reject();
            });
    })
}
async function sendFastSelectResend(data,delay) {
    return new Promise((resolve, reject) => {
        axios.post('https://stucis.ttu.edu.tw/selcourse/FastSelect.php', "EnterSbj=" + data + "&Confirm=+%B0e%A5X+", {
                headers: {
                    Cookie: cookie,
                    "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
                }
            }, {
                withCredentials: true,
                timeout: delay
            })
            .then(function (response) {
                resolve();
            })
            .catch(function (error) {
                
                reject();
            });
    })
}