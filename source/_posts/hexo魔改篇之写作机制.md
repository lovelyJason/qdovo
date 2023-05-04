---
title: hexo魔改篇（一）之写作机制
tags: hexo
headimg: https://cdn.qdovo.com/img/headimg/hexo.png
---

在hexo写文章，一般来说，可以分为以下几种类型的页面或者文章

- markdown书写，文件后缀`md`
- 模版引擎书写，可以用任何模板引擎，只要安装了对应的解析器即可，如ejs
- html书写

本文不过多介绍hexo的用法以及他的知识点，只是讲在hexo的框架下，如何突破常规方式， 并且以更优雅的方式写文章，自定义页面，还有一些平时没有注意到的用法，需要涉及到框架源码层面，如编写，重写插件脚本等

## markdown

此类文章都是放在目录`blo/source/_posts`下，用markdown进行书写，对应的解析器是`hexo-renderer-marked`。内容构成是`front-matter` + 正文。默认的布局是`post`， 可以通过修改`front-matter`中的layout属性，如改为`friends`， 那么这篇文章内容里面就会出现友链信息。所有的`layout`都在主题目录下的layout文件夹下。你甚至可以在layout文件夹下新建`a.ejs`文件， 那么`a`就是一个布局，自定义布局。那这种新增布局的方式也是给博客拓展新模板的不错的方式。本博客下的文章统计页面就是一个新布局。

不在`blog/source/_posts`目录下的其他md文章，如果未设置`front-matter`中的`layout`，默认的layout是`page`。不论是在哪个目录下的md文章，你都可以设置layout为任意可以设置的值

选择好布局以后，我们除了可以用常规的mardown格式去书写，还可以用hexo的内置标签，以及主题扩展的标签， 更可以自己去注册自定义标签，在渲染的时候，这些标签会被替换为html代码。这些文档上都有不赘述了。

文章的渲染顺序是：

- 执行`before_post_render`过滤器
- 使用`markdown`渲染器渲染
- 使用`Nunjucks`渲染
- 执行`after_post_render`过滤器

我对这种类型下的页面做了一些扩展，你可以从https://github.com/volantis-x/hexo-theme-volantis/pull/883
获得一些灵感

在markdown下，这些默认的书写方式还远远不够，我们不仅仅满足写一些完全静态的文章或页面，你可能还要基于markdown去获取一些动态的数据，如这篇`issue`:
https://github.com/hexojs/hexo/issues/2209

从markdown中获取网站或主题的配置，以及获取局部变量，如`posts`, `tags`这些，目前我还没有很好的办法，如果你有建议，欢迎提供

{% note todo::待更新 %}

## 模板引擎

> Hexo 支持以任何格式书写文章，只要安装了相应的渲染插件。
  例如，Hexo 默认安装了 hexo-renderer-marked 和 hexo-renderer-ejs，因此你不仅可以用 Markdown 写作，你还可以用 EJS 写作。如果你安装了 hexo-renderer-pug，你甚至可以用 Pug 模板语言书写文章。
  只需要将文章的扩展名从 md 改成 ejs，Hexo 就会使用 hexo-renderer-ejs 渲染这个文件，其他格式同理

这是hexo官网上的描述。但是实际使用起来，并不像这里说的那么简单,如_posts下新建一个test.ejs
```ejs
<div class="ejs-demo">
  <%- console.log(site.posts) %>
</div>
```

这时候服务会报错，提示site没有声明，很显然，此时ejs书写的文章里面不能像主题模板ejs里面那样获取变量，但是既然要用到模板引擎书写文章、页面，或者基于模板引擎作为一个layout来书写，只是用来写一个没有动态数据的静态页面， 那不是多此一举吗？

## html

通过设置博客根目录下的_config.yml中的skip_render配置项，则其指定的某个或某些页面则会跳过hexo内部众多插件的处理，而直接由自己去书写完整的html，这对你想完全自定义一个页面是最佳并且唯一的方式，你可能想说，还可以设置markdown文章的front-matter中的layout为false,也会跳过渲染，但是会有一些恶心的问题。

此时的markdown依然会被对应的格式解析器进行处理，如转化为`p`，`ul` ,`li`， 但也仅限于此，只有这些代码了， 所有的html头部都没有，只有markdown解析后的结果，这样的页面甚至由于没有设置编码， 会以乱码的方式呈现在浏览器

{% note todo::待更新 %}
