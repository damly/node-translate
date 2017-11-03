var url = require('url');
var querystring = require('querystring');
var safeEval = require('safe-eval');
var fetch = require('isomorphic-fetch');
var configstore = require('configstore');
var languages = require('../util/languages');

var host = 'http://translate.google.cn';

var langs = {
    'auto': 'Automatic',
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'ny': 'Chichewa',
    'zh-cn': 'Chinese Simplified',
    'zh-tw': 'Chinese Traditional',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'ko': 'Korean',
    'ku': 'Kurdish (Kurmanji)',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ma': 'Punjabi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan',
    'gd': 'Scots Gaelic',
    'sr': 'Serbian',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
};



var config = new configstore('translate-api');

var window = {
    TKK: config.get('TKK') || '0'
};

function XL (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = d >= 'a' ? d.charCodeAt(0) - 87 : Number(d);
        d = b.charAt(c + 1) == '+' ? a >>> d : a << d;
        a = b.charAt(c) == '+' ? a + d & 4294967295 : a ^ d;
    }
    return a;
}

function token(text, key) {
    var a = text, b = key, d = b.split('.');
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var m = a.charCodeAt(g);
        128 > m ? e[f++] = m : (2048 > m ? e[f++] = m >> 6 | 192 : (55296 == (m & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023),
            e[f++] = m >> 18 | 240,
            e[f++] = m >> 12 & 63 | 128) : e[f++] = m >> 12 | 224,
            e[f++] = m >> 6 & 63 | 128),
            e[f++] = m & 63 | 128);
    }
    a = b;
    for (f = 0; f < e.length; f++) {
        a += e[f];
        a = XL(a, '+-a^+6');
    }
    a = XL(a, '+-3^+b+-f');
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a = a % 1E6;
    return a.toString() + '.' + (a ^ b);
};

function key() {
    return new Promise(function (resolve, reject) {
        var now = Math.floor(Date.now() / 3600000);

        if (Number(window.TKK.split('.')[0]) === now) {
            resolve(window.TKK);
        }
        else {
            fetch(host, {
                timeout: 10000
            })
                .then(function (res) {
                    if (res.status !== 200) {
                        throw new Error('request to ' + host + ' failed, status code = ' + res.status + ' (' + res.statusText + ')');
                    }
                    return res.text();
                })
                .then(function (html) {
                    var TKK = null;

                    try {
                        eval(html.match(/TKK=eval\(\'\(.*\)\'\);/g)[0]);  // TKK = '405291.1334555331'
                        if (TKK === null)
                            reject(null);
                    } catch (e) {
                        reject(new Error('get key failed from google'));
                    }

                    if (typeof TKK !== 'undefined') {
                        window.TKK = TKK;
                        config.set('TKK', TKK);
                    }

                    resolve(window.TKK);
                });
        }
    });
}

function tts(text, key, lang, speed) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new TypeError('text should be a string');
  }

  // if (text.length > 200) {
  //   throw new RangeError('text length (' + text.length + ') should be less than 200 characters');
  // }

  if (typeof key !== 'string' || key.length === 0) {
    throw new TypeError('key should be a string');
  }

  if (typeof lang !== 'undefined' && (typeof lang !== 'string' || lang.length === 0)) {
    throw new TypeError('lang should be a string');
  }

  if (typeof speed !== 'undefined' && typeof speed !== 'number') {
    throw new TypeError('speed should be a number');
  }

  return host + '/translate_tts' + url.format({
    query: {
      ie: 'UTF-8',
      q: text,
      tl: lang || 'en',
      total: 1,
      idx: 0,
      textlen: text.length,
      tk: token(text, key),
      client: 't',
      prev: 'input',
      ttsspeed: speed || 1
    }
  });
};



function trans(key, text, opts) {
    opts = opts || {};

    var e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(langs,lang)) {
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

    opts.speed = opts.speed || 1;

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    var from = languages.getCode(langs,opts.from);
    var to = languages.getCode(langs,opts.to);


    var url = host + '/translate_a/single';
    var data = {
        client: 't',
        sl: from,
        tl: to,
        hl: to,
        dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text,
        tk: token(text, key),
    };

    return fetch(url + '?' + querystring.stringify(data), {timeout: 10000})
        .then(function (res) {
            if (res.status !== 200) {
                throw new Error('request to ' + host + ' failed, status code = ' + res.status + ' (' + res.statusText + ')');
            }
            return res.text();
        }).then(function (res) {
            var result = {
                text: '',
                from: '',
                to: to,
                raw: '',
                tts: '',
                engine: 'GoogleFree'
            };

            if (opts.raw) {
                result.raw = res;
            }

            var body = safeEval(res);
            body[0].forEach(function (obj) {
                if (obj[0]) {
                    result.text += obj[0];
                }
            });

            if (body[2] === body[8][0][0]) {
                result.from = body[2].toLowerCase();
            } else {
                result.from = body[8][0][0].toLowerCase();
            }

            result.tts = tts(result.text, key, opts.to, opts.speed);

            var data = [];
            data.push(result);

            return data;
        });
}

function translate(text, opts) {
    return key().then(function (key) {
        return trans(key, text, opts);
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