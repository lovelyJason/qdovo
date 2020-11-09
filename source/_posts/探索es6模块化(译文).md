---
title: 探索es6模块化(译文)
---

ES6模块化详解

<!-- more -->

临时:
es6模块只支持静态存储,不可以在条件语句或函数作用域中使用

Javascript的模块化已经有很长时间的历史了.但是,它们是通过库而不是语言内置实现的.es6是javascript首次拥有内置模块化的版本

ES6模块存储在文件中.每个文件是一个模块,每个模块是一个文件.有两种方法可以从模块导出内容,这个两种方法可以混合使用,但是通常最好单独去使用它们

异步/动态导入 dynamic imports
import().then 
等价于 await import()

## 1.概览

**导出每个函数/变量 named exports**

```javascript
//------ lib.js ------
export const sqrt = Math.sqrt;
export function square(x) {
    return x * x;
}
export function diag(x, y) {
    return sqrt(square(x) + square(y));
}

//------ main.js ------
import { square, diag } from 'lib';
console.log(square(11)); // 121
console.log(diag(4, 3)); // 5
```

你也可以导入整个完整的模块

```javascript
//------ main.js ------
import * as lib from 'lib';
console.log(lib.square(11)); // 121
console.log(lib.diag(4, 3)); // 5
```

**导出一个默认函数/变量 default exports**

可以有一个默认导出,如函数

```javascript

//------ myFunc.js ------
export default function () { ··· } // 没有分号!

//------ main1.js ------
import myFunc from 'myFunc';
myFunc();
```

也可以是class

```javascript
//------ MyClass.js ------
export default class { ··· } // no semicolon!

//------ main2.js ------
import MyClass from 'MyClass';
const inst = new MyClass();
```
注意: 如果默认导出一个函数或者class,末尾不能有分号

**混合导出mixined exports**



**别名导出re-exporting**



**中转模块导出 module redirects**

## 浏览器: 脚本与模块

|                                        | 脚本       | 模块                     |
| -------------------------------------- | ---------- | ------------------------ |
| HTML 元素                              | `<script>` | `<script type="module">` |
| 默认模式                               | 非严格模式 | 严格模式                 |
| 顶部变量是                             | global     | 模块的局部变量           |
| 顶部的this                             | window     | undefined                |
| 执行时机                               | 同步       | 异步                     |
| 是否支持声明式导入 \(import语句\)      | 否         | 是                       |
| 是否支持编程式导入\(基于promise的api\) | 是         | 是                       |
| 文件扩展名                             | \\\.js     | \\\.js                   |

备注:
编程式导入,如`import('./**.js').then()`

## 2.javascript中的模块

尽管此前javascript从来没有内置模块化,但是社区中已经集中在了一种简单的模块风格上,这是由ES5和更早版本的库所支持的.这种风格也被ES6采用了

+ 每个模块都是一段只要加载过一次,就能执行的代码片段
+ 在这个代码段里,可能有声明(变量声明,函数声明等)
  + 默认情况下,这些声明只保留在模块局部
  + 你可以将其中的一些标记导出,这样其他模块中就能引入他们
