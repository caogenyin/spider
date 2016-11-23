const cheerio = require('cheerio'),//Node.js版的jQuery
    superagent = require('superagent');//客户端http请求

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

// 获取Ajax问答详情链接
function getQuestionListAjax(url,callback){
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
            var detailUrl = 'http://www.mafengwo.cn/'+$(this).find('.title a').attr('href');
            urlArr.push(detailUrl);
        });
        // 重新组装
        var resultObj = {
            has_more: tempObj.data.has_more,
            total: tempObj.data.total,
            urls: urlArr
        }
        callback(resultObj);
    });
}

// 获取问答详情
function getDetail(url,callback){
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
            answerList.push(answserItem);
        });

        obj.answers = answerList;

        // 执行回调
        callback(obj);
    });
}
    
exports.getHtml = getHtml;
exports.getQuestionList = getQuestionList;
exports.getQuestionListAjax = getQuestionListAjax;
exports.getDetail = getDetail;