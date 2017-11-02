function getCode(langs, desiredLang) {
    if (!desiredLang) {
        return false;
    }
    desiredLang = desiredLang.toLowerCase();

    if (langs[desiredLang]) {
        return desiredLang;
    }

    var keys = Object.keys(langs).filter(function (key) {
        if (typeof langs[key] !== 'string') {
            return false;
        }

        return key.toLowerCase() === desiredLang;
    });

    return keys[0] || false;
}

function getCodeByValue(langs,value) {
    value = value.toLowerCase();

    for (var a in langs) {
        if(langs[a].toLowerCase() === value)
            return a;
    }
}

function getValue(langs, desiredLang) {
    if (!desiredLang) {
        return false;
    }
    desiredLang = desiredLang.toLowerCase();

    if (langs[desiredLang]) {
        return langs[desiredLang];
    }

    var keys = Object.keys(langs).filter(function (key) {
        if (typeof langs[key] !== 'string') {
            return false;
        }

        return langs[key].toLowerCase() === desiredLang;
    });

    return keys[0] || false;
}

function isSupported(langs,desiredLang) {
    return Boolean(getCode(langs, desiredLang));
}

module.exports.isSupported = isSupported;
module.exports.getCode = getCode;
module.exports.getValue = getValue;
module.exports.getCodeByValue = getCodeByValue;