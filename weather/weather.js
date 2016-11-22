var http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request'),
    express = require('express'),
    url = 'http://www.weather.com.cn/weather/101190401.shtml';


var requestUrl = function (url) {
    http.get(url, function (res) {
        var html = '',
            tempArr = [];

        res.on('data', function(chunk) {
            html += chunk;
        });

        res.on('end', function() {
            var $ = cheerio.load(html);
            $('.t li').each(function(index, el) {
                var obj = {
                    date: $(this).find('h1').text(),
                    temperature: $(this).find('.tem i').text(),
                    wind: $(this).find('.win em span').attr('title'),
                    winddeg: $(this).find('.win i').text()
                };
                tempArr.push(JSON.stringify(obj));
            });
            // return '['+tempArr+']';
            // console.log('['+tempArr+']');
            // fs.appendFile('./data/weather.txt', tempArr, 'utf-8', function (err) {
            //     if (err) {
            //         console.log(err);
            //     }
            // });
            var app = express();

            app.get('/',function(req,res) {
                res.send('['+tempArr+']');
            });

            var server = app.listen(3000, function () {
              var host = server.address().address;
              var port = server.address().port;

              console.log('Example app listening at http://%s:%s', host, port);
            });
        });
    });
};

var app = express();

app.get('/',function(req,res) {
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
                tempArr.push(JSON.stringify(obj));
            });
            res.send('{data:['+tempArr+']}');
        }
    });
    
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});