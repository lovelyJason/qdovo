---
title: 开发一款专属的 VSCode 代码提示插件
date: 2023-05-07 21:04
categories: 工具
tags: vscode
headimg: https://cdn.qdovo.com/img/post/u%3D3847275904%2C4151412532%26fm%3D253%26fmt%3Dauto%26app%3D120%26f%3DJPEG.webp
---

此文为转载，主要介绍`vscode`代码片段以及代码提示等IntelliSense能力，自己正好需要这部分知识.原文地址：https://developer.aliyun.com/article/883403

作为前端开发者一定用过VsCode这款利器，而其强大的插件能力无疑更是让我们深深的爱上了它。据不完全统计，VsCode插件市场中的插件数量已经超过了3万，由此可见大家的热情有多高。其中涉及到各种各样功能的插件，有主题曲相关的，有代码开发相关的，比如代码片段、Git插件、tslint等等。作为开发者，肯定用过各种各样的代码提示的插件，代表性的有TabNine、Copilot等等。今天就让我们来自己动手，开发一款专属的代码提示插件。毕竟别人的再好也是别人的， 属于自己的才是最好的。

## 开发前准备

### 1、环境搭建
关于VsCode插件的开发环境搭建教程网上有很多，这里就不进行赘述了，具体可以参考这里的官方文档（https://code.visualstudio.com/api/get-started/your-first-extension）。

### 2、关于代码提示
这里的代码提示是指在编写代码过程中，VsCode基于当前的输入，会弹出一个面板，显示出你可能的一些输入。如果存在你预期的输入，直接按enter或者tab键（可以在设置中进行修改）即可将推荐的代码输入到编辑器中。这样可以极大的提升我们开发的效率，毕竟按一个键直接一行代码，远比我们一个一个字符敲出来高效。

