---
title: react+ant-design入坑
date: 2019-08-12 14:41:24
categories: react
tags: [and-design,react]
---

## 写在前面

首次用react+design开发公司的项目,记录一些开发的历程,大佬勿喷

## 1. 表单组件

1. 经过getFieldDecorator包装的Input以及其他组件的defaultValue无效,需设置options.initialValue

## 报错信息

> You cannot set a form field before rendering a field associated with the value
>
> 你不能在页面未渲染之前就进行form表单的相关信息的设置

原因:

有的属性没有在getFieldDecorator中注册就调用`setFieldsValue`导致的

解决方案:

不要在 componentDidMount 中调用 setFieldsValue 来赋初始值。初始值应该用 initialValue（非受控）或者 mapPropsToFields （受控）来做。

有在网上看到过用定时器去解决的,但其实这次没效果

```javascript
    setTimeout(()=>{
        this.props.form.setFieldsValue({
            'userName':value.name
        })
    },0)
```

后来检查代码发现,我回填到表单域中的数据是只有三个字段,而我传的参数含有四个字段

```java
    // 回填数据
    backFill(data) {
        // this.props.form.setFieldsValue(data)
        this.props.form.setFieldsValue({
            name: data.name,
            code: data.code,
            phone: data.phone
        })
    }
```

因为data的数据多了一个字段id,而form.setFieldsValue传来的数据这个方法只能适用于field存在的前提下

可以参考这篇文章

https://zhuanlan.zhihu.com/p/67937366

> Warning: `defaultValue` is invalid for `getFieldDecorator` will set `value`, please use `option.initialValue` instead.

原因: 经过getFieldDecorator包装的表单组件value已经被托管,不能设置此属性

------



> Each child in an array or iterator should have a unique "key" prop. Check the render method of `DropdownMenu`

出现此原因不一定是map循环遍历时少了key属性,更坑爹的是value属性有误也是报这个错误

> **Warning: React.createElement: type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.You likely forgot to export your component form the file it's defined in**

可能import 导入有问题 