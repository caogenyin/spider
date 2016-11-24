const express = require('express'),
    fs = require('fs'),
    async = require('async');//控制并发

const app = express();

app.get('/', function(req,res) {
    res.send('Hello World!');
})

app.get('/weather/:cityname',function(req,res) {
    var weather = require('./weather/weather.js');

    weather.getWeather(req.params.cityname, function(data){
        data = JSON.parse(data);
        data = data['HeWeather data service 3.0'][0];
        res.send(data);
    });

    // 
    // weather.getWeather('101190401', function(data){
    //     data = JSON.parse(data);
    //     res.json(data);
    // });

    // weather.getWeather7Days('http://www.weather.com.cn/weather/101190401.shtml', function(data){
    //     res.json(data);
    // });
    
});

app.get('/mfw',function(req, res, next) {
    var mfw = require('./mfw/spider.js');
    res.send('数据抓取中...');
    mfw.getLinks();
    // mfw.getDetail();

    // mfw.getHtml('http://www.mafengwo.cn/wenda/', function(data){
    //     res.json(data);
    // });
    
    
    // var tempArr = [];
    // mfw.getQuestionList('http://www.mafengwo.cn/wenda/', function(data){
    //     var count = 0;
    //     data.forEach(function(item){  
    //         mfw.getDetail(item, function(data){
    //             count++;
    //             tempArr.push(data);
    //             handleFn();
    //         });
    //     });
    //     function handleFn(){
    //         if (count === data.length) {
    //             res.json({questionList:tempArr});
    //         }
    //     }
    // });
        
});

// var server = app.listen(3000, function () {
//     var host = server.address().address;
//     var port = server.address().port;

//     console.log('Example app listening at http://%s:%s', host, port);
// });
app.listen(process.env.PORT);