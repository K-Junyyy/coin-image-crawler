# 암호화폐 심볼 이미지 크롤러

[코인랭킹 사이트](https://coinranking.com/) (https://coinranking.com/)

![image](https://user-images.githubusercontent.com/74912530/178154317-16ce6d97-b518-42ee-814d-144acb1bb5cb.png)


## 📚 필요한 라이브러리
```
const cheerio = require("cheerio");
const request = require("request");
const axios = require("axios");
const fs = require("fs");
```
cheerio : HTML 파싱  
request : HTML 요청  
axios : 이미지 다운로드 요청  
fs : 로컬에 파일 생성  

## 🚀 Request 요청 보내기
```
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
```
HTML 요청 보내기

## 🔍 크롤링
```
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
```

![image](https://user-images.githubusercontent.com/74912530/178154727-ab9c1cda-9b3c-4237-839b-4f4ac24b1685.png)

테이블의 열들을 크롤링하면서 코인이름, 코인심볼, 이미지소스를 객체형식으로 coinList 배열에 담도록 하였습니다.

## 📁 크롤링 후 이미지 다운
```
const start = async () => {
  // 코인정보 크롤링
  for (let i = 0; i < 1; i++) {
    await crawler(coinrankingUrl + i);
  }
  console.log(coinList);

  // 이미지 다운로더
  for (let i = 0; i < coinList.length; i++) {
    const imgResult = await axios.get(coinList[i].src, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(`coin/${coinList[i].coinCode}.png`, imgResult.data);
  }
};
```

위 코드는 1페이지만 크롤링하여 이미지들을 다운로드하게 하였습니다.

![image](https://user-images.githubusercontent.com/74912530/178154647-e0d6485e-6d45-4bef-86e7-2a49d285e005.png)

coinranking 사이트의 경우 현재(2022-07-11) 296페이지까지 있으므로  
for문의 coinList.length 부분을 297로 바꿔주시면 모든 페이지의 코인 이미지들을 다운로드할 수 있습니다.  


#### <크롤러 실행 후 1페이지의 코인들의 이미지를 폴더에 저장한 결과물>

![image](https://user-images.githubusercontent.com/74912530/178154591-8ec9f428-b807-4fea-a017-bc635f155335.png)




