const https = require('https'),
	fs = require('fs'),
  async = require('async'),
	cheerio = require('cheerio');

String.prototype.trim = function() {
  let string = this.replace(/(^\s*)/g, ""); 
  string = string.replace(/(\s*$)/g, "");
  return string; 
}

var outputFilePath = __dirname + '/comments/',
  concurrencyCount = 0;

console.log('Start time(getNews): ' + new Date().toLocaleString());
getAllShopComments();

//获取批量商户的评论
function getAllShopComments() {
  let shops = '[' + fs.readFileSync("./shops/4-30.json", 'utf-8') + ']';
  let paths = []; 
  JSON.parse(shops).forEach((item, i) => {
    if (item.id <= 566006 || item.comments <= 0 || item.status == '暂停收录') {
      return;
    }
    let times = Math.ceil(item.comments / 20);  
    for (let i = 1; i <= times; i++) {
      let path = '/shop/' + item.id + '/review_more?pageno=' + i;
      paths.push(path);
    }   
  })
  async.mapLimit(paths, 2, function (path, callback) {
    getComments(path, callback);
  }, function (err, result) {
    //console.log(err)
    //console.log('final:');
    //console.log(result);
  });
}

//具体的每次请求和获取一家商户的评论
function getComments(path, callback) {
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
      "Cookie": "_hc.v=9595fa20-9f43-ae2d-1335-5e4c3f501552.1492066193; td_cookie=18446744070343997594; Hm_lvt_dbeeb675516927da776beeb1d9802bd4=1495617630; m_flash2=1; cityid=2; PHOENIX_ID=0a017918-15c3d23aee5-11da89d6; __mta=244783802.1495617482821.1495619319609.1495674372643.6; __utma=1.96008998.1495615976.1495615976.1495675229.2; __utmc=1; __utmz=1.1495675229.2.2.utmcsr=developer.dianping.com|utmccn=(referral)|utmcmd=referral|utmcct=/; pvhistory=\"6L+U5ZuePjo8L3Nob3AvNTAwMDAwL3Jldmlld19tb3JlPjo8MTQ5NTY3ODMwNjc5OF1fWw==\"; midasclick=; default_ab=shop%3AA%3A1%7Cshopreviewlist%3AA%3A1; JSESSIONID=4DC8EC440579DF0343BC7DE3624C8B91; aburl=1; cy=1; cye=shanghai",
      "Host": "www.dianping.com",     
      "Referer": "https://www.dianping.com",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
  };

  let delay = parseInt((Math.random() * 10000000) % 2000, 10);
  concurrencyCount++;
  options.path = path;
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

      outputFile = outputFilePath + $('.revitew-title a').text() + '.txt';      
      fs.writeFile(outputFile.toString(), string, {flag: 'a'}, () => {
      });
            
    });  
  }).on("error", () => {
    console.log('GET error');
  });
  setTimeout(function () {
    concurrencyCount--;
    callback(null, path);
  }, delay);
}

process.on('exit',	() => {
	console.log('End time(getNews): ' + new Date().toLocaleString() + '\n');
})

