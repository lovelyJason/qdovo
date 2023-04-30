---
headimg: https://images.unsplash.com/photo-1680849488349-21138e052432?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80
---

## PR Type

<!-- Change [ ] to [x] to select (将 [ ] 换成 [x] 来选择) -->
<!-- What kind of change does this PR introduce? -->
<!-- PR带来了什么样的变化？ -->

- [x] Bugfix.
- [x] Feature.
- [ ] Code style update (formatting, local variables).
- [ ] Refactoring (no functional changes, no api changes).
- [ ] Build & CI related changes.
- [ ] Documentation.
- [ ] Translation.
- [ ] Other... Please describe:

## Description
<!-- Please describe the current behavior you are modifying, or link to a related question to describe the new behavior about this pr -->
<!-- 请描述您正在修改的当前行为，或链接到相关问题 ，描述关于这个PR的新行为-->
- 移动端菜单栏再次点击无法收起：

https://github.com/volantis-x/hexo-theme-volantis/issues/706

![image](https://user-images.githubusercontent.com/50656459/234505015-b77914cd-2cef-4c33-94d6-b26918efefda.png)

- 浏览器的滚动条样式支持配置文件定义就好了
```stylus
html
  color: var(--color-text)
  width: 100%
  height: 100%
  font-family: $fontfamily
  font-size: $fontsize-root
  >
    if hexo-config('custom_css.scrollbar.size')
      scrollbar()
```
改为

```stylus
html
  color: var(--color-text)
  width: 100%
  height: 100%
  font-family: $fontfamily
  font-size: $fontsize-root
  >
    if hexo-config('custom_css.scrollbar.size')
      scrollbar(convert(hexo-config('custom_css.scrollbar.size')), convert(hexo-config('custom_css.scrollbar.border')) || 0px, convert(hexo-config('custom_css.scrollbar.background')), convert(hexo-config('custom_css.scrollbar.hover_background')))
```
并新增background配置项
```yml
  scrollbar:
    size: 12px
    background: rgb(84,181,160) linear-gradient(45deg, rgba(255, 255, 255, 0.4) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 75%, transparent)
    hover_background：rgb(84,181,160) linear-gradient(45deg, rgba(255, 255, 255, 0.4) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 75%, transparent)
```

## Others

- Issue resolved: 

- Screenshots with this changes: 

- Link to demo site with this changes: 

