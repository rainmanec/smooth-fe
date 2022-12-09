# smooth-fe

## 简介

用于合并项目中的css和js文件，并对文件进行混淆和压缩。

## 安装

    npm install -g smooth-fe

## 功能概述

smooth.config.js


    const path = require('path');
    module.exports = {
        mode: 'development',  // production
        path: __dirname,
        copy: {
            source: path.resolve(__dirname, './src'),
            dest: path.resolve(__dirname, './dist'),
            mode: 'development',
            removeCombineFiles: true
        },
        obfuscate: {
            compact: false,
            controlFlowFlattening: true
        },
        js: {
            'admin': {
                mode: 'production',  // JS压缩
                obfuscate: true,     // JS混淆编译
                output: './dist/admin.js',
                input: [
                    './src/a.js',
                    './src/b.js',
                ]
            }
        },
        css: {},
    };


## 使用说明

在项目录（smooth.config.js文件所在目录）下执行
	
	smooth

此时会在项目的同级目录下生成dist文件夹，将该文件夹拷贝至服务器中即可。