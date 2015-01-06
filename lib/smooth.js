var fs = require('fs'),
    util = require('./util'),
    Config = require('./config'),
    UglifyJS = require('uglify-js'),
    CleanCSS = require('clean-css'),
    exec = require('child_process').exec;

// 判断path是否以arr中元素开头
function ignore(path, arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (util.startWith(path, arr[i])) {
            return false;
        }
    }
    return true;
};


var _ = {};

_.log = require('./log');

_.init = function(src, dst) {
    _.src = src;
    _.dst = dst;
    _.files = {
        css: [],
        js: [],
        css_php: [],
        js_php: [],
        other: []
    };

    // config
    _.config = new Config(dst);
    if (fs.existsSync(_.src + '/smooth-config.js')) {
        require(_.src + '/smooth-config.js');
    }

    // copy file
    util.del(_.dst);
    util.copy(_.src, _.dst, _.config.get('reg_nocopy'));
    util.del(_.dst + '/smooth-config.js');

    // init files[]
    util.walk(_.dst, function(path) {
        if (ignore(path, _.config.data.ignore) === false) {
            return;
        }
        if (util.endWith(path, '.js')) {
            _.files.js.push(path);
        } else if (util.endWith(path, '.js.php')) {
            _.files.js_php.push(path);
        } else if (util.endWith(path, '.css')) {
            _.files.css.push(path);
        } else if (util.endWith(path, '.css.php')) {
            _.files.css_php.push(path);
        } else {
            _.files.other.push(path)
        }
    });
};

_.optimize = function() {
    _.files.js.forEach(function(path) {
        if (ignore(path, _.config.data.ignore_o)) {
            try {
                var final_code = UglifyJS.minify(path);
                util.write(path, final_code.code);
            }catch(e) {
                _.log.error('JS ERROR: line ' + e.line + ', pos ' + e.pos + ', ' + util.read(path).split('\n')[e.line - 1]);
            }
        }
    });
    _.log.flag('optimize js');
    _.files.css.forEach(function(path) {
        if (ignore(path, _.config.data.ignore_o)) {
            var minimized = new CleanCSS({processImport:false}).minify(util.read(path));
            util.write(path, minimized. styles);
        }
    });
    _.log.flag('optimize css');
};

_.combine = function() {
    _.files.css_php.forEach(function(path) {
        var filename = path.substring(0, path.length - 8);
        exec('php ' + path + '>' + filename + '.c.css', function() {
            util.del(path);
        });
    });
    _.files.js_php.forEach(function(path) {
        var filename = path.substring(0, path.length - 7);
        exec('php ' + path + '>' + filename + '.c.js', function() {
            util.del(path);
        });
    });
    _.files.other.forEach(function(path) {
        var suffix = util.suffix(path);
        if (suffix === '.html' || suffix === '.inc') {
            var content = util.read(path),
                flag = false;
            if (content.indexOf('.js.php') > -1) {
                flag = true;
                content = content.replace(/(<link.*).(css).php(.*\/>)/g, "$1.c.$2$3");
            }
            if (content.indexOf('.css.php') > -1) {
                flag = true;
                content = content.replace(/(<link.*).(css).php(.*\/>)/g, "$1.c.$2$3");
            }
            if (flag) {
                util.write(path, content);
            }
        }
    });
};

global.smooth = _;