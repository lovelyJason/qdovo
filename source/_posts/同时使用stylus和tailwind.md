---
title: 同时使用stylus和tailwind css
data: 2023-04-29
categories: css
tags: css
headimg: https://cdn.qdovo.com/img/headimg/tailwind.jpg
---

最近看上了tailwind，想集成到hexo中来。tailwind是一款功能类优先的css框架， 集成了很多类。如官方对他的介绍，表面看上去是在开历史的倒车，在html中书写一大堆的类名，但是当我真正去使用它的时候，觉得是不一样的体验，而且是能有效提升样式编写效率

<!-- more -->

tailwind本质上是一个postcss插件，加上本博客的样式采用stylus编写，无法直接使用。如果你了解tailwind，他有一些自定义指令，在css中书写的时候会经过postcss的转化编译。而如果要在stylus中编写， 很显然， 要遵循的一个原则是，要在stylus编译之前，将stylus中的tailwind代码编译出来，再经过stylus处理, 因为预处理器的语法，让包括tailwind的任何postcss插件都有可能瘫痪。即，预处理器要运行咋postcss之前。
而本文要实现的功能， 将stylus和postcss结合使用，并在postcss中集成tailwind，在stylus中书写tailwind代码。也是对本博客系统的一次重构

### hexo-renderer-stylus

而hexo渲染stylus的插件是hexo-renderer-stylus，查看其中的源码：

入口文件node_modules/hexo-renderer-stylus/index.js
```javascript
/* global hexo */
'use strict';

const renderer = require('./lib/renderer');

hexo.extend.renderer.register('styl', 'css', renderer);
hexo.extend.renderer.register('stylus', 'css', renderer);
```

node_modules/hexo-renderer-stylus/lib/renderer.js
```javascript
// ...
function applyPlugins(stylusConfig, plugins) {
  plugins.forEach(plugin => {
    const factoryFn = require(plugin.trim());
    stylusConfig.use(factoryFn());
  });
}

module.exports = function(data, options, callback) {
  const config = this.config.stylus || {};
  const self = this;
  const plugins = ['nib'].concat(config.plugins || []); // 读取hexo博客根目录下的_config.yml中的plugins

  function defineConfig(style) {
    style.define('hexo-config', data => {
      return getProperty(self.theme.config, data.val);
    });
  }

  const stylusConfig = stylus(data.text);

  applyPlugins(stylusConfig, plugins);
  stylusConfig
    .use(defineConfig)
    .set('filename', data.path)
    .set('sourcemap', config.sourcemaps)
    .set('compress', config.compress)
    .set('include css', true)
    .render(callback);
};
```

不难发现stylus有插件机制。通过stylus('stylus字符串')，对其返回的对象调用use方法， 为其注册插件，查看stylus文档关于插件注册的更多api

### stylus语法介绍

先简单介绍下stylus的一些api，stylus采用链式调用的机制，最后进行render

- render：将stylus转化为css
- set：为应用设置选项，如`filename`, `paths`
- define: 在stylus中定义全局变量，如本主题中的`hexo-config`函数，stylus中调用该函数可以获取主题的配置
- use：被调用时，给定`Fn`给渲染器调用，Fn中允许所有的方法被使用。

更多api参考 https://www.zhangxinxu.com/jq/stylus/js.php

```javascript
var mylib = function(style){
  style.define('add', add); // add是一个函数
  style.define('sub', sub);
};

stylus(str)
  .use(mylib)
  .render(...)
```

思路就是编写stylus插件，导出函数，通过导出函数中的参数`style`调用`use`注册到stylus中

### postcss使用介绍

什么是postcss?
> PostCSS是使用JS插件转换样式的工具。这些插件可以使您的CSS，支持变量和Mixins，Transpile Future CSS语法，Inline Images等。

有的人说postcss是预处理器， 也有人说是后处理器。不同于less,sass,stylue这类预处理器，其实postcss是一个平台，不提供具体的工作，通过为其添加插件而实现各种各样的功能。

使用postcss的两个步骤

1. 为构建工具添加postcss扩展
2. 在postcss工作过程中选择插件

