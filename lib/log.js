    var colors = require('colors'),
    timer = [],
    NORMAL = 0,
    NOTICE = 1,
    DEBUG = 2,
    WARN = 3,
    ERROR = 4;

function log(msg, title, type) {
    msg = (title) ? ' [' + title.toUpperCase() + '] ' + msg: msg;
    if (type === NOTICE) {
        console.log(msg.magenta);
    } else if (type === DEBUG) {
        console.log(msg.green);
    } else if (type === WARN) {
        console.log(msg.yellow);
    } else if (type === ERROR) {
        console.log(msg.red);
    } else {
        console.log(msg);
    }
}

exports.flag = function(msg, title) {
    var t0 = timer[timer.length - 1],
        t = new Date();
    timer.push(t);
    log(msg + ': ' + (t - t0) + 'ms', title, DEBUG);
};

exports.notice = function(msg, title) {
    log(msg, title, NOTICE);
};

exports.warn = function(msg, title) {
    log(msg, title, WARN);
};

exports.error = function(msg, title) {
    log(msg, title, ERROR);
};

exports.debug = function(msg, title) {
    log(msg, title, DEBUG);
};

timer.push(new Date());