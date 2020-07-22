---
title: 如何优雅的在ui组件库中覆盖样式
date: 2019-08-14 20:15:29
tags:
---

![image-20190814201559535](https://wx1.sinaimg.cn/mw1024/006i7cP6gy1g60i1f60m2j30bj03x75s.jpg)

我们正常写的所有样式，都会被加上[data-v-23d425f8]这个属性（如1所示），但是第三方组件内部的标签并没有编译为附带[data-v-23d425f8]这个属性。(所以根据组件内部的class去修改组件样式是不生效的)所以，我们想修改组件的样式，就没辙了。怎么办呢，有些小伙伴给第三方组件写个class，然后在一个公共的css文件中或者在当前页面再写一个没有socped属性的style标签，然后直接在里面修改第三方组件的样式。这样不失为一个方法，但是存在全局污染和命名冲突的问题。约定特定的命名方式，可以避免命名冲突。



通过深度选择器解决。例如修改上图中组件里的van-ellipsis类的样式，可以这样做：



.van-tabs /deep/ .van-ellipsis { color: blue};

 

这样就不会给van-ellipsis也添加[data-v-23d425f8]属性了。至此可以愉快的修改第三方组件的样式了。

<!--toc-->

## 方案一: css

```html
<style scoped>
```

```css
.a >>> .b { 
		...
}
```

```html
</style>
```



编译为

.a[data-v-f3f3eg9] .b {样式信息 }



## 方案二: less———deep

```html
<style lang="less" scoped>
```

```les
.cinema-edit-list {
    
    /deep/.ant-checkbox-group {
        margin-top: 10px;
    }
}
```

```html
</style>
```

