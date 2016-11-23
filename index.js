const express = require('express'),
    fs = require('fs'),
    eventproxy = require('eventproxy');//控制并发

const app = express();

app.get('/', function(req,res) {
    res.send('Hello World!')
})

app.get('/weather',function(req,res) {
    var weather = require('./weather/weather.js');

    weather.getWeather7Days('http://www.weather.com.cn/weather/101190401.shtml', function(data){
        res.json(data);
    });
    
});

app.get('/mfw',function(req, res, next) {
    var mfw = require('./mfw/spider.js');

    // mfw.getHtml('http://www.mafengwo.cn/wenda/', function(data){
    //     res.json(data);
    // });
    
    // mfw.getDetail('http://www.mafengwo.cn/wenda/detail-6970376.html', function(data){
    //     res.json(data);
    // });
    

    var tempArr = [];
    mfw.getQuestionList('http://www.mafengwo.cn/wenda/', function(data){
        var count = 0;
        data.forEach(function(item){  
            mfw.getDetail(item, function(data){
                count++;
                tempArr.push(data);
                handleFn();
            });
        });
        function handleFn(){
            if (count === data.length) {
                res.json({questionList:tempArr});
            }
        }
    });
    
    // var tempArr = [],
    //     count = 0,
    //     page = 0,
    //     has_more = true;

    // function getData(page){
    //     return function(){
    //         mfw.getQuestionListAjax('http://www.mafengwo.cn/qa/ajax_qa/more?type=0&mddid=&tid=&sort=1&key=&page='+page, function(data){
    //             if (data.has_more != '1') {
    //                 has_more = false;
    //             }
    //             if (Object.prototype.toString.call(o) === '[object Array]') {}
    //             data.urls.forEach(function(item){  
    //                 mfw.getDetail(item, function(data){
    //                     count++;
    //                     tempArr.push(data);
    //                     handleFn();
    //                 });
    //             });
    //             function handleFn(){
    //                 if (count === 1000) {
    //                     // res.json({questionList:tempArr});
    //                     fs.writeFile('./data/'+page+'.txt', JSON.stringify({questionList:tempArr}), function(err){
    //                         if (err) throw err;
    //                     });
    //                     // console.log({questionList:tempArr});
    //                     tempArr = [];
    //                 }
    //             }
    //         });
    //     }
            
    // };
    // while(page<1000){
    //     (getData(page))();
    //     page++;
    // }
        
});

// var server = app.listen(3000, function () {
//     var host = server.address().address;
//     var port = server.address().port;

//     console.log('Example app listening at http://%s:%s', host, port);
// });
app.listen(process.env.PORT);