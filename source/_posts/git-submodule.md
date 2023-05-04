---
title: git submodule的认识
date: 2023-02-05 17:02
categories: 团队协作
tags: [git]
headimg: https://media.licdn.com/dms/image/D4D12AQHGjohbHwcvPQ/article-cover_image-shrink_720_1280/0/1678105336139?e=2147483647&v=beta&t=zwKQy9Exo94G8Z_LL-VUvXVujcF5r7h7fy7L6wRvp40
---

在大型的项目开发中，往往会遇到项目里面互相嵌套的关系，听起来你会联想到monorep，lerna，但是不在本文的讨论范围内。有些核心代码需要权限管控，此时这一部分的项目可以移接到submodule中去管理

<!-- more -->

例如，你在github中偶尔会看到这样的

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_17-08-52.png)
{% endgallery %}

这是某个项目中嵌入了另外一个开源项目，类似一个锚点， 点击会跳往源仓库。一般的做法是， 当我们需要引用一个开源仓库的时候， 可以fork其代码到我们自己的仓库中， 然后将fork后的项目添加到子模块，也就是submodule中。这个时候我们的主项目和子项目分别由两个不同的远程代码仓库管理， 当上游仓库需要更新时，也可以很好的去进行这个过程

## git submodule的使用

对于submodule而言，存在着两个代码仓库，我们可以称呼为fork后的仓库地址为【派生仓库】，使用origin表示。对于开源作者的仓库， 称之为【上游仓库】，使用upstream表示

进入子模块目录中， `git remote -v`查看其所有远端仓库，如果是第一次拉取项目时， 远端仓库可能只有一个origin的，此时需要添加上游仓库

```bash
git remote add upstream https://github.com/xxx
```
此时

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_17-18-50.png)
{% endgallery %}

并且，此时的子模块其实是空文件夹， 需要先切换到主项目根目录下

- 拉取submodule

```bash
git submodule update --init --recursive
```

即，当你克隆一个有子模块的项目时，你需要执行以下命令

```bash
# 克隆主项目
git clone {http/ssh}
# 初始化本地配置文件，即对子模块路径进行注册
git submodule init
# 拉取所有的数据和 checkout 合适的子模块commit
git submodule update

# git submodule init 和 git submodule update 的组合，且会拉取嵌套的子模块
git submodule update --init --recursive
```

git submodule的常用命令

- 添加子模块

```bash
git submodule add https://github.com/xxx
```
之后会在主项目的根目录生成 .gitmodules 文件，用于记录子模块在信息和子模块同名的文件夹，用于存放子模块

- 更新submodule

```bash
git submodule update --remote {模块名}
```

或者，也可以

```bash
# 进入子模块
# 切换到相应的分支
git checkout {branchName}
git fetch
git merge {origin/branchName}
```

无论哪种方式更新，都会在主项目生成子模块更新的 commit 信息，可见主项目只需要记录子模块的 commit 信息即可。当主项目 push 后，其远程派生仓库里的子模块也锁定为最新的。  

- 更改子模块

需要注意的是一定要 checkout 到某一个具体分支，因为当在主项目中使用 git submodule update 命令更新子模块时，会子模块处于 detached HEAD 的状态，即没有本地分支跟踪变更，会导致在此状态下子模块的 commit，在下一次 update 时丢失。即如果不 checkout 具体的分支，会覆盖掉已更新的内容。

```bash
# 进入子模块
cd git-submodule-project
# checkout 分支
git checkout {branch}
# 做一些更改后
git add .
git commit -m "xxx"
git push
```
同样地，主项目中也会生成一个子模块更新的 commit 记录。

需要注意的是要先将子模块先push完，再push主项目的，如果你没有这样做，那么其他人会获取不到子模块更新，此时需要

```bash
# 在主模块 push 之前，检查子模块是否 push，包括嵌套子模块
git push --recurse-submodules=check
# 在主模块 push 之前，自动 push 子模块，包括嵌套子模块
git push --recurse-submodules=on-demand
```

## 如何同步源的新更新的内容

当子模块有新的更新时，主项目中想要获取新的子模块更新，通常有两种方案
- 界面操作

同步更新的结果：
{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_17-45-18.png)
{% endgallery %}

如果是使用github， github的pull request可以很快捷的从上游仓库同步至fork仓库。（pull request不仅仅可以提pr，也可以反向合并😂）

1. 去到自己fork后的远程派生仓库，点击pull request

2.  默认的方向是把你的代码同步给别人的，这不是我们想要的功能

![](https://cdn.qdovo.com/assets/Snipaste_2023-04-26_14-05-06.png)

3. 调换一下两边的仓库以及分支就好了，只要记住右边的代码合并到左边来。也可以点击`compare across forks`，然后会自动分析出哪边的代码比较新，再适当更换一下仓库和分支就好了，我这里是已经合并过了，所以这里的结果是提交PR

![](https://cdn.qdovo.com/assets/Snipaste_2023-04-26_14-15-18.png)

- 也可使用命令行操作

```bash
cd /xxx # 先进入到sub module目录下

#从上游仓库 fetch 分支和提交点，提交给本地 master，并会被存储在一个本地分支 upstream/master
git fetch upstream

# 切换到本地主分支(如果不在的话)
git checkout master

# 把 upstream/master 分支合并到本地 master 上，这样就完成了同步，并且不会丢掉本地修改的内容。
git merge upstream/master

git push origin master
```
