const axios = require("axios");

let cookie = "";

module.exports = {
  sendFastSelect: function (data, number) {
    return sendFastSelect(data, number);
  },
  sendFastSelectResend: function (data, delay) {
    return sendFastSelectResend(data);
  },
  setCookie: function (newCookie) {
    cookie = newCookie;
  },
};

async function sendFastSelect(data, number) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "http://10.40.60.202/",
        //"https://www.google.com",
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
          },
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      )
      .then(function (response) {
        resolve(number);
      })
      .catch(function (err) {
        reject(err);
      });
  });
  //   return new Promise((resolve, reject) => {
  //     axios
  //       .post(
  //         "https://stucis.ttu.edu.tw/selcourse/FastSelect.php",
  //         "EnterSbj=" + data + "&Confirm=+%B0e%A5X+",
  //         {
  //           headers: {
  //             Cookie: cookie,
  //             Accept:
  //               "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  //             "User-Agent":
  //               "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
  //           },
  //         },
  //         {
  //           withCredentials: true,
  //           timeout: 10000,
  //         }
  //       )
  //       .then(function (response) {
  //         resolve(number);
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
}
async function sendFastSelectResend(data, delay) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://stucis.ttu.edu.tw/selcourse/FastSelect.php",
        "EnterSbj=" + data + "&Confirm=+%B0e%A5X+",
        {
          headers: {
            Cookie: cookie,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
          },
        },
        {
          withCredentials: true,
          timeout: delay,
        }
      )
      .then(function (response) {
        resolve();
      })
      .catch(function (error) {
        reject();
      });
  });
}
