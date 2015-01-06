/***********************************************************************
 1. update \uglify-js\lib\parse.js    增加filename属性
    
    function JS_Parse_Error(message, line, col, pos, filename) {
        this.message = message;
        this.line = line;
        this.col = col;
        this.pos = pos;
        this.stack = new Error().stack;
        this.filename = filename;
    };

    function js_error(message, filename, line, col, pos) {
        throw new JS_Parse_Error(message, line, col, pos, filename);
    };

***********************************************************************/

require('./lib/smooth');

var VERSION = require('./package.json')['version'];

var pth = require('path'),
    util = require('./lib/util'),
    once = false,
    t0 = new Date();

function normalizePath(path, cwd) {
    if (path[0] !== '/' && path[0] !== '\\' && path.indexOf(':') < 0) {
        path = pth.normalize(cwd + '/' + path);
    }
    if (path[path.length - 1] === '/' || path[path.length - 1] === '\\') {
        path = path.substr(0, path.length - 1);
    }
    return path;
}

var run = function(args) {
    if (!once) {
        once = true;
    } else {
        return;
    }

    var len = args.length,
        cwd = process.cwd(),
        src = cwd,
        dst;

    if (len == 3) {
        dst = args[2];
    } else if (len == 4) {
        src = args[2];
        dst = args[3];
    }
    if (len === 3 || len === 4) {
        dst = normalizePath(dst, cwd);
        src = normalizePath(src, cwd);
        if (!util.exists(src)) {
            smooth.log.error('Error Path Not Exist: ' + src);
            return;
        }
        if (util.startWith(dst, pth.normalize(util.endWith(src, pth.sep) ? src: src + pth.sep))) {
            smooth.log.error('Error Output Path: ' + dst);
            return;
        }
        
        smooth.init(src, dst);
        smooth.log.flag('init');
        if (smooth.config.get('optimize')) {
            smooth.optimize();
        }
        if (smooth.config.get('combine')) {
            smooth.combine();
            smooth.log.flag('combine');
        }
    } else {
        smooth.log.warn('Smooth v' + VERSION);
    }
};

if (process.argv.length === 4) {
    run(process.argv);
}

process.on('exit', function() {
    smooth.log.notice('Used ' + (new Date() - t0) + 'ms');
});

exports.run = run;