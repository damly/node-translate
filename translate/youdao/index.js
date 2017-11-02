var fetch = require('isomorphic-fetch');
var querystring = require('querystring');
var MD5 = require('../util/md5');
var languages = require('../util/languages');

var host = 'http://openapi.youdao.com/api';
var appid = '应用id';
var key = '应用key';

var langs = {
    'auto': 'auto',
    'zh-cn': 'zh-CHS',
    'en': 'EN',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'ru': 'ru',
    'pt': 'pt',
    'es': 'es'
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

    var salt = (new Date).getTime();

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    var from = languages.getCode(langs,opts.from);
    var to = languages.getCode(langs,opts.to);

    var str1 = appid + query + salt + key;
    var sign = MD5(str1);

    var data = {
        q: query,
        from: from,
        to: to,
        sign: sign,
        salt: salt,
        appKey: appid,
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
                if(res.errorCode != 0) {
                    throw new Error('youdao return error code: '+res.errorCode);
                }

                var from = res.l.split('2')[0];

                var result = {
                    text: res.translation[0],
                    from: languages.getCodeByValue(langs, from),
                    raw: '',
                    tts: '',
                    engine: 'Youdao'
                };

                if (opts.raw) {
                    result.raw = res;
                }
                var data = [];
                data.push(result);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    });
}

module.exports = translate;
