smooth-fe
=========

Optimze And Combine CSS &amp;&amp; JavaScript

## 简介

用于合并项目中的css和js文件，并对文件进行混淆和压缩。

## 安装
将php加入环境变量，并在命令行中执行

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
          mode: 'production',
          output: './dist/admin.js',
          obfuscate: true,
          input: [
            './src/a.js',
            './src/b.js',
          ]
        }
      },
      css: {}, 
    };


## 使用说明

在项目录下执行
	
	smooth

此时会在项目的同级目录下生成dist文件夹，将该文件夹拷贝至服务器中即可。