我们可以在前端的各种构建工具中使用postcss， 如webpack中配置`postcss-loader`，parcel，gulp，browser等，都有postcss的插件

还可以使用命令行工具编译，需要下载postcss-cli

```bash
postcss --use autoprefixer -o main.css css/*.css

# --use：使用插件，autoprefixer是一个自动添加兼容性前缀的插件
# -o main.css: 输出到main.css文件中， css/*.css就是对指定的文件进行操作
```

还可以支持API的调用，hexo博客中默认都没有以上这些构建工具，因此，我将通过API编写postcss的hexo插件，让其能够在hexo中工作

```bash
npm install postcss autoprefixer postcss-nested
```

{% folding open:: postcss下载超时 %}

```bash
yarn add postcss --registry=https://registry.npm.taobao.org/
# or if you use npm
npm install postcss --registry=https://registry.npm.taobao.org
```

{% endfolding %}

```javascript
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const postcssNested = require('postcss-nested')
const fs = require('fs')

fs.readFile('src/app.css', (err, css) => {
  postcss([autoprefixer, postcssNested])
    .process(css, { from: 'src/app.css', to: 'dest/app.css' })
    .then(result => {
      fs.writeFile('dest/app.css', result.css, () => true)
      if ( result.map ) {
        fs.writeFile('dest/app.css.map', result.map.toString(), () => true)
      }
    })
})
```

postcss默认的配置文件在执行进程目录下的postcss.config.js

### tailwindcss使用介绍

tailwind css需要Node.js版本在12.13.0及以上

- 安装

```bash
npm install -D tailwindcss@latest postcss@latest
```

- cli
tailwind css使用autoprefixer插件为css属性添加必要的前缀，如果有其他工具已经处理过这，可以将其关闭

```bash
npx tailwindcss init -p # 创建配置文件，这将会在您的项目根目录创建一个最小化的 tailwind.config.js 文件; -p或--postcss 初始化tailwind css的时候顺便创建post.config.js
npx tailwindcss --no-autoprefixer -i ./src/tailwind.css -o tailwind.css # 编译文件， 使用-c指定配置文件, 使用--postcss将会基于post.config.js配置文件执行配置中的其他postcss插件
npx tailwindcss -o tailwind.css --watch # 以监听模式运行tailwind csss
```
### 结合stylus与tailwind css

以上的这些前置化的工作完成以后，回到我们此次的主题，如何在hexo中将stylus和tailwind css结合

#### 插件入口

上文说到`hexo-renderer-stylus`中已经为我们扩展了plugins, 通过require导入stylus.plugins，需要在项目目录下_config.yml中配置plugins。所以这里的路径怎么定义是一个问题

```yml
stylus:
  plugins: stylus-tailwind.js
```

直接在项目目录下新建个stylus-tailwind.js文件用来写我们的插件，是肯定行不通的，hexo-renderer-stylus/lib下是没有这个文件的

要顺利执行这里，`require(plugin.trim())`，只能在node_modules中开发我们的插件，将来从npm导入，将他暂且命名为stylus-tailwind，主要不用要hexo-开头，否则会被hexo默认执行其中脚本

然后更改配置文件

```yml
stylus:
  plugins: stylus-tailwind
```

插件内容是

```javascript
exports = module.exports = plugin;

/**
 * Library version.
 */

// exports.version = require(path.join(__dirname, '../package.json')).version;

/**
 * Stylus path.
 */

exports.path = __dirname;

var mylib = function(style){
  console.log(style)
};

/**
 * Return the plugin callback for stylus.
 *
 * @return {Function}
 * @api public
 */

function plugin() {
  return function(style){
    style.include(__dirname);
    style.use(mylib)
  };
}

```

