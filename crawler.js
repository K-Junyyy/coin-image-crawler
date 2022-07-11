const cheerio = require("cheerio");
const request = require("request");
const axios = require("axios");
const fs = require("fs");

const delay = (t) => {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
};

// API url
let coinrankingUrl = "https://coinranking.com/?page=";

let count = 0;
let coinList = [];

// url request
const doRequest = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (error, res) => {
      // console.log(res.data);
      if (!error && res.statusCode === 200) {
        resolve(res);
      } else {
        reject(error);
      }
    });
  });
};

const crawler = async (url) => {
  let res = await doRequest(url);
  let $ = cheerio.load(res.body);

  let coin = {};

  let promises = $("tbody tr").map((i, tr) => {
    let coin = {};
    $(tr)
      .find("td div span")
      .map((i, span) => {
        switch (i) {
          case 1:
            coin["id"] = count++;
            break;
          case 2:
            coin["src"] = $(span).find("img").attr("src");
            break;
          case 3:
            coin["coinName"] = $(span).find("a").text().trim();
            coin["coinCode"] = $(span).find("span").text().trim();
            break;
          default:
            break;
        }
      });
    if (coin.id) {
      coinList.push(coin);
    }
  });
};

// 이미지 다운로더
const downloadImg = async () => {
  for (let i = 0; i < coinList.length; i++) {
    const { coinName, coinCode, src } = coinList[i];
    const imgResult = await axios.get(src, {
      responseType: "arraybuffer",
    });

    let fileExtension = "";

    if (src.includes("svg")) {
      fileExtension = "svg";
    } else if (src.includes("png")) {
      fileExtension = "png";
    } else if (src.includes("jpg")) {
      fileExtension = "jpg";
    }

    if (imgResult.data) {
      fs.writeFileSync(
        `coin/${coinList[i].coinCode}.${fileExtension}`,
        imgResult.data
      );
    } else {
      console.log(coinCode + " 누락");
    }
  }
};

const start = async () => {
  // 코인정보 크롤링
  for (let i = 0; i < 1; i++) {
    await crawler(coinrankingUrl + i);
  }

  downloadImg();
};

start();
