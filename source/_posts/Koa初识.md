---
title: Koa初识
categories: nodejs
tags: [Koa]
headimg: https://camo.githubusercontent.com/d80cf3b511ef4898bcde9a464de491fa15a50d06/68747470733a2f2f7261772e6769746875622e636f6d2f66656e676d6b322f6b6f612d67756964652f6d61737465722f6f6e696f6e2e706e67
---
特性
- 原理和内部结构和express很像，但是进行了语法和内部结构的升级
- 使用ES6编写，下一代web框架
- 利用async函数，丢弃回调函数
- Koa1基于ES6的Generator结合co，Koa2摈弃生成器函数和co，升级为ES8中的async/await函数
- Koa提供了ctx上下文对象, ctx上也挂载了req,res;express只是对req,res的扩展
- Koa没有路由系统，只有中间件功能
- 很多工具基于Koa，Egg.js, vite
- Koa2社区不如express
- awesome-koa

Koa启动一个http服务
```bash
npm i koa
```

```javascript
const Koa = require('koa')

const app = new Koa()

app.use(ctx => {
  ctx.body = 'hello world'
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
```
- 对ctx.res的处理，绕过Koa，不被支持
- 别名：访问ctx.request上的某些属性和方法同ctx上直接访问等效，如ctx.header === ctx.request.header; response同理

Koa中的路由
Koa默认没有提供路由，想根据不同路由分发不同功能需要自己处理。
可以借助中间件实现，关昂提供了两个包，route, router(推荐使用，同express使用风格类似)

安装使用
```bash
npm i @koa/router
```
```javascript
const Koa = require('koa')
const Router = require('@koa/router')

// 支持动态路径，如/user/:id，通过ctx.params获取
router.get('/', ctx =>{
  ctx.body = 'home'
})

const app = new Koa()

app.use(router.routes())
	.use(router.allowedMethods)

app.listen(3000, () => {
  console.log('http://localhost:3000')
})

```
静态资源管理
koa-static封装了静态资源的处理
```bash
npm i koa-static
```

```javascript
const static = require('koa-static')
const path = require('path')

// 当前文件执行路径下的public中的资源会被映射到服务根目录/下
app.use(static('./public'))	// 使用绝对路径安全点

这个包不能像express的api那样设置虚拟路径，需要引入第三方包mount
npm i koa-amount

app.use(
  mount('/static', static('./public'))
)
```
路由重定向
ctx.redirect(), 会以302状态码返回到客户端，并且带上响应头location, 只能针对同步请求，不能处理异步请求
中间件
所有中间件都是通过app实例use进行挂载生效的， 洋葱模型
- 多个中间件形成栈结构，最外层中间件首先执行，最内存中间件最后执行
- 调用next函数，执行权交给下一个中间件
- 执行结束后，执行权交回上一层中间件
- 最外层中间件收回执行权以后，执行next函数后的代码，参考egg

异步中间件
```javascript
const util = require('util')	// util/promisify，异步函数同步化
app.use(async (ctx) => {
  // ...异步代码
})
```


多个中间件的合并

app.use(a), app.use(b)， ....这种比较恶心
可以借助koa-compose合并中间件
最内层的中间件不用next()

```javascript
const compose = require('koa-compose')

app.use(compose([a, b, c]))
```


中间件异常处理
通过try...catch, ctx.throw抛出http状态码可以快捷抛出
每个中间件用try...catch包裹，这是express中的处理风格，最后挂载一个错误处理中间件。
koa中不是这么处理，在最外层try...catch捕获异常即可，后面的中间件都不用再捕获错误了，如果是异步抛出的异常，之前的所有中间件， 包括错误处理中间件中的next前面加上await或者return

Koa中的异常处理
app.on('error')， 书写位置不用在最外层，也有和以上中间件异常处理一样的问题，如果有中间件的next没有加await或return， app.on('error')是捕获不到这种异步错误
和中间件的异常处理同时出现时， 这里不会执行，如果想要error事件被触发，可以这么做
```javascript
app.use(async (ctx, next) =>{
	try {
    await next()
  } catch(err) {
    ctx.status = 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
  
})

```
Koa源码结构
Koa导出的是一个继承自Emitter的Application类

实现一个简单的Koa
```javascript
const http = require('http')

class Applicaton {
  constructor () {
    this.middleware = [] // 保存中间件
  }
  listen (...args) {
    http.createServer(this.callback())
    server.listen(...args)
  }

  use(fn) {
    this.middleware.push(fn)
  }

  compose (middleware) {
    return function (){
      const dispatch = index => {
        if(index >= middleware.length) return Promise.resolve()
        const fn = middleware[index]
        return Proise.resolve(
          fn({}, () => dispatch(index + 1))		// fn就是中间件处理函数
        )
      }

      return dispatch(0)
    }
  }

  callback () {
    
    const handleRequest = (req, res) => {
      
    }
    return handleRequest
  }
  
}

module.exports = Applicaton
```
















