var http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request'),
    express = require('express'),
    url = 'http://www.weather.com.cn/weather/101190401.shtml';

var app = express();

app.get('/weather',function(req,res) {
    var tempArr = [];
    request(url,  function (error, response, body){
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.t li').each(function(index, el) {
                var obj = {
                    date: $(this).find('h1').text(),
                    temperature: $(this).find('.tem i').text(),
                    wind: $(this).find('.win em span').attr('title'),
                    winddeg: $(this).find('.win i').text()
                };
                // tempArr.push(JSON.stringify(obj));
                tempArr.push(obj);
            });
            res.json({datalist:tempArr});
        }
    });
    
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});