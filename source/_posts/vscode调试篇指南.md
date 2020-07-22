---
title: vscode调试篇指南
categories: 工具
---

分享一些在工作和生活当中很常见的些关于vscode调试的用法,让调试更方便

<!-- more -->

![](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/表情包活动营销公众号推图@凡科快图.png)

新人首次发文哈,大佬勿喷,有错的敬请指正哈。分享一些在工作和生活当中很常见的些关于vscode调试的用法，尤其是在node端，vscode集成的调试工具就更有用武之地了，好了废话不多说，开始啦。

## 1. 开始前的准备

由于笔者最近有需要制作cli的需求，基于公司内部的项目架构和部署方案，实现一套类似vue/cli的功能，因此看了一下vue/cli的源码，学习下尤大的设计思路，搭配项目来学习vscode的调试方案

首先找到vue/cli的源码所在目录，如果是mac系统，位于/usr/local/lib/node_modules/@vue

```
.
├── cli
│   ├── LICENSE
│   ├── README.md
│   ├── bin
│   ├── lib
│   ├── node_modules
│   └── package.json
├── cli-init
│   ├── LICENSE
│   ├── README.md
│   ├── index.js
│   ├── node_modules
│   └── package.json
└── cli-service-global
    ├── LICENSE
    ├── README.md
    ├── index.js
    ├── lib
    ├── node_modules
    ├── package.json
    └── template
```

+ cli 是@vue/cli大部分命令如create所在的目录, 用于创建项目
+ cli-init 从远端拉取模板创建项目
+ cli-service-global vue的零配置原型开发需要用到的

进入到cli目录中，打开vscode开始探索了

## 2. 初步源码分析

可以看到，入口文件在bin下的vue.js, 先来介绍一下这些“乱七八糟”的库吧.

```javascript
const chalk = require('chalk')	// 命令行常用的输出各种颜色的文本
const semver = require('semver')	// 用于匹配版本号，判断版本号是否符合要求等
const requiredVersion = require('../package.json').engines.node
const didYouMean = require('didyoumean')	
// 一个强大而简单的匹配js库，判断某个内容是否在某个列表中有潜在的可能

const slash = require('slash')    // 将windows 反斜杠路径转化为正斜杠
const minimist = require('minimist')    // 解析命令行参数的mini包
```

通常我们会选择`vue create`来初始化vue项目，来看看`vue create`命令做了哪些事吧

```javascript
const program = require('commander')		
// cli工具必用到的重要的库，提供命令行输入，分析命令行参数的功能， 由TJ大神所写
const loadCommand = require('../lib/util/loadCommand')

program
  .version(require('../package').version)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  // ...此处省略代码n行
  .action((name, cmd) => {
  	// create 命令后面的参数会被传递到action回调函数中，如果经过了parse转换，也会传递到program.args中
    // 格式化cmd的args
    const options = cleanArgs(cmd)
    if (minimist(process.argv.slice(3))._.length > 1) {
      // 如vue create demo demo1会报以下警告
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    // 创建app
    require('../lib/create')(name, options)
  })
```

commander的具体使用就不再赘述了，主要是version, option, command, description action, parse命令用的比较多, 见官方文档[https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md)



## 3. 调试工具配置

### 3.1 开启调试

![Snipaste_2020-07-13_16-31-38](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508be4b10c2ea.png)



mac下`⇧⌘D`可召唤出此面板，点击Run and Debug或者菜单栏/top bar的run下面的命令，之后vscode会有内置的环境的下拉列表提供选择，如node.js，如果您使用过react-native开发，也可以下载基于安卓和ios的调试插件`React Native Tools`，如果基于chrome调试前端应用，需要安装插件`Debugger for Chrome` 集成到vscode中来调试

注意要在相应环境下的入口文件处（比如当前环境为node，但是要调试的文件为es module的文件，如jsx， vue这些是打不开调试的）打开才有效果， 也可以点击上面蓝色的字体“create a launch.json file”，之后就会在项目文件夹夹下自动创建.vscode/launch.json文件,并初始化预置内容。就是现在这个样子了

![Snipaste_2020-07-13_16-42-47](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508aa3875dd6e.png)

然后，点击上图的RUN后面的蓝色箭头就可以开启调试了，这里的调试入口有三个地方，另外的两个就是软件的菜单栏的RUN，底部左边的状态条Launch Program都能顺利开启调试

![Snipaste_2020-07-14_10-00-09](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508b39934ee57.png)

