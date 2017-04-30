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
  now = new Date(), 
  outputFile = outputFilePath + (now.getMonth() + 1) + '-' + now.getDate() + '.json',
  path = '/shop/';

console.log('Start time(getNews): ' + new Date().toLocaleString());

//main
initShopRange(503489, 600000);
//options.path = '/shop/500002';
//getShops(options);

setTimeout(() => {

});

//批量获取商户信息
function initShopRange(start, end) {
    for (let i = start; i <= end; i++) {
      setTimeout(() => {
        let path = '/shop/' + i;
        getShops(path);
        console.log(i);
      }, (i - start) * 4000);
    }  
}

//获取单个商户信息
function getShops(path) {
	let string = '',
    shopName = '',
    options = '';
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
      "Cookie": "_hc.v=9595fa20-9f43-ae2d-1335-5e4c3f501552.1492066193; __utma=205923334.947511846.1493103322.1493113818.1493203660.3; __utmb=205923334.4.10.1493203660; __utmc=205923334; __utmz=205923334.1493103322.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); td_cookie=18446744071715954064; JSESSIONID=B149926DE868EC83E310FE2002310304; cy=2; cye=beijing; Path=/;Domain=.dianping.com;Expires=Wed, 26-Apr-2018 02:44:31 GMT;=",
      "Host": "www.dianping.com",     
      "Referer": "http://www.dianping.com/",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    }
  };
  options.path = path;
  try {
		https.get(options, (res) => {
      if (res.statusCode !== 200) {
        console.log('状态码：', res.statusCode + '\t' + options.path);
        return;
      } 
      let data = '';
      res.on('data', (chunk) => {
          data += chunk;
      });
      res.on("end", () => {
	    	let $ = cheerio.load(data),          
					$title = $('title');                  

        //判断商户是否存在 
        if ($title.text().indexOf('404') != -1) {
          return;
        }
        let ids = $('link[rel="canonical"]').attr('href').split('/'),
          status = '正常',
	  province = '',
	  city = '';
        if ($('.shop-closed').length) {
          status = '暂停收录';
        }
	if ( $('meta[name="location"]').length) {
		province =  $('meta[name="location"]').attr('content').split(';')[0].split('=')[1];
	}
	if ($('meta[name="location"]').length) {
		city = $('meta[name="location"]').attr('content').split(';')[1].split('=')[1];
	}
        let shop = {
          id: ids[ids.length - 1],
          name: $('meta[itemprop="name"]').attr('content'),
          img: $('meta[itemprop="image"]').attr('content'),
          comments: $('#reviewCount').text().replace(/(条评论)/g, ""),
          avePrice: $('#avgPriceTitle').text(),
          province: province,         
          city: city,
          //location: $('.breadcrumb a')[1].children[0].data.trim(),
          address: $('.expand-info.address .item').text().trim(),
          //cuisine: $('.breadcrumb a')[2].children[0].data.trim(),
          status: status
        }          
    
        if (flag) {          
          string += JSON.stringify(shop, null, '\t');
          flag = false;          
        } else {
          string += ',\n' + JSON.stringify(shop, null, '\t');
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
