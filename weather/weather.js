var cheerio = require('cheerio'),
    superagent = require('superagent'),//客户端http请求
    request = require('request');

// function getWeather(cityid, callback){
//     request('http://www.weather.com.cn/data/sk/'+cityid+'.html',  function (error, response, body){
//         if (!error && response.statusCode == 200) {
//             callback(body);
//         }
//     });
// }

function getWeather(cityName, callback){
    superagent.get('http://apis.baidu.com/heweather/weather/free')
       .set('apikey', 'ca9daf96668f4dc812d5e8bc8b602bb3')
       .query({ city: cityName })
       .end(function(err, res){
        callback(res.text);
       });
}


function getWeather7Days(url,callback) {
    
    var tempArr = [];
    request(url,  function (error, response, body){
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.t li').each(function(index, el) {
                var obj = {
                    date: $(this).find('h1').text(),
                    temperature: $(this).find('.tem i').text(),
                    wind: $(this).find('.win em span').attr('title'),
                    windlevel: $(this).find('.win i').text()
                };
                tempArr.push(obj);
            });
            callback({dataList:tempArr});
            // return {dataList:tempArr};
        }
    });
}
    
exports.getWeather = getWeather;
exports.getWeather7Days = getWeather7Days;