+ 一个模块可以从其他模块导入内容。它通过模块说明符引用这些模块，这些字符串可以是：
  + 相对路径('../model/user'): 这些路径的解析为相对于导入模块位置来说.文件扩展名.js通常可以省略
  + 绝对路径('/lib/js/helper): 直接指向要导入的模块的文件路径
+ 模块是单例,即使一个模块被多次导入,它也只有一个实例存在

这种模块的方式避免了全局变量污染,唯一全局的是模块说明符

### 1.ES5模块系统

没有该语言的明确支持,ES5模块系统的运行状况令人印象深刻,两个最重要的(不幸的是不兼容的)标准是:

+ CommonJS模块: 该标准的主要实现是在Node.js中(Node.js模块有一些超出了CommonJS的特性).特征如下:
  + 简洁语法
  + 专门为同步加载和服务端实现
+ 异步模块定义(AMD): 该标准最受欢迎的实现是RequireJS.特征如下:
  + 略微复杂的语法,允许AMD不需要再eval(或编译步骤)的情况下工作
  + 为异步加载和浏览器端设计

以上只是对ES5模块的简单解释.如果你想要更深入的材料,不妨看看这些书Writing Modular JavaScript With AMD, CommonJS & ES Harmony by Addy Osmani.

## 2.ES6模块存

ES6模块的目标是创建一种CommonJS和AMD用户都满意的格式

+ 与CommonJS类似,它们都有简洁的语法,偏爱单一导出,并支持循环依赖的关系
+ 与AMD类似,它们都支持异步加载和可配置化的加载

内置到语言中,使用es6mok可以超越CommonJS和AMD(详细信息将在稍后解释)

+ 语法比CommonJS更为简洁
+ 可对其结构进行静态分析(用于静态检查,优化等)
+ 对循环依赖的支持比CommonJS更好

## ES6模块的基础知识

有两种形式导出: 命名导出(多个单一模块)和默认导出(一个单独模块).正如后面解释的那样,可以同时使用这两种方法,但通常最好将它们区分开来使用

### 命名导出(多个单一模块)

模块可以通过在声明前加上关键字export导出多个内容。这些导出根据其名称进行区分，称为命名导出。

```javascript
//------ lib.js ------
export const sqrt = Math.sqrt;
export function square(x) {
    return x * x;
}
export function diag(x, y) {
    return sqrt(square(x) + square(y));
}

//------ main.js ------
import { square, diag } from 'lib';
console.log(square(11)); // 121
console.log(diag(4, 3)); // 5
```

还有其他指定命名导出的方法(稍后将解释)，但我发现这种方法非常方便:只需像编写外部世界一样编写代码，然后用关键字标记希望导出的所有内容。

如果愿意，还可以导入整个模块，并通过*符号引用其命名的导出

```javascript
//------ main.js ------
import * as lib from 'lib';
console.log(lib.square(11)); // 121
console.log(lib.diag(4, 3)); // 5
```

使用CommonJS语法编写相同的代码: 有一段时间,我尝试了几种明智的策略来减少Node.js中模块导出的冗余.现在我更喜欢下面这张简单但有点冗长的风格,使人联想到revealing module pattern

```javascript
//------ lib.js ------
var sqrt = Math.sqrt;
function square(x) {
    return x * x;
}
function diag(x, y) {
    return sqrt(square(x) + square(y));
}
module.exports = {
    sqrt: sqrt,
    square: square,
    diag: diag,
};

//------ main.js ------
var square = require('lib').square;
var diag = require('lib').diag;
console.log(square(11)); // 121
console.log(diag(4, 3)); // 5

```

### 默认导出(单一模块)

只导出单个的模块在Node.js社区中非常流行.但是在前端开发中也很常见.在前端开发中，您经常有用于模型和组件的类，每个模块一个类。 ES6模块可以选择默认导出，即主要导出值。 默认导出特别容易导入

以下ES6模块"是"一个单独函数

```javascript
//------ myFunc.js ------
export default function () {} // no semicolon!

//------ main1.js ------
import myFunc from 'myFunc';
myFunc();
```

ES6模块的默认导出是一个类，如下所示

```javascript
//------ MyClass.js ------
export default class {} // no semicolon!

//------ main2.js ------
import MyClass from 'MyClass';
const inst = new MyClass();
```

有两种默认导出的风格:

#### 标识声明

您可以在任何函数声明(或生成器函数声明)或类声明前面加上关键字export default，使其成为默认导出

```javascript
export default function foo() {} // 没有分号
export default class Bar {} // 没有分号
```

在这种情况下，您也可以省略名称。 这使得默认导出成为JavaScript具有匿名函数声明和匿名类声明的唯一一个场景

```javascript
export default function () {} // 没有分号
export default class {} // 没有分号
```

##### 为什么是匿名函数声明而不是匿名函数表达式

查看前两行代码时，您期望导出的默认操作数为表达式。 它们只是出于一致性的原因而声明：可以将操作数命名为声明，将它们的匿名版本解释为表达式会令人困惑（甚至比引入新的声明更是如此）。

如果希望将操作数解释为表达式，则需要使用括号

```javascript
export default (function () {});
export default (class {});
```

#### 直接导出默认值

这些值是通过表达式生成的

```javascript
export default 'abc';
export default foo();
export default /^xyz$/;
export default 5 * 7;
export default { no: false, yes: true };
```

每个默认导出具有以下结构。

`export default «expression»;`

等价于

```javascript
const __default__ = «expression»;
export { __default__ as default }; // (A)
```

第A行中的语句是一个export子句([后面](http://www.)将对此进行解释)。

##### 为什么有两个默认导出的风格

之所以引入第二种默认导出样式，是因为如果变量声明多个变量，则无法有效地将其转换为默认导出

```javascript
export default const foo = 1, bar = 2, baz = 3; // 非法JavaScript!
```

foo，bar和baz这三个变量中的哪一个是默认导出？

### 导入和导出必须放在最顶层

正如后面详细解释的那样，ES6模块的结构是静态的，您不能有条件地导入或导出内容。这带来了很多好处。

通过只允许在模块的顶层进行导入和导出，可以在语法上强制执行此限制

```javascript
if (Math.random()) {
    import 'foo'; // 语法错误
}

// 不能将'import'和'export'嵌套在块级区域中使用
{
    import 'foo'; // 语法错误
}
```

### imports 提升

模块导入被提升（内部移动到当前作用域的开头）。 因此，在模块中的何处提及它们都无关紧要，以下代码可以正常工作：

```javascript
foo();

import { foo } from 'my_module';
```

### imports是exports的只读层

ES6模块的导入是导出实体上的只读层。 这意味着到模块主体内部声明的变量的连接保持活动状态，如以下代码所示。

```javascript
//------ lib.js ------
export let counter = 3;
export function incCounter() {
    counter++;
}

//------ main.js ------
import { counter, incCounter } from './lib';

// The imported value `counter` is live
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```

[后面的部分](http://)将解释其工作原理。

导入为视图具有以下优点：

+ 它们支持循环依赖，甚至对于不合格的导入(如下一节所解释的)。
+ 合格和不合格的导入以同样的方式工作(他们都是间接的)。
+ 您可以将代码分割为多个模块，并且它将继续工作(只要您不尝试更改导入的值)。

### 支持循坏依赖

两个模块A和B都(周期性/间接性)导入B且B导入A,则两个模块彼此循环依赖.如果可能,应避免循环依赖,它们导致AB紧密耦合,只能一起使用和发展

那么，为什么支持循环依赖呢?有时，您无法绕过它们，这就是为什么支持它们是一个重要特性的原因。[后面的部分]()将提供更多信息。

让我们看看CommonJS和ECMAScript 6是如何处理循环依赖关系的。

#### CommonJS中的循环依赖

下面的CommonJS代码正确地处理了两个模块a和b，这两个模块相互依赖。

```javascript
//------ a.js ------
var b = require('b');
function foo() {
    b.bar();
}
exports.foo = foo;

//------ b.js ------
var a = require('a'); // (i)
function bar() {
    if (Math.random()) {
        a.foo(); // (ii)
    }
}
exports.bar = bar;
```

如果首先导入模块a，则在第i行中，模块b在将导出添加到模块b之前会获得a的导出对象。 因此，b不能在其顶层访问a.foo，但是一旦a的执行完成，该属性就存在。 如果随后调用bar（），则第二行中的方法调用将起作用。

一般而言，请记住，对于循环依赖项，您无法在模块主体中访问导入。 这种现象是固有的，对于ECMAScript 6模块不会改变。

CommonJS方法的局限性是：

+ Node.js风格的单值导出不起作用。在这里，您导出单个值而不是对象

  ```javascript
  module.exports = function () { ··· };
  ```

  如果模块a这样做了，那么一旦分配完成，模块b的变量a就不会被更新。它将继续引用原始的exports对象。

+ 不能直接使用命名(named exports)导出。也就是说，模块b不能像这样导入foo

  ```javascript
  var foo = require('a').foo;
  ```

  foo是undefined。 换句话说，您别无选择，只能通过a.foo引用foo。

  这些限制意味着出导入和导出都必须了解循环依赖关系，并明确支持它们。

#### ES6中的循环依赖

ES6模块自动支持循环依赖关系。 也就是说，它们没有上一节中提到的CommonJS模块的两个限制：默认导出有效，不限定名称的导入也有效（在下例中，第i和iii行）。 因此，您可以按以下方式实现彼此循环依赖的模块。

```javascript
//------ a.js ------
import {bar} from 'b'; // (i)
export function foo() {
    bar(); // (ii)
}

//------ b.js ------
import {foo} from 'a'; // (iii)
export function bar() {
    if (Math.random()) {
        foo(); // (iv)
    }
}
```

这段代码可以工作，因为正如前一节所解释的，导入是导出的视图。这意味着即使是不合格的导入(如第ii行中的bar和第iv行中的foo)也是间接引用原始数据的。因此，在面对循环依赖关系时，通过非限定导入或通过其模块访问命名导出并不重要:在这两种情况下都涉及到间接操作，而且总是可以工作的。

## 导入和导出的详细信息

### 导入风格

ES6提供了多种导入风格

+ 默认导出

```javascript
import localName from 'src/my_lib';
```

+ 命名空间导入:将模块作为对象导入(每个命名导具有一个属性)

```javascript
 import * as my_lib from 'src/my_lib';
```

+ 命名导入

```javascript
import { name1, name2 } from 'src/my_lib';
```

你可以重命名导入:

```javascript
// Renaming: import `name1` as `localName1`
import { name1 as localName1, name2 } from 'src/my_lib';
// Renaming: import the default export as `foo`
import { default as foo } from 'src/my_lib';
```

+ 空导入:只加载模块,不导入任何东西. 程序中的第一个此类导入将执行模块的主体。

只有两种方式来组合这些风格，它们出现的顺序是固定的;默认导出总是先出现。

+ 将默认导入与名称空间导入组合在一起

```javascript
import theDefault, * as my_lib from 'src/my_lib';
```

+ 将默认导入与命名导入结合

```javascript
import theDefault, { name1, name2 } from 'src/my_lib';
```

### 命名导出风格:内联和子句

有两种方法可以在模块中导出已命名的内容。一方面，您可以使用关键字export标记声明。

```javascript
export var myVar1 = ···;
export let myVar2 = ···;
export const MY_CONST = ···;

export function myFunc() {
    ···
}
export function* myGeneratorFunc() {
    ···
}
export class MyClass {
    ···
}
```

另一方面，您可以在模块末尾列出要导出的所有内容（其风格与显示模块模式相似）

```javascript
const MY_CONST = ···;
function myFunc() {
    ···
}
export { MY_CONST, myFunc };
```

您还可以使用其他名称导出内容

```javascript
export { MY_CONST as FOO, myFunc };
```

### 重新导出

Re-exporting意味着将另一个模块的导出添加到当前模块的导出中。 您可以添加所有其他模块的导出：

```javascript
export * from 'src/other_module';
```

默认导出会被`export *`忽略

或者，您可以更具选择性（重命名时可选）

```javascript
export { foo, bar } from 'src/other_module';

// Renaming: export other_module’s foo as myFoo
export { foo as myFoo, bar } from 'src/other_module';
```

#### 重新导出默认导出

下面的语句使另一个模块foo的默认导出成为当前模块的默认导出

```javascript
export { default } from 'foo';
```

下面的语句使模块foo的命名导出myFunc成为当前模块的默认导出

```javascript
export { myFunc as default } from 'foo';
```

### 所有导出风格

ES6提供了多个导出风格

+ Re-exporting
    + Re-export所有(除了默认导出)
        ```javascript
        export * from 'src/other_module';
        ```
    + Re-export通过子句
        ```javascript
        export { foo as myFoo, bar } from 'src/other_module';
        export { default } from 'src/other_module';
        export { default as foo } from 'src/other_module';
        export { foo as default } from 'src/other_module';
        ```
    + 通过子句命名导出
        ```javascript
        export { MY_CONST as FOO, myFunc };
        export { foo as default };
        ```
    + 行内命名导出
        + 变量申明
            ```javascript
            export var foo;
            export let foo;
            export const foo;
            ```
        + 函数声明
            ```javascript
            export function myFunc() {}
            export function* myGenFunc() {}
            ```
        + 类声明
            ```javascript
            export class MyClass {}
            ```
    + 默认导出
        + 函数声明(此处可以是匿名函数)
            ```javascript
            export default function myFunc() {}
            export default function () {}

            export default function* myGenFunc() {}
            export default function* () {}
            ```
        + 类声明(此处可以是匿名类)
            ```javascript
            export default class MyClass {}
            export default class {}
            ```
        + 表达式:导出值,注意末尾的分号

### 在模块中同时具有命名导出和默认导出

以下模式在JavaScript中非常常见:库是单个函数，但是通过该函数的属性提供附加服务。示例包括jQuery和sub - score.js。下面是作为CommonJS模块的Underscore

```javascript
//------ underscore.js ------
var _ = function (obj) {
    ···
};
var each = _.each = _.forEach =
    function (obj, iterator, context) {
        ···
    };
module.exports = _;

//------ main.js ------
var _ = require('underscore');
var each = _.each;
···
```

在ES6中,函数_是默认导出,而`each`和`forEach`是命名导出.事实证明,你可以同时使用命名导出和默认导出.例如,前面的CommonJS模块,重写为ES6模块如下

```javascript
//------ underscore.js ------
export default function (obj) {
    ···
}
export function each(obj, iterator, context) {
    ···
}
export { each as forEach };

//------ main.js ------
import _, { each } from 'underscore';
···
```

请注意，CommonJS版本和ES 6版本只是大致相似。后者是平面结构，而前者是嵌套的。

#### 建议:避免混合使用默认导出和命名导出

我通常建议将这两种导出分开:每个模块要么只有默认导出，要么只有命名导出。

然而，这不是一个非常强烈的建议;偶尔把这两种混合起来是有意义的。一个示例是默认导出实体的模块。对于单元测试，可以通过命名导出另外提供一些内部内容。

#### 默认导出仅仅是另一个命名导出

默认导出实际上只是一个具有特殊名称default的命名导出。也就是说，下面两个表述是等价的

```javascript
import { default as foo } from 'lib';
import foo from 'lib';
```

类似地，下面两个模块具有相同的默认导出

```javascript
//------ module1.js ------
export default function foo() {} // function declaration!

//------ module2.js ------
function foo() {}
export { foo as default };
```

#### default: 可以作为导出名字,但是不能当做变量

您不能将保留字（例如`default`和`new`）用作变量名，但可以将它们用作导出的名称（在ES 5中也可以将它们用作属性名）。 如果要直接导入此类命名的导出，则必须将它们重命名为适当的变量名称。

这意味着`default`只能出现在重命名导入的左侧:

```javascript
import { default as foo } from 'some_module';
```

并且只能出现在重命名导出的右侧

```javascript
export { foo as default };
```

在重新导出中,`as`的两侧都是导出的名字

```javascript
export { myFunc as default } from 'foo';
export { default as otherFunc } from 'foo';

// 下面两个语句是等价的
export { default } from 'foo';
export { default as default } from 'foo';
```

## 在浏览器中使用ES6模块

让我们看看浏览器中如何支持ES6模块。

警告: 与模块加载类似，浏览器中对ES6模块的支持也在进行中，其他方面对浏览器中模块的支持仍在进行中。你在这里读到的一切都可能会改变。

### 浏览器:异步模块vs同步脚本

在浏览器中，有两种不同的实体:脚本和模块。它们的语法和工作方式略有不同。

#### Scripts

脚本是浏览器嵌入JavaScript和引用外部JavaScript文件的传统方式。脚本有一个[网络媒体类型](https://en.wikipedia.org/wiki/Media_type)，被用作

+ 通过web服务器传递的JavaScript文件的内容类型。
+ `<script>`元素属性`type`的值.注意,对于HTML5,如果`<script>`元素包含或引用Javascript,建议省略type属性

以下是最重要的值

+ text/javascript: 是遗留值,如果在`script`标签中省略`type`属性,则将其作为默认值使用.它是IE8和更早版本中最安全的选择
+ application/javascript: 当前浏览器器中所推荐的

脚本通常是同步加载或执行的,直到代码已加载或执行,Javascript线程停止

#### 模块

模块

为了符合Javascript通常的运行到完成的语义,模块的主体必须在不中断的情况下执行.这就为了模块的导入留下了两个选项

1. 在执行主体时,同步加载模块这就是Node.js所实现的
2. 在执行主体之前异步加载所有模块。这就是AMD模块的处理方式。它是浏览器的最佳选择，因为模块是通过网络加载的，并且执行过程中不必暂停。另外一个好处是，这种方法允许并行加载多个模块。

ES6为您提供了两全其美的体验：Node.js的同步语法以及AMD的异步加载。 为了使两者均实现，ES6模块在语法上不如Node.js模块灵活：导入和导出必须在顶层进行。 这意味着它们也不是有条件的。 此限制使ES6模块加载器可以静态分析模块导入了哪些模块，并在执行其主体之前加载它们。

脚本的同步特性阻止它们成为模块。脚本甚至不能以声明的方式导入模块(如果您想这样做，您必须使用编程模块加载器API)。

模块可以通过`<script>`元素的新变体在浏览器中使用，它是完全异步的

```javascript
<script type="module">
    import $ from 'lib/jquery';
    var x = 123;

    // The current scope is not global
    console.log('$' in window); // false
    console.log('x' in window); // false

    // `this` is undefined
    console.log(this === undefined); // true
</script>
```

可以看到，元素有自己的作用域，其中的变量是该作用域的局部变量。请注意，模块代码隐式地处于严格模式。这是一个好消息，不再`use strict`。

与普通的`<script>`元素相似，`<script type =“ module”>`也可以用于加载外部模块。 例如，以下标签通过主模块启动Web应用程序（属性名称import是我的虚构，尚不清楚将使用什么名称）。

```javascript
<script type="module" import="impl/main"></script>
```

通过自定义的`<script>`类型在HTML中支持模块的优点是，很容易通过一个polyfill(一个库)将这种支持带到旧的引擎上。最终可能有也可能没有模块专用的元素(例如`<module>`)。

#### 模块或脚本的上下文问题

一个文件是模块还是脚本,只取决于它是如何导入或加载的.大多数模块具有导入或导出功能,因此可以被检测到,但是,如果一个模块两者都没有,那么它和脚本就没有区别

例如:

```javascript
var x = 123;
```

这段代码的语义取决于它是被解释为模块还是脚本

+ 作为模块,变量x被创建在模块作用域
+ 作为脚本,变量x会被挂载到全局对象上作为全局变量(浏览器中的window)

更实际的例子安装了一些东西的模块,例如,全局变量中的polyfill或全局事件侦听器.这样的模块既不导入也不导出任何内容,而是通过空导入激活

```javascript
import './my_module'
```

## 详情:导入是导出的视图

`imports`在CommonJS和ES6中的工作方式有所不同

+ CommonJS中,`imports`是`exported`值的拷贝
+ ES6中,`imports`是`exported`值的只读视图

下面几节将解释这意味着什么

### CommonJS中,imports是exported值的拷贝 

使用CommonJS(Node.js)模块,事情可以以相对熟悉的方式运行

如果您将一个值导入到一个变量中,则该值被复制两次:一次是在导出时(第A行),一次是在导出时(第B行)

```javascript
//------ lib.js ------
var counter = 3;
function incCounter() {
    counter++;
}
module.exports = {
    counter: counter, // (A)
    incCounter: incCounter,
};

//------ main1.js ------
var counter = require('./lib').counter; // (B)
var incCounter = require('./lib').incCounter;

// 导入的值是副本的(断开连接的)副本
console.log(counter); // 3
incCounter();
console.log(counter); // 3

// 导入的值可以被改变
counter++;
console.log(counter); // 4
```

如果通过导出对象访问值,它仍然会在导出时被复制一次

```javascript
//------ main2.js ------
var lib = require('./lib');

// 导入的值是副本的(断开连接的)副本
console.log(lib.counter); // 3
lib.incCounter();
console.log(lib.counter); // 3

// 导入的值可以被改变
lib.counter++;
console.log(lib.counter); // 4
```

### 在ES6中,imports是对exported值的实时只读视图

与CommonJS相反,导入是导出值的视图.换句话说,每一个导入都是与导出数据的实时链接,导入是只读的.

+ 不合格的导入(import x from 'foo') 类似于const声明的变量
+ 模块对象foo的属性(import * as foo from 'foo')类似于[frozen object](http://speakingjs.com/es5/ch17.html#freezing_objects)

下面的代码演示了导入如何类似于视图

```javascript
//------ lib.js ------
export let counter = 3;
export function incCounter() {
    counter++;
}

//------ main1.js ------
import { counter, incCounter } from './lib';

// 导入的值'counter'是实时变动的
console.log(counter); // 3
incCounter();
console.log(counter); // 4

// 导入的值不能被改变
counter++; // TypeError
```

如果通过星号(*)导入模块对象,则会得到相同结果

```javascript
//------ main2.js ------
import * as lib from './lib';

// 导入的值'counter'是实时变动的
console.log(lib.counter); // 3
lib.incCounter();
console.log(lib.counter); // 4

// 导入的值不能被改变
lib.counter++; // TypeError
```

请注意,虽然您无法更改导入的值,但是可以更改它们所引用的对象.例如

```javascript
//------ lib.js ------
export let obj = {};

//------ main.js ------
import { obj } from './lib';

obj.prop = 123; // OK
obj = {}; // TypeError
```

#### 为什么要采取新的导入方式

为什么要引入这样一个相对复杂的机制来进行导入呢?

+ 循环依赖: 主要的优点是它支持循环依赖，即使是不合格的导入。
+ 合格和不合格的导入工作相同。在CommonJS中，它们不这样做:合格导入提供了对模块导出对象属性的直接访问，而非合格导入是模块导出对象的副本。
+ 您可以将代码分割为多个模块，并且它将继续工作(只要您不尝试更改导入的值)。
+ 另一方面，模块折叠，将多个模块组合成单个模块也变得更加简单。

在我的经验中,ES6导入非常有效,你很少需要考虑到它内部到底发生了什么

### 实施意见

导入是如何作为导出的底层视图工作的?导出通过数据结构导出条目进行管理。所有导出入口(re-exports目除外)均有以下两个名称:

+ 本地名称:是导出存储在模块下的名称
+ 导出名称:是导入模块访问导出时需要使用的名称

导入类/对象等实体之后,始终通过具有两个组件模块和本地名称的指针访问该实体.换句话说,该指针指向的是模块内部的绑定(变量的存储空间)

让我们检查一下通过各种导出创建的到处名称和本地名称.下表(从ES6规范改变而来)提供了概述,后续部分提供了更多细节

| Statement                          | Local name    | Export name |
|------------------------------------|---------------|-------------|
| export \{v\};                      | 'v'           | 'v'         |
| export \{v as x\};                 | 'v'           | 'x'         |
| export const v = 123;              | 'v'           | 'v'         |
| export function f\(\) \{\}         | 'f'           | 'f'         |
| export default function f\(\) \{\} | 'f'           | 'default'   |
| export default function \(\) \{\}  | '\*default\*' | 'default'   |
| export default 123;                | '\*default\*' | 'default'   |

#### 导出clause

```javascript
function foo() {}
export { foo };
```

+ 本地名称:foo
+ 导出名称:foo

```javascript
function foo() {}
export { foo as bar };
```

+ 本地名称:foo
+ 导出名称:bar

#### 内联导出(inline export)

```javascript
export function foo() {}
```

它等价于以下代码

```javascript
function foo() {}
export { foo };
```

因此,有以下名称
+ 本地名称:foo
+ 导出名称:foo

#### 默认导出(default exports)

有两种默认导出方式:

+ 声明提前(函数声明,生成器函数声明)和类声明的默认导出类似于普通的内联导出,即创建和标记命名的本地实体???
+ 所有其他默认导出都是关于导出表达式结果的

##### 默认导出表达式

```javascript
export default 123;
```

等价于

```javascript
const *default* = 123; // *not* legal JavaScript
export { *default* as default };
```

如果您默认导出一个表达式,则会得到
+ 本地名称: `*default*`
+ 导出名称: `default`

选择本地名称是为了避免与其他任何本地名称冲突。

**tips**

这里解释一下HoistableDeclaration

> export default 函数声明定义在规范中定义的行为,对应的是export default HoistableDeclaration.

请注意，默认导出仍会导致创建绑定。 但是，由于* default *不是合法标识符，因此您无法从模块内部访问该绑定。

##### 默认导出函数声明和类

The following code default-exports a function declaration

```javascript
export default function foo() {}
```

等价于

```javascript
function foo() {}
export { foo as default };
```

+ 本地名称: foo
+ 导出名称: default

这意味着您可以通过为foo分配不同的值来更改模块内默认导出的值。

(仅)对于默认导出，还可以省略函数声明的名称

```javascript
export default function () {}
```

等价于

```javascript
function *default*() {} // *not* legal JavaScript
export { *default* as default };
```

+ 本地名称: *default*
+ 导出名称: default

默认导出的生成器声明和类声明的工作方式类似于默认导出的函数声明。

参考文章

<https://zhuanlan.zhihu.com/p/57565371>