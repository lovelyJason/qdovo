---
title: 快速搭建node服务端
date: 2019-08-12 18:29:13
tags: [nodejs]
---

## 写在前面

在用react开发项目时,碰到个问题,记录一下自己的学习过程

通常我们模拟接口会用到mockjs,也熟悉了那一套语法,但是用在react开发的项目中,发现mock没起到拦截作用,后来才发现是由于公司的项目结构是有go的一些东西,大概是被后端那一层给拦截了,因此mock的使用会有问题.

```go
func Api() {
	app := iris.Party("/api")  // 这边已经被go拦截过了

	user := &api.UserController{}
	httpHandle := &api.HttpHandle{}
	app.Get("/passport/signout/", user.SignOut)

	app.Any("/v1/*.", httpHandle.HttpTransmit)
	app.Get("/download/*.", httpHandle.HttpTransmitDownload)
	
	// 上传初始化数据，直连business层
	app.Any("/business/*.", httpHandle.HttpBusinessTransmit)

}
```

想到用node启动一个服务器配合ngnix去拦截请求

## 1.1 生成脚手架

```javascript
npm i express-generator -g
```

## 1.2 express脚手架新建项目

```javascript
express --view=ejs expressMock
```

## 1.3 下载依赖项

```javascript
cd ...
npm i
```

现在一套完整的基于node的服务端已经搭建好了,接下来可以拦截请求了.

## 2. 更改ngnix配置

借助ngnix来实现url的重写

```ng
location /api/ {

       proxy_pass   http://127.0.0.1:1234/;

       proxy_set_header X-real-ip $remote_addr;

       proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;

       proxy_set_header Host $host;

       client_max_body_size 1000m;

 }
```

别忘了重启ngnix

```javascript
sudo nginx -s reload  
```

接下来要解决跨域的问题

在app.js文件中利用CORS解决跨域

```javascript
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
```

