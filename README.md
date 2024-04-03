# hexo使用事项

## 项目搭建和运行

1. 使用hexo-cli
2. 克隆hexo主题的单元测试项目
    开发主题时,选择此方式,因为单元测试库包括了所有边缘情况,而不是开发完再去测试
3. 开发环境: node v12.16.3 或 v16.16.0以上
4. 下载子模块
```bash
git submodule update --init --recursive
```

hexo文档地址查看详细内容：https://hexo.io/zh-cn/docs/variables.html
volantis文档地址查看详细内容：https://volantis.js.org
我的博客预览：https://www.qdovo.com

## 说明

路径和配置的简写说明：以下的blog代表项目根路径，如`blog._config.theme_config`代表项目根目录下的__config.yml文件中的theme_config项； 主题下的_`_config.yml`我会称为`theme.volantis._config`

## 数据交互

数据提供：主题配置 Front-mater(hexo官方配置+主题配置, 如自定义属性，通过page或post.属性获取，主题已扩展参数) >>> `blog._config.theme_config` >>> `blog._config.[theme].yml(Hexo 5.0.0 起提供)` >>> `theme.volantis._config`

~Font-matter中设置自定义属性不能获取到，其他可以~

config配置 && 变量获取：

+ 模板中,如swig,ejs
  通过theme(不用.config),或config.theme_config获取主题配置, config获取网站配置， 变量可获取
  
+ css预处理器中,如stylus
  通过主题定制的函数hexo-config获取theme变量中属性,不需要写theme,如果配置项中的值含有某些格式,需要使用stylus的convert函数转换
  
+ javascript中使用
  没有办法直接获取hexo内置theme变量,可以通过模板引擎间接获取,插入到head标签中,如
  
  ```javascript
  // config.swig
  <script>
    var config = {}
    window.config = config
  </script>
  ```

+ 插件（node.js）中使用
  `hexo.theme.config`

  在插件中获取已经注册的辅助函数
  `hexo.extend.helper.get('url_for').bind(hexo)`

  获取本地变量
  `hexo.locals.get('posts')`

## 关于部件

与meta不同，除主题现有的widget，可以创建自定义的widget，可以单独写在_data中

## 独立渲染

+ 根目录配置文件配置skip
+ md的front-matter的layout设置为false

## 变量 && 辅助函数

> 辅助函数帮助您在模版中快速插入内容。辅助函数不能在源文件中使用。
hexo中如css，js，url_for这类的辅助函数只能是在ejs模板中使用, 变量也是只能在模板中使用

## 文章写作tips

- hexo有三种默认布局，post, page, draft, 这三种布局定义在模板scaffolds下, 自定义布局和post布局的文章都会存储到source/_posts文件夹。但是tag和category,archive, friends为什么也是一种layout？？？, 不然无法渲染.是主题里面的定义的模板？

- 网站的source文件夹下，除_post文件夹之外，开头名为_下划线的文件/文件夹和隐藏文件会被忽略(可以利用这个存储自定义的css，js以供导入)。markdown和html文件会被解析并放到public文件夹，其他文件会被拷贝进去
如新建一个mypage/index.md文件，build以后会解析为public/mypage/index.html，主题下的source文件夹同理，也会相应被解析和拷贝

需要注意的是，如果自定义的styl样式表在_开头的目录下，并通过配置或者api注入到了页面中时，此时如果有字体图标文件夹fonts，不能放在该目录下，因为build后fonts不会被拷贝过去

styl中不能引入css?

除了常规的markdown写法，还可以借助hexo中的标签插件，以及主题中的增强的标签插件，注意冲突问题

- 标签插件
如引用块，代码块，反引号代码块，jsFiddle, iframe, Link, 图片, raw等等

图片：
markdown中引入写法：`![](https://cdn.qdovo.com/assets/Snipaste_2023-04-21_14-30-47.png)`
hexo标签写法：`{% img [class names] https://cdn.qdovo.com/assets/Snipaste_2023-04-21_14-30-47.png 200 200 '"title text" "alt text"' %}`
甚至还能用raw标签去书写html代码

iframe:
hexo标签写法
`{% iframe https://v2.cn.vuejs.org 500 500 %}`
或者使用raw标签
```
{% raw %}
<iframe src="https://v2.cn.vuejs.org" width="500" height="500"></iframe>
{% endraw %}
```
这两种都能正常工作

官网虽然说raw标签中能使用swig标签，但是不能插入变量的
```
{% raw %}
<a class='prev'>
  <p class='title'><i aria-hidden="true"></i><%- post.prev.title || '' %></p>
</a>
{% endraw %}
```
这种>`<%- post.prev.title || '' %>`会被原封不动输出

注意raw标签里面如果有主题提供的标签，是不能渲染成功的

- 自定义模板

在主题目录下的layout下新建ejs模板即可，依然是采用markdown书写.

场景：用来代替主题的文章样式，个性化所有文章

- 模板引擎

除了能用markdown书写文章，hexo支持任何格式书写，只要安装了相应渲染插件
hexo默认安装了`hexo-renderer-marked`和`hexo-renderer-ejs`,node_modules中可以找到，所以也能用ejs写作，改一下文件扩展名即可，其他格式安装对应的插件

场景：写一些比较自定义的页面，而不是文章

这里有坑，自定义的ejs中变量获取不到，下面有讲

关于资源文件夹：

引入图片的时候，简单图片可以放在source/images下，通过类似于 ![](/images/image.jpg) 的方法访问它们。

## 遇到的问题

+ 在某个独立页面根据插入js或者css,只有在当前页面刷新时才成功插入,其他页面进入无效果

