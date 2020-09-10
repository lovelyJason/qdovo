---
title: js函数注释规范
---

js函数注释规范

<!-- more -->

一个好的函数离不开一个好的注释说明,如何写一个规范的注释说明,也是有一定的讲究.现在的IDE或编辑器中都已内置底层的lib库,点击即可跳转过去,可以查看官方的函数的一些注释说明,接收什么参数,返回什么参数都一目了然
并且可以高亮显示

如:

```javascript
/**
 * 测试
 * @param {number} num
 * @return {void}
 */
function test(num) {
  console.log(num);
}
```

## 常见的几个注释规范

| 符号       | 用法                   |
|----------|----------------------|
| @param   | @param \{类型\} 参数名 描述 |
| @return  | @return \{类型\} 描述    |
| @author  | @author 作者           |
| @version | @version 版本号         |


## 一些其他的规范

| 符号       | 用法                   |
|----------|----------------------|
| @todo   | @todo 待办 |
| @link  | @link 链接,引用文档等           |
| @see  | @see 与link类似,可以访问内部方法或类    |
| @copyright | @copyright 版权说明         |

vscode中输入@即可开启下拉的智能提示,列出当前所有可选项
