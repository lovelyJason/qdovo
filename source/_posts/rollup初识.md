---
title: rollup初识
date: 2022-05-09
categories: 前端工程化
headimg: https://images.unsplash.com/photo-1681520349987-efd0b1039dc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80
---

rollup作为一款流行的ES Module打包器， 可以将我们项目当中散落的模块打包成整块的代码，从而使我们的代码更好地运行在浏览器环境和nodejs环境，除此之外， 还可以打包成其他模块化规范的代码，目前包括Vue， React等主流的框架、库，都是采用的rollup进行打包。

<!-- more -->

对于前端开发人员来说， 熟悉rollup的使用是一个基本功， 我们经常需要借助它打包npm模块并发布上去，开源贡献自己的力量
不同于webpack， rollup更小巧， 更轻量的多，rollup的初衷是提供一个高效的ES Module打包器

## 初步认识rollup

我们先来安装一下rollup并打包一段简单的代码示例看看输出是什么

```bash
yarn add rollup --dev
yarn rollup ./index.js --format iife --file dist/bundle.js # iife是适合浏览器使用的自调用函数形式
```

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-06_11-27-24.png)
{% endgallery %}

可以看到，rollup的打包结果很简洁， 没有webpack那些大量引导代码和模块函数

并且可以看到项目里面没用到的代码已经被自动剔除了， 这就是tree shaking， rollup会默认开启此功能，剔除掉没有被引用的代码，事实上，rollup是最早使用tree shaking进行优化的工具

## rollup配置文件

rollup默认的配置文件是rollup.config.js，其运行在node环境中， 可以使用ES Module语法书写

```javascript
export default {
  // 入口文件路径
  input: './index.js',
  // 输出配置
  output：{
    // 输出文件路径
    file: 'dist/bundle.js'
    // 输出格式
    format: 'iife'
  }

}
```

然后执行`yarn rollup --config`使其工作，--config参数表明使用配置文件, 否则不会进行加载，当然也可以自行指定其他配置文件,可以借助这个参数在不同的环境中进行不同的打包处理

## rollup插件的使用

rollup只是对模块的合并打包，对于项目中的其他需求，如加载其他类型文件，导入CommonJs模块，或者编译ECMAScript的新特性，这时候，rollup本身是没有这个功能，需要通过其插件来实现，不同于webpack，其扩展途径主要是三种，loader，pulugin，minimizer.插件是rollup唯一的扩展途径。

比如读取package.json文件，默认rollup是不支持的,

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-06_11-48-23.png)
{% endgallery %}

rollup提示我们下载rollup-plugin-json去处理

```bash
yarn add rollup-plugin-json --dev
```

在配置文件中使用该插件

```javascript
import json from 'rollup-plugin-json'

export default {
  input: './index.js',
  output：{
    file: 'dist/bundle.js'
    format: 'iife'
  },
  plugin: [
    json()
  ]
}
```

### rollup如何加载npm模块

rollup默认只能加载本地模块，不能像webpack那样导入npm模块。为了抹平这个差异，官方提供了方案`rollup-plugin-node-resolve`

```javascript
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: './index.js',
  output：{
    file: 'dist/bundle.js'
    format: 'iife'
  },
  plugin: [
    json()，
    resolve()
  ]
}
```

此时就能直接在项目中导入npm模块, 但是，此时仅限于ES Module的模块， 因为rollup默认只能解析ES Module的模块，对于CommonJS模块， rollup默认不被支持，然而社区也有很多模块是采取CommonJS规范，为了解决这个问题，官方提供了插件`rollup-plugin-commonjs`

```javascript
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: './index.js',
  output：{
    file: 'dist/bundle.js'
    format: 'iife'
  },
  plugin: [
    json()，
    resolve(),
    commonjs()
  ]
}
```

此外， rollup还支持代码拆分，多入口打包...