+ 一个大坑,Hexo 内建 Nunjucks 模板引擎渲染模板文件，Nunjucks模板引擎语法和hexo或者主题标签插件{% %}冲突的问题,{% raw %} {% end raw %}可以渲染里面的html代码,但对标签插件不生效,目前不清楚是否主题原因
+ 实际上hexo server是hexo-server提供的命令,hexo-cli上无法调试此server命令
+ 切换主题务必hexo clean否则缓存样式丢失
+ 渲染顺序
  渲染文章：hexo.post.render(source, data);渲染字符串或文件: hexo.render.render()
  资料中必须包含 content 属性，如果没有的话，会尝试读取原始文件
  
  - 执行 before_post_render 过滤器
  - 使用 Markdown 或其他渲染器渲染（根据扩展名而定）， 如果这一步出错了，比如ejs中的变量报错就尴尬了。如果用ejs写文章，很多变量获取不到
  - 使用 Nunjucks 渲染
  - 执行 after_post_render 过滤器
  
  好像在ejs中写了front-matter也解析了，真神奇.并且这时候post变量有当前文章，还有自定义的ejs渲染后的文章，好友链页，为啥？
+ 数组arr: ['a', 'b', 'c']传递到ejs中，<%= arr %>或<%- arr %>会变成a,b,c.采取的事"<%= arr %>".split(',')
+ 模板里经常看到从配置项里面传入单行或多行html代码， 但是不能传入ejs的标识符。如`<script>let obj = <%- JSON.stringify(theme.sidebar.for_page) %></script>`, script是能渲染出来，但是`<%- JSON.stringify(theme.sidebar.for_page) %>`会被原样当成字符串渲染


## 主题升级log

- Volantis 5.7.7版本layout/_partial/head.ejs加载自定义css，如iconfont,custom，应该在配置文件中导入，借助api volantis_inject在指定地方导入
- 在hexo中书写自定义html
如果是整页自定义可以设置skip_render，然后新建目录下的html文件；或者在md中的front matter中设置layout: false, 此时markdown只会由`hexo-renderer-marked`解析为html，不会经过主题处理，甚至由于没有html的头部代码，渲染将会乱码

但是如果要保留网站头部，尾部，侧边栏这些，只是更改article.ejs中渲染的内容，以往的做法是新建md，然后在layout.ejs中的body之前的位置通过is_current判定路由地址后加载那个页面需要的js文件，并且还要在合适位置插入css，然后在article.ejs中判断路由地址，使用partial导入ejs，侵入性比较大 又容易与仓库上游造成冲突，也不易扩展

但是好像不设置skip_render，新建一个html的page，而不是md，这样网站的头部，尾部，侧边栏还是在的；侧边栏会根据标题标签h1-h6自动渲染出来目录,这也是一个写作的方式（问题：ejs中获取不到变量）


- 对于主题volantis v5.7 主题配置传入injects 可以注入css, js；也可以使用filter或injector在指定位置插入样式或脚本.
<!-- theme_inject的filter好像不是hexo官方的，来自于本主题 -->

- 如何生成自定义布局，开发个性化页面

在主题目录下的layout下新建ejs模板即可，然后在文章中更改layout为新建的模板文件名即可，也不需要使用hexo的api注册layout之类的

## 如何最小代价扩展主题


结合hexo和volantis的设定， 原则是不修改主题源码，不然将来如果拉取主题代码的更新时，会导致一系列冲突问题

即，如何在魔改主题的情况下还能兼顾更新，因此

1. 首先是主题配置文件，修改根目录下的_config.volantis.yml文件，覆盖顺序`blog/config.volantis.ytml`  >  `themes/volantis/_config.yml ` > `blog/_config.yml中的theme_config项`
2. 使用 Custom Files 自定义文件 和 Development API for Volantis.

Custom Files：包括样式和视图，其中样式：向theme/source/css/xxx.style不同位置注入样式；视图：向head,header,meta,body,footer等注入ejs模板

以上注入的文件书写位置在博客根目录blog/source/_volantis下，具体的文件名参考官网

3. hexo官方的injector(point是以下划线分割的，注意同volantis的注入point区别开来)，volantis的theme_inject(包括styls和view)的filter以及volantis_inject(内置helper函数，内部会去theme的config.injects寻找style和view，注入的节点同cusotom files一致，实际上custom files在模板中就是使用volantis_inject[point]注入ejs的)，具体用法和先后顺序参考项目中的scripts/index.js中的说明。theme_inject, volantis_inject，custome files注入的节点point都是同一套

除了api形式，配置形式的话： 在blog/_config.yml中配置import，还有我自己开发的page.import，即front-matter中指定的，具体这个可以参考我的这篇issue， https://github.com/volantis-x/hexo-theme-volantis/pull/883，

另外，`blog._config.volantis`中的injects项也支持配置注入(此配置项就是作为volantis_inject读取使用的)，他们的先后顺序参考source/_layout/ejs中的注释

4. 使用 @jiangtj/hexo-extend-theme 替换掉在 layout 文件夹下的主题文件，在blog._config.theme_plus中指定路径custom_path，目前我就是采用这个形式重写layout和其他ejs的

5. 使用 Hexo 插件系统 在 blog 目录根下创建 scripts 文件夹编写脚本，脚本可编写自定义插件和使用以上的内置api形式


## 其他一些还没搞懂的问题

hexo.locals是什么？scripts中的插件中不能直接获取全局变量，如posts，这是在ejs模板中使用的。
本地变量/局部变量用于模板渲染，就是模板中的site变量，有post, pages, categories, tags，这是属于hexo api, 用来编写插件

## 进行中的改动

- 文章封面动效
- 首页拉灯特效
- 换字体， icon颜色
- footer徽章
- 将开发一个爬取浏览器的元素以及所有需要用到的样式，并uncss和格式化处理

