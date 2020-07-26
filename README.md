# hexo使用事项

## 项目搭建

1. 使用hexo-cli
2. 克隆hexo主题的单元测试项目
  开发主题时,选择此方式,因为单元测试库包括了所有边缘情况,而不是开发完再去测试

## 数据交互

数据提供：主题配置 Front-mater >>> theme._config  >>> _config.theme_config

Font-matter中自定义属性不生效，其他可以

数据获取：

+ 模板中,如swig,ejs
  通过theme获取主题配置
  
+ css预处理器中,如stylus
  通过hexo内置函数hexo-config获取theme变量中属性,不需要写theme,如果配置项中的值含有样式,需要使用stylues内中convert函数转换
  
+ javascript中使用
  没有办法直接获取hexo内置theme变量,可以通过模板引擎间接获取,插入到head标签中,如
  
  ```javascript
  // config.swig
  <script>
    var config = {}
    window.config = config
  </script>
  ```



## 关于部件

与meta不同，除主题现有的widget，可以创建自定义的widget，可以单独写在_data中

## 遇到的问题

+ 在某个独立页面根据插入js或者css,只有在当前页面刷新时才成功插入,其他页面进入无效果

+ 一个大坑,Nunjucks模板引擎语法和标签插件{% %}冲突的问题