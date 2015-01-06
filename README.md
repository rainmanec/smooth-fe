smooth-fe
=========

Optimze And Combine CSS &amp;&amp; JavaScript

## 简介

用于实现web项目中的前端优化，包括CSS、JS文件的压缩和合并。

## 安装

    npm install -g smooth-fe

需要将php加入环境变量
  
## 使用

* 压缩项目中所有.css和.js文件;
* 将项目中所有"xx.js.php"和"xx.css.php"执行后输出为"xx.c.js"和"xx.c.js"，并删除"xx.js.php"和"xx.css.php"文件
* 将项目中所有对"xx.js.php"和"xx.css.php"替换为"xx.c.js"和"xx.c.js"，例如 index.html


    &lt;script type="text/javascript" src="./xx.js.php"&gt;&lt;/script&gt;
    替换为：
    &lt;script type="text/javascript" src="./xx.c.js"&gt;&lt;/script&gt;
