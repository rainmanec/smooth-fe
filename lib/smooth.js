const fs = require('fs');
const Path = require('path');
const util = require('./util');
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const JavaScriptObfuscator = require('javascript-obfuscator');

let _ = {};

_.log = require('./log');

/**
 * 读取合并文件
 */
_.combine = function (output, input, baseDir) {
    let content = [];
    for (let i = 0; i < input.length; i++) {
        let file = input[i];
        let src = Path.resolve(baseDir, file);
        if (!util.exists(src)) {
            smooth.log.error('File Not Exist: ' + src);
            return false;
        } else {
            content.push(util.read(src));
        }
    }
    // 写入文件
    let destfile = Path.resolve(baseDir, output);
    util.write(destfile, content.join("\n"));
    return destfile;
};

_.combineJS = function (output, input, baseDir, mode, obf, obfConfig) {
    let destfile = _.combine(output, input, baseDir);
    if (destfile === false) {
        return false;
    }
    // 先混淆
    if (obf && obfConfig) {
        let obfuscationResult = JavaScriptObfuscator.obfuscate(util.read(destfile), obfConfig);
        util.write(destfile, obfuscationResult.getObfuscatedCode());
    }
    // 后压缩
    if (mode === 'production') {
        let result = UglifyJS.minify(util.read(destfile));
        if (result.error) {
            smooth.log.notice('UglifyJS ERROR: line ' + result.error.line + ', pos ' + result.error.pos + ', ' + util.read(destfile).split('\n')[result.error.line - 1]);
            smooth.log.notice(result.error);
            return false;
        } else {
            util.write(destfile, result.code);
        }
    }
    return true;
};

_.combineCSS = function (output, input, baseDir, mode) {
    let destfile = _.combine(output, input, baseDir);
    if (destfile === false) {
        return false;
    }
    if (mode === 'production') {
        var minimized = new CleanCSS({processImport: false, compatibility: 'ie7'}).minify(util.read(destfile));
        util.write(destfile, minimized.styles);
    }
    return true;
};

global.smooth = _;
