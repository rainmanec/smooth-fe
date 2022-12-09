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

const VERSION = require('./package.json')['version'];
const Path = require('path');
const util = require('./lib/util');
const t0 = new Date();

const run = function (args) {
    // 基础路径
    let pathNode = args[0];         // node.exe的完整路径
    let pathNpm = args[1];          // index.js的完整路径
    let pathCwd = process.cwd();    // 命令执行时所在的路径

    // 计算smooth.config.js文件路径
    let pathConfig = args[2];  // smooth.config.js的路径    
    if (pathConfig === '-v') {
        smooth.log.warn('Smooth v' + VERSION);
        return;
    }
    if (args.length === 2) {
        pathConfig = './smooth.config.js';
    }
    pathConfig = Path.resolve(pathCwd, pathConfig);  // __dirname 代表 index.js文件所在的目录  // path_config = pth.resolve(__dirname, path_config);  // __dirname 代表 index.js文件所在的目录
    if (!util.exists(pathConfig)) {
        smooth.log.error('File Not Exist: ' + pathConfig);
        return;
    }
    // 加载基本配置
    let smooth_config = require(pathConfig);
    let baseMode = smooth_config['mode'];
    let baseDir = smooth_config['path'];
    let jsItems = smooth_config['js'];
    let cssItems = smooth_config['css'];
    let copyItems = smooth_config['copy'];
    let obfConfig = smooth_config['obfuscate'];

    // 合并js
    if (jsItems) {
        for (let p in jsItems) {
            let {output, input, mode, obfuscate} = jsItems[p];
            let result = smooth.combineJS(output, input, baseDir, mode ? mode : baseMode, obfuscate, obfConfig);
            if (result === false) return;
        }
        smooth.log.flag('Combine JS');
    }
    // 合并css
    if (cssItems) {
        for (let p in cssItems) {
            let {output, input, mode} = cssItems[p];
            let result = smooth.combineCSS(output, input, baseDir, mode ? mode : baseMode);
            if (result === false) return;
        }
        smooth.log.flag('Combine CSS');
    }
    if (copyItems) {
        let {source, dest, mode, removeCombineFiles} = copyItems;
        // 拷贝目录和文件
        util.copy(source, dest);
        smooth.log.flag('Copy Files');
        // 删除合并的源文件
        if (removeCombineFiles) {
            if (jsItems) {
                for (let p in jsItems) {
                    jsItems[p]['input'].forEach(function (file) {
                        util.del(dest + Path.resolve(baseDir, file).replace(source, ''));
                    });
                }
            }
            // 合并css
            if (cssItems) {
                for (let p in cssItems) {
                    cssItems[p]['input'].forEach(function (file) {
                        util.del(dest + Path.resolve(baseDir, file).replace(source, ''));
                    });
                }
            }
            smooth.log.flag('Delete Combine Source Files');
        }
    }
};

//run(process.argv);    // 开发时打开此行代码


process.on('exit', function () {
    smooth.log.notice('Used ' + (new Date() - t0) + 'ms');
});


exports.run = run;