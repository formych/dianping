const https = require('https'),
	fs = require('fs'),
	cheerio = require('cheerio');

String.prototype.trim = function() {
  let string = this.replace(/(\n)/g, "");
  string = string.replace(/(^\s*)/g, ""); 
  string = string.replace(/(\s*$)/g, "");
  return string; 
}

var flag = true, //判断是否第一次请求
	outputFilePath = __dirname + '/shops/',
  path = '/search/category/2/10/p',
  options = {
    hostname: 'www.dianping.com',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      //"Accept-Encoding": "gzip, deflate, sdch, br",
			"Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
			"Cache-Control": "max-age=0",
      "Connection": "keep-alive",
      "Cookie": "JSESSIONID=670922103E5C28804BE772761987C853;Path=/;Domain=.dianping.com;Expires=Wed, 25-Apr-2018 02:44:31 GMT;PHOENIX_ID=0a0166bb-15ba2fefa06-cc98e4;=",
			"Host": "www.dianping.com",			
			"Referer": "https://www.dianping.com/shop/21171398/review_more",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    }
  };

console.log('Start time(getNews): ' + new Date().toLocaleString());


options.path = path + 1;
getShopsByCategory(options);

function getShopsByCategory(options) {
	let string = ''
  try {
		https.get(options, (res) => {
      if (res.statusCode !== 200) {
        console.log('状态码：', res.statusCode + '\t');
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
          data += chunk;
      });
      res.on("end", () => {
	    	let $ = cheerio.load(data),          
					$imgs = $('#shop-all-list li img'),
          $comment = $('.comment .review-num b'),
          $price = $('.comment .mean-price b'),
          $addr = $('.tag-addr'),
          size = $imgs.length;        
        for ( let i = 0; i < size; i++) {
          let shop = {
            id: $imgs[i].parent.attribs.href.split('/')[2],
            name: $imgs[i].attribs.title,
            img: $imgs[i].attribs['data-src'],
            comments: $comment[i].children[0].data,
            avePrice: $price[i].children[0].data,
            cuisine: $addr[i].children[1].children[0].children[0].data,
            address: $addr[i].children[5].children[0].children[0].data + '/' + $addr[i].children[7].children[0].data
          }
          if (flag && i === 0) {
            string += JSON.stringify(shop, null, '\t');
          } else {
            string += ',' + JSON.stringify(shop, null, '\t');
          }          
        }
    
        if (flag) {
          let categoryName = $('.J_bread span span').text(),
            $a = $('.page a').last().prev(), 
            pageEnd = $a.text();

          outputFile += categoryName + '.json';                 

          for (let i = 2; i <= pageEnd; i++) {
            setTimeout(() => {
              options.path =path + i;
              getShopsByCategory(options);
            }, i * 3000);
          }
          flag = false;
        }
 
        fs.writeFile(outputFile, string, {flag: 'a'}, () => {
        });    		
    	});
     	res.on("error", () => {
        console.log('GET error');
      });
    });
  } catch (e) {
  } finally {
  }
}

process.on('exit',	() => {
	console.log('End time(getNews): ' + new Date().toLocaleString() + '\n');
})