这时候，就能在你代码处的数字序号前单击添加断点，单击之后，会有个红色小圆点，代码走到该断点会停下来，这些用法就和chrome的开发工具的调试一样的道理了，但是有个问题，这个相当于执行node vue.js， 并不是像vue create app等，无法传递参数，接下来咱们分析下launch.json文件的配置了

### 3.2 launch.json配置

- type - 调试器类型

- request - 支持launch(启动)和attach（附加）

  > 在VS Code中，有两种核心调试模式，启动和附加，它们处理两种不同的工作流和开发人员。根据您的工作流程，知道什么类型的配置适合您的项目可能会令人困惑

- name - 该调试的名称，可以配置环境的下拉列表里看到

- program - 启动调试时运行的文件， 即入口文件， 或者程序的可执行命令

- args - 传递给调试程序的参数，接收数组

- console - 调试窗口选择调试控制台或者终端，可选值internalConsole（vscode集成的调试控制台），integratedTerminal（vscode 集成终端）， externalTerminal（弹出系统默认终端）

^ + space快捷键可以唤起智能提示，列出当前可选属性

更多属性参考vscode官网 https://code.visualstudio.com/docs/editor/debugging#_launch-configurations

然后，我们就可以设置args给vue命令传递参数了，如*"args"*: ["create", "demo"]，还不够，因为我们要和终端交互式输出，比如根据用户的输入，配置vue项目的一些选项，如eslint等，所以要把默认的调试控制台换成终端，这时候才能在debugger的时候在命令行输入指令或者作出其他反馈

![Snipaste_2020-07-14_09-19-36](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508c4389d3fcf.png)

```json
"console": "integratedTerminal"
```

Vscode 强大的调试工具允许你做更多个性化的设置,如同时调试多个进程，常见的场景是服务端同构方案。vscode可以同时监控client端和server端。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Server",
      "program": "${workspaceFolder}/server.js"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Client",
      "program": "${workspaceFolder}/client.js"
    }
  ],
  "compounds": [
    {
      "name": "Server/Client",
      "configurations": ["Server", "Client"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

## 4. 调试行为

![Snipaste_2020-07-13_17-24-53](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508cad9cfb06c.png)

这些按钮功能同chrome开发工具的调试工具基本一致

+ Continue / pause 继续/暂停
+ Step  Over 单步执行时，遇到子函数时不会进行子函数内执行，而是执行完整个子函数
+ Step Into 单步执行时，遇到子函数会进入内部并且继续单步执行
+ Step Out 单步执行进入子函数内部时， 可以执行完子函数余下部分，并且返回上一层函数调用处
+ Restart 重新执行
+ Stop 关闭

## 5. 关于chrome调试

vscode 不仅能调试node程序，也能调试前端页面哈，不过这种一般就不怎么用了，chrome本身的调试工具搭配vue-devtools和react-devtools就很好用了

https://cn.vuejs.org/v2/cookbook/debugging-in-vscode.html

1. 使用`vue create [project]`创建项目

2. vscode安装插件`Debugger for Chrome`，`Debugger for Firefox`此模式下会自动启动一个chrome进程或者firefox来辅助调试（要先npm run server启动才行，否则访问不到页面）

**launch.json**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "vuejs: chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src",
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

此时可以在vue文件中的script中的代码打上断点，template和style里打断点是不生效的,此时代码中的console信息就会在chrome调试工具和vscode的调试控制台同时显示

![Snipaste_2020-07-15_10-36-39](https://cdn.jsdelivr.net/gh/lovelyJason/cdn-gallery/img/173508d35a437d52.png)

chrome下的blackbox，即黑盒。正常来说，调试前端应用的时候，逐行执行代码时，调试器时不时的跳到框架或库中去，这是个很头疼的事，所幸chrome提供了这样一个黑盒功能，帮助绕过框架或库的调试或者任何断点，让我们能更专注于自己代码。vscode中调试时设置*skipFiles*即可。

### 5.1 关于request

launch.json中的request表示了vscode的调试模式，两个可选项分别代表了两种工作模式，以上介绍的默认的配置为launch，vscode会新打开一个chrome实例并完全由vscode控制；如果设置为attach，表示调试外部环境的chrome实例，但是要在启动chrome的时候传递参数，这一块没做尝试。



主要的一些功能就这些了，如果是基于node的项目，则可以尝试用下vscode的调试工具啦，还是很强大的，传统的web项目，chrome的devtools和框架的devtools就已经足够了，谢谢观看

