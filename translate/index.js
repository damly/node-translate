var youdao = require('./youdao');
var baidu = require('./baidu');
var googleFree = require('./google-free');
var baiduFree = require('./baidu-free');

var engine = {
    'BAIDU': baiduFree,
    'GOOGLE': googleFree,
    'BAIDUA': baidu,
    'YOUDAO': youdao
};

function useAllEngine(text, opts) {
    var ps = [];
    for (var key in engine) {
        ps.push(new Promise(function  (resolve,reject) {
            var opts0 = opts;

            engine[key](text, opts0).then(function (value) {
                resolve(value);
            }).catch(function (e) {
                resolve([])
            })
        }));
    }

    return new Promise(function (resolve, reject) {
        Promise.all(ps).then(function (value) {
            if(value.length == 0) {
                var e = new Error();
                e.code = 400;
                e.message = 'Translate result is null';
                reject(e)
            }
            else {
                var data = [];
                for(var a in value) {
                    data = data.concat(value[a])
                }
                resolve(data);
            }
        }).catch(function (e) {
            reject(e)
        })
    });
}

function autoSelectEngine(text, opts) {

    for (var key in engine) {
        if(engine[key].isSupported(opts)) {
            return engine[key](text, opts);
        }
    }

    var e = new Error();
    e.code = 400;
    e.message = 'The engine \'' + opts.form +' to '+ opts.to + '\' is not supported';

    return new Promise(function (resolve, reject) {
        reject(e);
    });
}

function translate(text, opts) {
    var code = opts.engine || 'BAIDU';

    var key = code.toUpperCase();

    if (key === 'ALL') {
        return useAllEngine(text, opts)
    }
    else if (key === 'AUTO') {
        return autoSelectEngine(text, opts);
    }

    for (var a in engine) {
        if (a.toUpperCase() === key) {
            return engine[key](text, opts);
        }
    }

    var e = new Error();
    e.code = 400;
    e.message = 'The engine \'' + code + '\' is not supported';

    return new Promise(function (resolve, reject) {
        reject(e);
    });
}

module.exports = translate;
