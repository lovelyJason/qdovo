// 修改代码要重启
const is_current =  hexo.extend.helper.get('is_current').bind(hexo)
const fs = require('fs')
const path = require('path')
const util = require('util')

// hexo.extend.filter.register('theme_inject', function(injects) {
//   const is_current =  hexo.extend.helper.get('is_current').bind(hexo)
//   if(is_current('history')) {
//     // injects.postEnd.file('history', 'source/_tpl/timeline.ejs')
//     // injects.bodyEnd.raw('load-custom-js', '<scrip src="/js/timeline.js"></script>')  // 注入位置在</body>之前
//   }
//   if(is_current('needs')) {
//     // injects.bodyBegin.raw('load-custom-js', '<script src="/js/needs.js"></script>')
//   }
// });

// 传入错误的参数默认是head_end
// hexo.extend.injector.register('body_begin', '<script src="/js/timeline.js"></script>')  // 在<body>中的<div class="pace pace-inactive"></div>之后， <!-- import body_begin begin-->之前
// hexo.extend.injector.register('body_end', '<src="/js/timeline.js"></script>') // 注入位置在</body>之前,<!-- Custom Files bodyEnd end-->之后,标注有<!-- hexo injector body_end start -->
// 如果传入第三个参数post，代表只在post layout载入，page等布局同理
// 官方文档说注入器被用于将静态代码片段注入生成的 HTML 的 <head> 和/或 <body> 中。Hexo 将在 after_render:html 过滤器 之前 完成注入。
// 因此injector不能注入ejs,而主题的theme_inject在generateBefore事件中处理，即静态文件生成前

// hexo.extend.generator.register('post1', function(locals){
//   return locals.posts.map(function(post){
//     return {
//       path: post.path,
//       data: post,
//       layout: 'post1'
//     };
//   })
// });
// console.log(hexo.locals.get('posts'))   // 这里的局部变量只有site下面的

hexo.extend.injector.register('body_end', '<script src="/js/books.js"></script>')

// TODO:我要在自定义ejs中注入变量
var logPath = 'upgrade.log'
var logFile = fs.createWriteStream(logPath, { flags: 'a' })
// console.log(hexo.theme) // 这里是获取不到的，还没初始化主题

console.log = function() {
  logFile.write(util.format.apply(null, arguments) + '\n')
  process.stdout.write(util.format.apply(null, arguments) + '\n')
}

// 修改需要clean一下.且这里只会服务启动的时候调用
// 草这里有bug， is_current内部函数有问题，根据传入的path与hexo.path对比，但是hexo.path不存在，可能是页面此时还未载入,很多全局变量都不存在，但是site下的局部变量还是有的,但是数据不全？
/*
posts
pages
categories
tags

所以向ejs资源文件注入locals，helper没什么意义，有的用不了，有的可以用
*/
hexo.extend.filter.register('before_post_render', async function(data){   // 执行时此时页面都没有初始化
  if(data.layout === 'page' && data.source.endsWith('.ejs')) {
    // 此处data有raw, _content, content。raw: 如果是md渲染的， 那么raw就是md中的内容，与content不一致。content和_content基本一致
    // 我只是需要在ejs文章中传递变量进去，否则后续再经由ejs渲染时会报错
    // console.log(hexo.config)
    let localData = hexo.locals.toObject().data
    // console.log(hexo.extend)
    // console.log(hexo)  // 为什么执行了两次?因为ejs首先被下面ejs render，然后被hexo内部再次通过ejs render
    // console.log(hexo.locals.get('pages'))
    let helpers = Object.assign({}, hexo.extend.helper.store)
    // delete helpers.partial
    for(let key in helpers) {
      helpers[key] = helpers[key].bind(this)
    }

    /* partial函数会报错。因为函数内部的this和这里bind后的内部this不一致，bind后为什么会变成Hexo类，不是实例.即使在模板中使用hexo.extend.helper.get('partial').bind(hexo)调用也会报一样的错
      因此helpers要做一层拷贝
      date函数报错，ctx没有page属性
      经测试将before_post_render改为after_post_render能获取到page，应该是文章经过渲染之前没有初始化page，这时候很多辅助函数都用不了
    */

    let filename = path.resolve(data.full_source).replace(/\\/g,"\\\\")

    let result = await hexo.render.render({ text: data.content, engine: 'ejs' }, { filename, highlight: null, data: localData })

    /*
      ejs注入的变量
      {
        filename: 'D:\\projects\\qdovo\\source\\books\\index.ejs',
        highlight: null
      }
    */

    // 模板里使用
    /*
      <%- hexo.extend.helper.get('gravatar').bind(hexo)('a@abc.com') %>
      <%- helper.get('gravatar')('a@abc.com') %>
    */
    data.content = result
    data._content = result
  }
  return data
});
