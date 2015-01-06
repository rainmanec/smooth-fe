var DEFAULT = {
        nocopy: ['.*/\\.svn'],    // 路径使用/，转义使用\\
        sprite: true,
        optimize: true,
        combine: true,
        ignore: [],               // 相对路径
        ignore_s: [],
        ignore_o: [],
        ignore_c: []
    },
    pth = require('path');

var IS_WIN = process.platform.indexOf('win') === 0;

function inArray(arr, sch) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == sch) {
            return true;
        }
    }
    return false;
}

// 用target去覆盖source
// 如果数组则进行添加
function merge(source, target) {
    if (typeof source === 'object' && typeof target === 'object') {
        if (source.constructor === Array && target.constructor === Array) {
            target.forEach(function(tar) {
                if (!inArray(source, tar)) {
                    source.push(tar);
                }
            });
        } else {
            for (var key in target) {
                if (target.hasOwnProperty(key)) {
                    source[key] = merge(source[key], target[key]);
                }
            }
        }
    } else {
        source = target;
    }
    return source;
}

// 将arr中的相对路径根据uri转化为绝对路径
function normalizeUri(arr, uri) {
    if (uri[uri.length - 1] != '/' || uri[uri.length - 1] != '\\') {
        uri += '/';
    }
    for (var i = arr.length - 1; i >= 0; i--) {
        var path = arr[i];
        if (path[0] !== '/' && path[0] !== '\\' && path.indexOf(':') < 0) {
            arr[i] = pth.normalize(uri + path);
        }
    }
    return arr;
}

// 在Win中将路径中的/符号替换为正则中的"\\"
function replaceSep(uri) {
    if (IS_WIN) {
        var reg = new RegExp('/', 'g');
        if (uri.constructor === Array) {
            for (var i = uri.length - 1; i >= 0; i--) {
                uri[i] = uri[i].replace(reg, pth.sep + pth.sep);
            }
        } else {
            uri = uri.replace(reg, rpl);
        }
        return uri;
    } else {
        return uri;
    }
}


var Config = function(uri) {
    uri = uri || process.cwd();
    this.uri = uri;
    this._init();
};

Config.prototype = {
    _init: function() {
        this.data = merge({},
        DEFAULT);
        this._normalizeUri();
    },
    _normalizeUri: function(paths) {
        normalizeUri(this.data.ignore, this.uri);
        merge(normalizeUri(this.data.ignore_c, this.uri), this.data.ignore);
        merge(normalizeUri(this.data.ignore_o, this.uri), this.data.ignore);
        merge(normalizeUri(this.data.ignore_s, this.uri), this.data.ignore);
        this.data.reg_nocopy = (this.data.nocopy.length > 0) ? new RegExp('(?:' + replaceSep(this.data.nocopy).join('|') + ')$', 'i') : false;
    },
    get: function(path, def) {
        var result = this.data; 
        (path || '').split('.').forEach(function(key) {
            if (key && (typeof result !== 'undefined')) {
                result = result[key];
            }
        });
        if (typeof result === 'undefined') {
            return def;
        } else {
            return result;
        }
    },
    set: function(path, value) {
        var paths = path.split('.'),
        last = paths.pop(),
        data = this.data;
        paths.forEach(function(key) {
            var type = typeof data[key];
            if (type === 'object') {
                data = data[key];
            } else if (type === 'undefined') {
                data = data[key] = {};
            } else {
                console.error('forbidden to set property[' + key + '] of [' + type + '] data');
            }
        });
        data[last] = value;
    },
    merge: function(cfg) {
        if (typeof cfg === 'object') {
            this.data = merge(this.data, cfg);
        } else {
            console.error('unable to merge data[' + arg + '].');
        }
        this._normalizeUri();
    }
};
module.exports = Config;