重新启动hexo，刷新页面，控制台会打印style，大概是这么个结构
```JASON
Renderer {
  options: {
    globals: { 'has-canvas': [Boolean] },
    functions: {},
    use: [],
    imports: [
      'D:\\projects\\qdovo\\node_modules\\stylus\\lib\\functions\\index.styl'
    ],
    paths: [
      'D:\\projects\\qdovo\\node_modules\\nib\\lib',
      'D:\\projects\\qdovo\\node_modules\\stylus-tailwind\\lib'
    ],
    filename: 'stylus',
    Evaluator: [Function: Evaluator]
  },
  str: '#safearea{\n' +
    '  display: block\n' +
    '}\n' +
    '\n' +
    "@import '_defines/*'\n" +
    '\n' +
    '// Project\n' +
    "@import '_style'\n" +
    '\n' +
    '// Custom Files\n' +
    "for $injects_style in hexo-config('injects.style')\n" +
    '  @import $injects_style;\n' +
    '\n',
  events: EventEmitter {
    _events: [Object: null prototype] {},
    _eventsCount: 0,
    _maxListeners: undefined,
    [Symbol(kCapture)]: false
  }
}
```

这时候如果我们做点什么
```javascript
var mylib = function(style){
  style.str = '#safearea{\n' +
  '  display: block\n' +
  '}\n'
}
```

重启hexo，打开devtool network面板，观察style.css中的内容，你会发现他变成了

```css
#safearea{display:block}
```

#### 引入postcss和tailwind css

更改postcss.config.js

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss')
  ]
}
```

`postcss-import`和`autoprefixer`, `tailwindcss/nesting`插件不需要配置，stylus已经处理过这些了

在css中导入tailwind的方法：

```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

然而这段代码在未被编译为css中的styl文件是行不通的，因为这三个文件里面写的`tailwind`指令stylus压根不能识别。怪操蛋的，果然tailwind还是不太能和css预处理器一起使用吗

并且，在stylus中，@import语句无需置顶，但是css中@import必须置顶.还有语法冲突的问题，如

.scss
```scss
.alert {
  background-color: darken(theme('colors.red.500'), 10%);
}
```
在被编译成css前，tailwind不会解析theme，sass的darnken函数也会失效

> 要使用 Tailwind 的预处理工具，如 Sass，Less，或 Stylus，您需要添加一个额外的构建步骤到您的项目中，让您通过 PostCSS 运行您的预处理 CSS。如果您在项目中使用 Autoprefixer，您已经有了类似这样的设置。

再看了下hexo官方对于Renderer渲染引擎的描述

```javascript
hexo.extend.renderer.register(name, output, function(data, options){
}, sync);
```

于是，修改一下hexo-renderer-stylus/index.js，传入第三个参数

```javascript
/* global hexo */
'use strict';

const renderer = require('./lib/renderer');

hexo.extend.renderer.register('styl', 'css', renderer, true);
hexo.extend.renderer.register('stylus', 'css', renderer, true);
```

hexo-renderer-stylus/lib/renderer.js
```javascript
module.exports = function(data, options, callback) {
  const config = this.config.stylus || {};
  const self = this;
  const plugins = ['nib'].concat(config.plugins || []);

  function defineConfig(style) {
    style.define('hexo-config', data => {
      return getProperty(self.theme.config, data.val);
    });
  }

  const stylusConfig = stylus(data.text);

  applyPlugins(stylusConfig, plugins);

  let res = stylusConfig
    .use(defineConfig)
    .set('filename', data.path)
    .set('sourcemap', config.sourcemaps)
    .set('compress', config.compress)
    .set('include css', true)
    .render(callback);
  console.log(res);
  return 'body{color:red;}'
}
```

嗯这样就可以了。总而言之，hexo-renderer-stylus不支持对处理后的css再处理， 因为使用的异步注册，并且直接render了，导致没机会再对stylus返回的css进行处理。即stylus插件只能前置，不能后置。

既然如此，只能自己写一个npm包了，不能用这个默认的hexo-renderer-stylus编译带有tailwind的stylus, 将最后的css进行捕获，在头部添加内容

```javascript
let res = stylusConfig
    .use(defineConfig)
    .set('filename', data.path)
    .set('sourcemap', config.sourcemaps)
    .set('compress', config.compress)
    .set('include css', true)
    .render(callback);
  return '@import "tailwindcss/base";@import "tailwindcss/components";@import "tailwindcss/utilities";' + res
```

这里博客生成的本地样式文件只有一份，@import语句必须置顶，然后再交由postcss进行处理即可

待更新......
