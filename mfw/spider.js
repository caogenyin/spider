const cheerio = require('cheerio'),//Node.js版的jQuery
    superagent = require('superagent'),//客户端http请求
    fs = require('fs'),
    async = require('async');//控制并发


function getHtml(url,callback) {
    // 发起请求
    superagent.get(url)
    .end(function (err, sres) {
        if (err) {
            callback(err);
        }
        callback(sres.text);
    });
}

// 获取问答详情链接
function getQuestionList(url,callback){
    // 问题链接数组
    var urlArr = [];
    // 发起请求
    superagent.get(url)
    .end(function (err, sres) {
        if (err) {
            callback(err);
        }
        var $ = cheerio.load(sres.text);
        // 遍历问题列表
        $('._j_pager_box .item').each(function(index, el) {
            var detailUrl = 'http://www.mafengwo.cn/'+$(this).find('.title a').attr('href');
            urlArr.push(detailUrl);
        });
        callback(urlArr);
    });
}

var count = 0;
// 获取问答详情
function getDetail(){
    var fetchUrl = function (url, callback) {
        console.log('正在抓取的是', url);
        // 发起请求
        superagent.get(url)
        .end(function (err, sres) {
            if (err) {
                callback(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量
            var $ = cheerio.load(sres.text),
            // 答案列表数组
            answerList = [],
            // 问题详情
            obj = {
                title: $('.q-content h1').text(),
                location: $('.q-content .location').text(),
                nickname: $('.q-content .pub-bar .name').text(),
                avatar: $('.q-content .pub-bar .photo img').attr('src'),
                createtime: $('.q-content .pub-bar .time').text(),
            };
            // 遍历答案列表
            $('.answer-list .answer-item').each(function(index, el) {
                var answserItem = {
                    nickname: $(this).find('.answer-content .user-bar .name').text(),
                    avatar: $(this).find('.answer-user .photo').attr('src'),
                    diggs: $(this).find('.answer-user .btn-zan span').text(),
                    content: $(this).find('._j_answer_html').text()
                };
                answerList.push(JSON.stringify(answserItem));
            });

            obj.answers = answerList;
            // resultArray.push(JSON.stringify(obj));
            // 执行回调
            callback(null, JSON.stringify(obj));
        });
    };
    fs.readFile('./data/links.txt', 'utf-8', function(err, data){
        if (err) throw err;
        var urls = data.split(',');
        async.mapLimit(urls, 10, 
            function (url, callback) {
                fetchUrl(url, callback);
            }, 
            function (err, result) {
                // console.log(result)
                fs.writeFile('./data/a.txt', result, function(err){
                    if (err) throw err;
                });
                
            }
        );
    });
    
}

function getLinks(){
    // Ajax获取问答详情链接
    function getQuestionListAjax(url,callback){
        console.log('正在抓取的是', url);
        // 问题链接数组
        var urlArr = [];
        // 发起请求
        superagent.get(url)
        .end(function (err, sres) {
            if (err) {
                callback(err);
            }
            var tempObj = JSON.parse(sres.text);
            var $ = cheerio.load(tempObj.data.html);
            // 遍历问题列表，提取详情链接
            $('.item').each(function(index, el) {
                var detailUrl = 'http://www.mafengwo.cn'+$(this).find('.title a').attr('href');
                urlArr.push(detailUrl);
            });
            // 重新组装
            var resultObj = {
                has_more: tempObj.data.has_more,
                total: tempObj.data.total,
                urls: urlArr
            }
            callback(null, resultObj);
        });
        
            
    };

    var urls = [],
        totalPage = parseInt(25804/20);
    for(var i = 0; i < 25; i++) {
      urls.push('http://www.mafengwo.cn/qa/ajax_qa/more?type=0&mddid=&tid=&sort=1&key=&page=' + i);
    }

    async.mapLimit(urls, 5, 
        function (url, callback) {
            getQuestionListAjax(url, callback);
        }, 
        function (err, result) {
            var detailUrls = [];
            for (var i = 0; i < result.length; i++) {
                if(Object.prototype.toString.call(result[i].urls) === '[object Array]' && result[i].urls.length > 0){
                    detailUrls = detailUrls.concat(result[i].urls);
                };
            }

            fs.writeFile('./data/links.txt', detailUrls, function(err){
                if (err) throw err;
            });
            
        }
    );
}
    
exports.getHtml = getHtml;
exports.getQuestionList = getQuestionList;
exports.getDetail = getDetail;
exports.getLinks = getLinks;