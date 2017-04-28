let i = 0,
  curTimes = 0,
  endTimes = 10,
  steps = 2,
  start = 4;

while(curTimes < endTimes) {
  if (i == steps) {
    i = 0;   
    setTimeout(() => {
      console.log('start' + start + '\t times\t' + curTimes );
      initShopRange(start, start + steps);
    }, curTimes  * 3000);
    curTimes++;
    continue;
  }
  start++;
  i++;  
}

//批量获取商户信息
function initShopRange(start, end) {
  for (let i = start; i <= end; i++) {      
    setTimeout(() => {
      //options.path = path + i;
      //getShops(options);
      console.log(i);
    }, (i - start) * 2000);
  }  
}