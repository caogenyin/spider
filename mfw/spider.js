const cheerio = require('cheerio'),//Node.js版的jQuery
    superagent = require('superagent'),//客户端http请求
    fs = require('fs'),
    async = require('async');//异步流程控制，http://blog.csdn.net/marujunyy/article/details/8695205


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


// 获取问答详情
function getDetail(){
    var count = 0;
    if (fs.existsSync('./data/links.txt')) {
        fs.open('./data/links.txt', 'r', function(err, fd) {
            if (err) { throw err }
            fs.readFile('./data/links.txt', 'utf-8', function(_err, data){
                if (_err) {
                    throw _err;
                }
                var urls = data.split(',');
                // 相当于while，但其中的异步调用将在完成后才会进行下一次循环。
                async.whilst(
                    function() { return count < urls.length; },
                    function(callback) {
                        var url = urls[count];
                        // 发起请求
                        superagent.get(url)
                        .end(function (__err, sres) {
                            // if (__err) {
                            //     throw __err;
                            // }
                            console.log('正在抓取的是，'+url);
                            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后就可以得到一个实现了 jquery 接口的变量
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
                            fs.appendFileSync('./data/'+parseInt((count+1)/100)+'.txt', JSON.stringify(obj), 'utf8', '0o666', 'a');
                            setTimeout(callback, parseInt(Math.random() * 2000));
                        });
                        count++;
                    },
                    function (err, n) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('执行完毕');
                        }
                    }
                );
            });
        });
            
    } else {
        new Error('文件不存在');
    }
    
}

function getLinks(callbackFn){
    // Ajax获取问答详情链接
    function getQuestionListAjax(url,callback){
        
        // 问题链接数组
        var urlArr = [];
        // 发起请求
        superagent.get(url)
        .end(function (err, sres) {
            if (err) {
                callback(err);
            }
            try{
                console.log('正在抓取的是，'+url);
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
            }catch(e){
                throw e
            }
                
        });
        
            
    };

    var urls = [],
        totalPage = parseInt(500/20);
    for(var i = 0; i < totalPage; i++) {
      urls.push('http://www.mafengwo.cn/qa/ajax_qa/more?type=1&mddid=&tid=&sort=1&key=&page=' + i);
    }
    // 设置并发数
    async.mapLimit(urls, 10, 
        function (url, callback) {
            getQuestionListAjax(url, callback);
        }, 
        function (err, result) {
            // console.log(result);
            var detailUrls = [];
            for (var i = 0; i < result.length; i++) {
                
                if(Object.prototype.toString.call(result[i].urls) === '[object Array]' && result[i].urls.length > 0){
                    detailUrls = detailUrls.concat(result[i].urls);
                    // fs.appendFileSync('./data/links.txt', result[i].urls, 'utf8', '0o666', 'a');
                };
                if (i+1 === result.length) {
                    console.log('地址抓取结束');
                }
            }

            // 所有链接写入文件，回调获取问题详情
            fs.writeFile('./data/links.txt', detailUrls, function(err){
                if (err) throw err;
                getDetail();
            });
            
        }
    );
}
    
exports.getHtml = getHtml;
exports.getQuestionList = getQuestionList;
exports.getDetail = getDetail;
exports.getLinks = getLinks;