
function getWeather7Days(url,callback) {
    var cheerio = require('cheerio'),
        request = require('request');
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
    
exports.getWeather7Days = getWeather7Days;