---
title: React中的样式方案
date: 2021-10-18
categories: React
headimg: https://images.unsplash.com/photo-1681679328683-c4d4ef25b90c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80
---

在webpack构建的前端项目中，无论是Vue还是React， 默认情况下，样式表应该是全局生效的，这是因为所有组件的DOM结构都是基于唯一的html页面。得益于Vue的style scoped特性， 会在最终生成样式的时候在元素上添加命名空间，以此来达到隔离样式和命名冲突的目的

React中样式表的使用有着几种常见方案

- 在组件中直接导入css或者less, scss等文件

```less
import 'xxxxx/.less'
```

这种方式引入的样式， 会作用于全局, 当然我们可以给组件的最外层包裹一个独一无二的类名

- 内联样式

```jsx
<p style={{ color: 'red' }}>hello</p>
```

样式属性需要使用驼峰命名，不能大量应用，也没有高亮提示，一般写一些简单样式

- 声明式内联样式

```jsx
const styles = {
  color: 'red',
  fontSize: '16px'
}

// ...

render() {
  return <p style={styles}>hello</p>
}
```

同样没有高亮提示，伪元素， 伪类样式也无法编写

- 样式模块化(css, less, scss都可以模块化)

样式模块化不是React独有的功能， 准确来说是webpack的loader提供的支持， 让我们可以像引入js一样去引用我们的代码，样式中的每一个类名都是应用对象的一个属性，并在在打包的时候，可以根据要求生成对应哈希值，杜绝样式命名冲突的问题

```javascript
// webpack.config.js

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
            }
          }
        }
      }
    ]
  }
}
```

优点就是将样式文件作为模块引入， 只作用于当前组件， 不会造成污染， 缺点就是不方便动态设置样式啦，还得借助内联样式

- css in js

顾名思义就是把css写在js中。这是随着React活跃以后， 新出现的一种写法和趋势，这种方式， 也有很多人认为在走老路。前端的发展将html, css, js三层分离， 而css in js的出现在背离这种模式

实现了css in js的方案有很多，这里推荐`styled-components`

styled-components不需要为DOM节点设置样式名，使用模板字符串定义标签和样式后会得到一个Component直接使用

```javascript
style.js

import styled from 'styled-components'

export const Container = styled.div`
  width: 600px;
  height: 100%;
  color: #333;
`
```

组件中使用它

```javascript
import React, { Component } from 'react'

import { Contaiter } from './style.js'

class Com extends Comonenet {
  constructor(props) {
    super(props)
  }
  render () {
    return (
      <div>
        <Container></Container>
      </div>
    )
  }
}

export default Com
```

编译结果是， `styles-components`会动态生成一个随机哈希值的css选择器，并将定义的样式通过style标签插入到head标签中

另外还有一种库，代表是`radium`.不同的是， `radium`生成的是内联样式，`radium`还为媒体查询，伪类等样式封装了一些标准接口以便使用，这种好处是可以避免权重的烦恼