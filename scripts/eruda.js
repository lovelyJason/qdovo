const path = require('path')

const js = hexo.extend.helper.get('js').bind(hexo)

// https://cdn.bootcdn.net/ajax/libs/eruda/3.0.0/eruda.min.js
// 在 after_render:html 过滤器 之前 完成注入。

// 貌似返回的script里面的代码不会执行，应该是只能插入scrpit src=这种代码
hexo.extend.injector.register('body_end', () => {
  return js('/js/eruda.js')
})