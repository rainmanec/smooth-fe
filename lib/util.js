var fs = require('fs'),
    pth = require('path'),
    crypto = require('crypto'),
    _exists = fs.existsSync || pth.existsSync,
    iconv;

var IS_WIN = process.platform.indexOf('win') === 0;

var TEXT_FILE_EXTS = [
        'css', 'tpl', 'js', 'php',
        'txt', 'json', 'xml', 'htm',
        'text', 'xhtml', 'html', 'md',
        'conf', 'po', 'config', 'tmpl',
        'coffee', 'less', 'sass', 'jsp',
        'scss', 'manifest', 'bak', 'asp',
        'tmp', 'haml', 'jade', 'aspx',
        'ashx', 'java', 'py', 'c', 'cpp',
        'h', 'cshtml', 'asax', 'master',
        'ascx', 'cs', 'ftl', 'vm', 'ejs',
        'styl', 'jsx', 'handlebars'
    ],
    IMAGE_FILE_EXTS = [
        'svg', 'tif', 'tiff', 'wbmp',
        'png', 'bmp', 'fax', 'gif',
        'ico', 'jfif', 'jpe', 'jpeg',
        'jpg', 'woff', 'cur', 'webp',
        'swf', 'ttf', 'eot'
    ];

var textFileTypeReg = new RegExp('\\.(?:' + TEXT_FILE_EXTS.join('|') + ')$', 'i'),
    imageFileTypeReg = new RegExp('\\.(?:' + IMAGE_FILE_EXTS.join('|') + ')$', 'i');

function getIconv(argument) {
    if (!iconv) {
        iconv = require('iconv-lite');
    }
    return iconv;
}


var _ = {};

_.exists = function (path) {
    return _exists(path);
}

_.isTextFile = function (path) {
    return textFileTypeReg.test(path || '');
};

_.suffix = function (str) {
    var index = str.lastIndexOf('.');
    if (index < 0) {
        return '';
    } else {
        return str.substr(index).toLowerCase();
    }
};

_.isUtf8 = function (bytes) {
    var i = 0;
    while (i < bytes.length) {
        if ((// ASCII
            0x00 <= bytes[i] && bytes[i] <= 0x7F
        )) {
            i += 1;
            continue;
        }

        if ((// non-overlong 2-byte
            (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
            (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF)
        )) {
            i += 2;
            continue;
        }

        if (
            (// excluding overlongs
                bytes[i] == 0xE0 &&
                (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || (// straight 3-byte
                ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
                    bytes[i] == 0xEE ||
                    bytes[i] == 0xEF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || (// excluding surrogates
                bytes[i] == 0xED &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            )
        ) {
            i += 3;
            continue;
        }

        if (
            (// planes 1-3
                bytes[i] == 0xF0 &&
                (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || (// planes 4-15
                (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || (// plane 16
                bytes[i] == 0xF4 &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            )
        ) {
            i += 4;
            continue;
        }
        return false;
    }
    return true;
};

_.readBuffer = function (buffer) {
    if (_.isUtf8(buffer)) {
        buffer = buffer.toString('utf8');
        if (buffer.charCodeAt(0) === 0xFEFF) {
            buffer = buffer.substring(1);
        }
    } else {
        buffer = getIconv().decode(buffer, 'gbk');
    }
    return buffer;
};

_.read = function (path, convert) {
    var content = false;
    if (_exists(path)) {
        content = fs.readFileSync(path);
        if (convert || _.isTextFile(path)) {
            content = _.readBuffer(content);
        }
    } else {
        console.error('unable to read file[' + path + ']: No such file or directory.');
    }
    return content;
};

_.write = function (path, data, charset, append) {
    if (!_exists(path)) {
        _.mkdir(_.dirname(path));
    }
    if (charset) {
        data = getIconv().encode(data, charset);
    }
    if (append) {
        fs.appendFileSync(path, data, null);
    } else {
        fs.writeFileSync(path, data, null);
    }
};

_.walk = function (dir, handler) {
    dir = IS_WIN ? dir.replace(/\//g, pth.sep) : dir.replace(/\\/g, pth.sep);
    if (fs.statSync(dir).isFile()) {
        handler && handler(dir);
    } else {
        fs.readdirSync(dir).forEach(function (folder) {
            _.walk(dir + pth.sep + folder, handler);
        });
    }
};

/**
 * /app/css/base    -> /app/css/base
 * /app/css/base/   -> /app/css/base
 * /app/css/base.js -> /app/css/base.js     base.js as a folder
 */
_.mkdir = function (path, mode) {
    if (typeof mode === 'undefined') {
        mode = 511 & (~process.umask());    //511 === 0777
    }
    if (_exists(path)) return;

    var uri = '';
    path.split(/\\|\//g).forEach(function (f, i) {
        if (i == 0 && f !== '') {
            uri = f;
        } else if (i == 0 && f == '') {
            uri = '';
        } else {
            uri = uri + '/' + f;
        }
        if (f && !_exists(uri)) {
            fs.mkdirSync(uri, mode);
        }
    });
};

/**
 * /app/css/base    -> /app/css
 * /app/css/base.js -> /app/css
 * /app/css/base/   -> /app/css/base
 */
_.dirname = function (path) {
    path = path.replace(/\\/g, '\/');
    var pos = path.lastIndexOf('\/');
    if (pos > -1) {
        return path.substring(0, pos);
    } else {
        return path;
    }
};

_.copy = function (src, dst, filter) {
    var st = fs.statSync(src);
    if (filter && filter.test(src)) {
        return;
    }
    if (st.isFile()) {
        _.write(dst, _.read(src));
    } else {
        if (!fs.existsSync(dst)) {
            fs.mkdirSync(dst);
        }
        fs.readdirSync(src).forEach(function (folder) {
            _.copy(src + pth.sep + folder, dst + pth.sep + folder, filter);
        });
    }
};

_.del = function (src) {
    if (!_exists(src)) {
        return;
    }
    var st = fs.statSync(src);
    if (st.isFile()) {
        fs.unlinkSync(src);
    } else {
        fs.readdirSync(src).forEach(function (folder) {
            _.del(src + '/' + folder);
        });
        fs.rmdirSync(src);
    }
};


_.endWith = function (str, cat) {
    if (cat == null || cat == "" || str.length == 0 || cat.length > str.length) {
        return false;
    }
    if (str.substring(str.length - cat.length) == cat) {
        return true;
    } else {
        return false;
    }
    return true;
};

_.startWith = function (src, cat) {
    if (cat == null || cat == '' || src.length == 0 || cat.length > src.length) {
        return false;
    }
    if (src.substr(0, cat.length) == cat) {
        return true;
    } else {
        return false;
    }
    return true;
};

_.md5 = function (data) {
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    return md5sum.digest('hex').substring(0, 7);
};

for (var p in _) {
    exports[p] = _[p];
}