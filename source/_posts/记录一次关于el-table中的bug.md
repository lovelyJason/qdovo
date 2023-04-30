---
title: 记录一次关于el-table中的bug
categories: Vue
date: 2022-03-12
headimg: https://images.unsplash.com/photo-1682127947634-8e26b58eaee1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80
---

项目中使用element-ui 2.x的最后版本2.15.13， 偶然情况下发现el-table组件有个奇怪的问题

涉及到行列合并的复杂表格时，数据有一定概率发生错乱，正常情况下是这样的

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_19-33-17.png)
{% endgallery %}

而有些数据会导致表格错误渲染成以下这样

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_19-39-14.png)
{% endgallery %}

甚至是更加奇怪的样子