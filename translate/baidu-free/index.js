var fetch = require('isomorphic-fetch');
var querystring = require('querystring');
var languages = require('../util/languages');

var host = 'http://fanyi.baidu.com/v2transapi';

var langs = {
    'auto' : 'auto',	//自动检测
    'zh-cn' : 'zh',	//中文
    'en' : 'en',	//英语
    'yue' : 'yue',	//粤语
    'wyw' : 'wyw',	//文言文
    'ja' : 'jp',	//日语
    'ko' : 'kor',	//韩语
    'fr' : 'fra',	//法语
    'es' : 'spa',	//西班牙语
    'th' : 'th',	//泰语
    'ar' : 'ara',	//阿拉伯语
    'ru' : 'ru',	//俄语
    'pt' : 'pt',	//葡萄牙语
    'de' : 'de',	//德语
    'it' : 'it',	//意大利语
    'el' : 'el',	//希腊语
    'nl' : 'nl',	//荷兰语
    'pl' : 'pl',	//波兰语
    'bg' : 'bul',	//保加利亚语
    'et' : 'est',	//爱沙尼亚语
    'da' : 'dan',	//丹麦语
    'fi' : 'fin',	//芬兰语
    'cs' : 'cs',	//捷克语
    'ro' : 'rom',	//罗马尼亚语
    'sl' : 'slo',	//斯洛文尼亚语
    'sv' : 'swe',	//瑞典语
    'hu' : 'hu',	//匈牙利语
    'zh-tw' : 'cht',	//繁体中文
    'vi' : 'vie'	//越南语
};


function translate(query, opts) {

    opts = opts || {};

    var e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(langs, lang)) {
            e = new Error();
            e.code = 400;
            e.message = 'The language \'' + lang + '\' is not supported';
        }
    });
    if (e) {
        return new Promise(function (resolve, reject) {
            reject(e);
        });
    }

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    var from = languages.getValue(langs, opts.from);
    var to = languages.getValue(langs, opts.to);

    var data = {
        query: query,
        from: from,
        to: to,
        transtype: 'translang',
        simple_means_flag: '3'
    };

    return new Promise(function (resolve, reject) {
        fetch(host + '?' + querystring.stringify(data), {timeout: 10000})
            .then(function (res) {
                if (res.status !== 200) {
                    throw new Error('request to ' + host + ' failed, status code = ' + res.status + ' (' + res.statusText + ')');
                }
                return res.text();
            }).then(function (value) {
            try {
                var res = JSON.parse(value);

                res = res.trans_result;

                var dst = res.data[0].dst;
                for (var i = 1; i < res.data.length; i++) {
                    dst = dst + '\n' + res.data[i].dst;
                }

                var result = {
                    text: dst,
                    from: languages.getCodeByValue(langs, res.from),
                    to: languages.getCodeByValue(langs, res.to),
                    raw: '',
                    tts: '',
                    engine: 'BaiduFree'
                };

                if (opts.raw) {
                    result.raw = res;
                }

                var data = [];
                data.push(result);
                resolve(data);
            } catch (error) {
                e = new Error();
                e.code = 400;
                e.message = 'Baidu free translate  not work';
                reject(e);
            }
        });
    });
}

function isSupported(opts) {

    opts = opts || {};

    var flag = true;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(langs, lang)) {
            flag = false;
        }
    });
    return flag;
}

module.exports = translate;
module.exports.isSupported = isSupported;