![](https://cdn.qdovo.com/img/post/4dba8d87e1174abc92a5e9e3a9cbe373.png)

看到这里，大家可能会好奇，这里有这么多推荐的选项，那么这些代码是从哪里来的呢？为什么有的根本不是我想要的也会被推荐呢？这里据我研究（我也没看过源码），这里的选项来源有以下几个：
1. LSP（语言服务协议）的具体实现，其实就是VsCode支持语言。比如选择了TypeScript，在编写代码时就会出现ts语法相关的提示。举个例子，比如输入了con，那么这里出现的const、console以及continue都是ts语法中的关键字。
2. 各种内置的代码片段（Code Snippet）。VsCode本身就有很多内置的代码片段，代码片段也可以帮助我们进行快速的输入，一般的代码片段都不止一行代码，可以帮我们省略很多输入。除了内置的代码片段，我们也可以配置自己的代码片段，这个也是我们定义专属插件的一部分。

![](https://cdn.qdovo.com/img/post/1cfd52f6a9b44ea4b5366866f293f565.png)

![](https://cdn.qdovo.com/img/post/aacb4270b281476084ed9a1cf9e17de8.png)

3. 对象路径、导出对象提示，比如我在另外的文件中定义了一个 APP的常量和一个Test的方法，然后在当前文件中，输入 AP，可以看到第一条就是之前定义的常量，这个时候按下tab之后，不仅会补全变量名，同时会在顶部加入 import语句

![](https://cdn.qdovo.com/img/post/e3e2606963fa4cb79fc84cf92e81cc01.png)

![](https://cdn.qdovo.com/img/post/e3e2606963fa4cb79fc84cf92e81cc01.png)

4. 最后就是各种插件提供的选项了，这部分也是我们今天开发专属插件的主要内容。可以看出，繁多的插件带来了很多提示，但同时也加重了我们辨别、思考的负担，在一页页提示中找我们想要的代码，然而有这个时间可能早已经全部敲出来了。因此插件并不是万能的神器，也不是数量越多越好，仅仅安装一些常用、好用的插件即可。

![](https://cdn.qdovo.com/img/post/bcb5ba2729fb4ca482a6785ae4576786.png)

## 插件开发

### 1、代码片段配置

代码片段配置方法有两种：
1. 直接配置在VsCode中，方法为：
  - 呼出VsCode 命令面板，找到代码片段配置
  ![](https://cdn.qdovo.com/img/post/5f47e80a433c4a54bc51ac1b32250723.png)
  - 选择要配置的语言，比如这里选择typescriptrect，就是我们常用的.tsx文件。（这个是tsx文件类型在vscode中的key）
  ![](https://cdn.qdovo.com/img/post/fc7b08b9a6e048099dbd3edbeca05053.png)

  - 选择之后会展示当前本地默认的代码片段配置，比如Python长这样。而我们要做的就是在这个json文件中加入我们自己的代码片段。
  ![](https://cdn.qdovo.com/img/post/0afce318ed23446fb161de144ceb6a05.png)

2. 开发代码片段的插件：
  同时也可以开发一个代码片段相关的插件，这样不管在哪里，直接下载对应的插件就可以多个编辑器通用，比存在本地好很多。
  代码片段插件的开发相对简单，就只需两步：
  - 在插件脚手架根目录中加入一份json格式的配置文件即可。
  - 在package.json中增加如下配置。作用是声明代码片段相关的信息，包含：对应的语言，即文件类型，代码片段对应的路径。下面展示的是同一份配置文件同时应用于 ts、tsx、js和jsx文件。

  ```json
  "contributes": {
    "snippets": [
      {
        "language": "typescriptreact",
        "path": "./snippets.json"
      },
      {
        "language": "typescript",
        "path": "./snippets.json"
      },
      {
        "language": "javascript",
        "path": "./snippets.json"
      },
      {
        "language": "javascriptreact",
        "path": "./snippets.json"
      }
    ]
  }
  ```

### 2、代码片段的一些思路

代码片段相对简单，就是把一些固定的模式配置出来，通过快捷键直接输入。这里提供几个思路：
- 组件开发代码片段，因为每次新组件的开发有很多固定的内容，因此很容易想到把这些代码记到代码片段里，这里提供一份参考：

```json
"component": {
  "prefix": [
   "component"
  ],
  "body": [
   "import * as React from 'react';",
   "",
   "export interface IProps {",
   "\t${1}",
   "}",
   "",
   "const ${2}: React.FC<IProps> = (props) => {",
   "\tconst { } = props;",
   "",
   "\treturn (",
   "\t\t<div className=\"component-$3\">",
   "\t\t\t$4",
   "\t\t</div>",
   "\t);",
   "};",
   "",
   "export default ${2};",
   "",
  ],
  "description": "生成组件模版"
 },
```

- import语句，import语句本身其实就有，但是默认是双引号，每次都需要autofix一下也很烦，就一句话简单定义一下

```json
"import": {
  "prefix": "import",
  "body": [
      "import ${1} from '${2}';"
  ],
  "description": "导入"
}
```

- 我比较喜欢自定义一些代码区块，因此经常会用到region操作，因此把它也作为一个代码片段记下来

```json
"region": {
  "prefix": "region",
  "body": [
      "// #region ${1}\n ${2}\n// #endregion"
  ],
  "description": "自定义代码块"
}
```

Tips：可以看到上面有很多变量，比如${1}等等，具体的用法可以参考官方文档（https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets）。一些常用的、固定的模版记录下来还是很方便的。

## 代码推荐插件

这里才是我们的正题，自定义我们的专属插件。

### 1、了解下脚手架

首先，脚手架初始化好之后，我们看下代码目录，src目录下的extension.ts就是我们要写的插件代码了，可以看到初始化的文件长这个样子。里面包含了两个方法activate和 deactivate，以及大量的注释。大概了解一下，就是每个插件都有自己的生命周期，而这两个生命周期方法就是对应插件激活和注销的生命周期。
而我们的主要推荐逻辑也是写在activate方法中。

![](https://cdn.qdovo.com/img/post/0102ea6e714f4cb7aaa7086c618370ac.png)

### 2、用到的API
我们用到的最基本的API就是registerCompletionItemProvider，位于vscode.languages的命名空间下。顾名思义，这个方法就是注册一个代码补全的provider。具体的API可以参考官方文档（https://code.visualstudio.com/api/references/vscode-api）。

### 3、基本代码

```javascript
import * as vscode from "vscode";
/** 支持的语言类型 */
const LANGUAGES = [
  "typescriptreact",
  "typescript",
  "javascript",
  "javascriptreact",
];
export function activate(context: vscode.ExtensionContext) {
  /** 触发推荐的字符列表 */
  const triggers = [" "];
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const completionItem: vscode.CompletionItem = {
          label: "Hello VsCode",
        };
        return [completionItem];
      },
    },
    ...triggers
  );
  context.subscriptions.push(completionProvider);
}

```

上面是一份实现代码补全的最基本代码，注册一个completionProvider，返回vscode.CompletionItem的数组即可。上面的代码F5 Debug一下即可看到效果

![](https://cdn.qdovo.com/img/post/2ad83f4bce554fca83ddfc1e5343cc38.png)

### 4、自定义逻辑

上面这个demo的效果肯定不是我们想要的，既然我们的目标是专属，那肯定得有些不一样的东西。

##### 支持单词补全

作为一个英文渣，稍微长一点的单词就得查词典，那么这个操作为什么不通过插件来帮我们实现呢？思路其实也简单，就是找一个稍微完善的英文词库，下载到本地，然后根据当前的输入每次都去查一下词库返回最匹配的就好了。这里提供一份最简单的实现逻辑

```javascript
import * as vscode from "vscode";
/** 支持的语言类型 */
const LANGUAGES = [
  "typescriptreact",
  "typescript",
  "javascript",
  "javascriptreact",
];
const dictionary = ["hello", "nihao", "dajiahao", "leihaoa"];
export function activate(context: vscode.ExtensionContext) {
  /** 触发推荐的字符列表 */
  const triggers = [" "];
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const range = new vscode.Range(
          new vscode.Position(position.line, 0),
          position
        );
        const text = document.getText(range);
        const completionItemList: vscode.CompletionItem[] = dictionary
          .filter((item) => item.startsWith(text))
          .map((item, idx) => ({
            label: item,
            preselect: idx === 0,
            documentation: "我的专属VsCode插件提供",
            sortText: `my_completion_${idx}`,
          }));
        return completionItemList;
      },
    },
    ...triggers
  );
  context.subscriptions.push(completionProvider);
}

```

下面是效果：

![](https://cdn.qdovo.com/img/post/680a08d78e8b44398c83215ecfdf8dd0.gif)

当然，上面的代码片段还有很多需要完善的地方，比如：
- 推荐的匹配逻辑。现在是当前行的字符串匹配单词的开头，这样明显是有问题的，中间加个其他字符就无法匹配了，需要考虑分词，甚至是非连续匹配，比如输入lh，推荐出 leihaoa。还有一个办法就是 不加任何匹配逻辑，不管输入什么，全部一股脑的扔给Vscode，由vscode去自行匹配。这样当然也可以，但是当你的词库足够大的时候，就不太好了，还是自己先做一遍简单的筛选好一些。
- 单词的信息量太少。目前就只有个单词，最好能加上些解释、用法会更好一些

### 5、个性化代码推荐

没有什么比个性化的代码推荐更适合自己了，毕竟没有人会更了解自己。我们的大致思路也简单，并不涉及到深度学习之类的。就是在编写代码过程中记录下自己的输入，对于这份数据进行处理，形成一份类似于词典的文档，方法和上面单词补全类似，根据输入查词典，获取最匹配的推荐即可。同时因为要做到个性化，那么这份词典必须要自动更新，才能满足我们个性化的需求。
说起来简单，这里有几件事情需要做：
1. 初始文档如何获取？
2. 词典自动更新逻辑如何实现？
简单的思路：
1. 直接拿自己的代码库的代码进行抽取、处理，形成初始的词典。理论上代码库越丰富，词典越准确。那么同时带来了另外的问题，即：
  a. 如何从 代码 --> 词典 进行转换？同样简单处理的话，可以直接把代码根据空格进行分词，记录对应的词典
  b. 推荐的顺序如何确定？可以简单根据单词出现的次数决定推荐的顺序，次数越大，顺序越靠前
2. 可以在每次接受推荐的时候，同时记录当前的文档内容，更新词典
这里的代码处理形成词典的过程 和 词典自动更新的代码就不放了，简单修改下上面的代码如下：
大致代码如下；

```javascript
import * as vscode from "vscode";
/** 注册选择推荐项时的触发的命令 */
function registerCommand(command: string) {
  vscode.commands.registerTextEditorCommand(
    command,
    (editor, edit, ...args) => {
      const [text] = args;
      // TODO 记录当前内容到词典中，并自动更新词典
    }
  );
}
/** 支持的语言类型 */
const LANGUAGES = [
  "typescriptreact",
  "typescript",
  "javascript",
  "javascriptreact",
];
const dictionary = ["hello", "nihao", "dajiahao", "leihaoa"];
/** 用户选择之后触发的命令 */
const COMMAND_NAME = "my_code_completion_choose_item";
export function activate(context: vscode.ExtensionContext) {
  /** 触发推荐的字符列表 */
  const triggers = [" "];
  registerCommand(COMMAND_NAME);
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const range = new vscode.Range(
          new vscode.Position(position.line, 0),
          position
        );
        const text = document.getText(range);
        const completionItemList: vscode.CompletionItem[] = dictionary
          .filter((item) => item.startsWith(text))
          .map((item, idx) => ({
            label: item,
            preselect: idx === 0,
            documentation: "我的专属VsCode插件提供",
            sortText: `my_completion_${idx}`,
            command: {
              arguments: [text],
              command: COMMAND_NAME,
              title: "choose item",
            },
          }));
        return completionItemList;
      },
    },
    ...triggers
  );
  context.subscriptions.push(completionProvider);
}

```

可以看到，相比单词补全，多了registerCommand方法，并且在每个推荐项都加了command参数，逻辑就是在每次选择推荐项的时候触发这个command，然后做词典的更新。
实现仅供参考，如果做的再好一点，可以尝试：
1. 自动更新的逻辑需要完善，并且放到后台去
2. 可以尝试句子的推荐，而不仅仅是单个单词
3. 排序的逻辑可以再优化，根据出现的次数还是太原始