const https = require('https'),
	fs = require('fs'),
	cheerio = require('cheerio');

String.prototype.trim = function() {
  let string = this.replace(/(^\s*)/g, ""); 
  string = string.replace(/(\s*$)/g, "");
  return string; 
}

var outputFilePath = __dirname + '/comments/',
  waitTime = 0,
start = 0; 


console.log('Start time(getNews): ' + new Date().toLocaleString());
getAllShopComments();

//这个是获取单个商户的评论数据
// let path = '/shop/21171398/review_more?pageno='
// getComments(true, path);

//获取批量商户的评论
function getAllShopComments() {
  let shops = '[' + fs.readFileSync("./shops/4-26.json", 'utf-8') + ']';
  console.log('条数' + '\t次数\t' + '时间');
  JSON.parse(shops).forEach((item, i) => {
    if (item.comments <= 0 || item.status == '暂停收录') {
      return;
    }
    if (start == 0) {
      waitTime = 0;
    } else {
      waitTime += Math.ceil(item.comments / 20);      
    }
    start++;    
    console.log(i + '\t' + start + '\t' + waitTime);
    
    setTimeout(() => {
      let flag = true,
        path = '/shop/' + item.id + '/review_more?pageno=';
      getComments(flag, path);
    }, waitTime * 3000 + 10);          
  })
}

//具体的每次请求和获取一家商户的评论
function getComments(flag, path, outputFile) {
  let options = {};
  options = {
    hostname: 'www.dianping.com',
    port: 443,
    path: '',
    method: 'GET',
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      //"Accept-Encoding": "gzip, deflate, sdch, br",
      "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
      "Cache-Control": "max-age=0",
      "Connection": "keep-alive",
      "Cookie": "td_cookie=18446744071615745163; navCtgScroll=0; navCtgScroll=200; _hc.v=9595fa20-9f43-ae2d-1335-5e4c3f501552.1492066193; __utma=205923334.947511846.1493103322.1493103322.1493103322.1; __utmc=205923334; __utmz=205923334.1493103322.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); td_cookie=18446744071615537927; PHOENIX_ID=0a01084a-15ba3e56373-1621df7; __mta=43245338.1493103998106.1493107595836.1493113069705.3; .asck=EEC0A45D2B7542F1E6D2589DC83BD8E2; s_ViewType=10; JSESSIONID=0905884F3CBA739E62912B4DC2C567FA; aburl=1; cy=2; cye=beijing;Path=/;Domain=.dianping.com;Expires=Wed, 25-Apr-2018 02:44:31 GMT;=",
      "Host": "www.dianping.com",     
      "Referer": "https://www.dianping.com/shop/21171398/review_more",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    }
  };
  if (flag) {
    options.path = path + 1;
  } else {
    options.path = path;
  }
  console.log(options.path);
  https.get(options, (res) => {
    let data = '',
      string = '';
    if (res.statusCode !== 200) {
      console.log('状态码：', res.statusCode + '\t' + options.path);
      return;
    }    
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on("end", () => {
      let $ = cheerio.load(data),          
        $comments = $('.J_brief-cont');

      $comments.each((key, value) => {
        if (key == $comments.length - 1) {
          string += value.children[0].data.trim() + '\n'; 
        } else {
          string += value.children[0].data.trim() + '\n';
        }      
      });

      if (flag) {
        flag = false;
        let pageEnd = $('.Pages .Pages a').last().prev().text();
        outputFile = outputFilePath + $('.revitew-title a').text() + '.txt';
        if (pageEnd) {
          for (let i = 2; i <= pageEnd; i++) {
            setTimeout(() => {
              getComments(flag, path + i, outputFile);
            }, (i - 1) * 2000);
          }
        }        
      }      
      fs.writeFile(outputFile.toString(), string, {flag: 'a'}, () => {
      });
            
    });  
  }).on("error", () => {
    console.log('GET error');
  });
}

process.on('exit',	() => {
	console.log('End time(getNews): ' + new Date().toLocaleString() + '\n');
})

