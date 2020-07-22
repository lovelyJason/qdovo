---
title: mysql基础命令
date: 2019-08-10 13:54:21
tags:
---
#   MySQL

## 数据库 MySQL ##

### 数据库入门 ###

未来我们程序中的数据为了方便管理都通过数据库来存储。

作为前端开发人员，对数据库做一定了解即可。

#### 数据库基础知识 ####

- 什么是数据库
  - 存储数据的仓库
  - 使用数据库管理数据的好处
    - 方便存储、查询、修改、删除
  - 关系型数据库
    - MySQL
    - Sql Server
    - Orcale
    - SQLite
- 数据表
  - 二维的表，类似于Excel表
  - 由行和列组成，列：字段，行：记录
  - 字段的类型
    - int 整数、double 浮点数、varchar(255) 字符串、text 文本、datetime 日期、float 浮点数

#### MySQL 的服务器 ####

- 下载地址：

  - https://dev.mysql.com/downloads/mysql/5.7.html#downloads

- MySQL 安装与配置

  - 准备工作

    在 **C 盘根目录**建立目录： c:\develop

  - 解压并移动位置

    解压缩 mysql-5.7.23 的压缩包，将**其中**的 **`mysql-5.7.23-xxxxx` 目录**移动到 `C:\develop` 目录下并把名字修改为 **`mysql`**

  - MySQL 的配置文件 my.ini

    在 `c:\develop\mysql` 目录下新建一个 `my.ini` 的配置文件

    ```ini
    [mysqld]
    # MySQL 安装目录
    basedir=C:/develop/mysql
    # 数据文件所在目录
    datadir=C:/develop/mysql/data
    character-set-server=utf8
    sql-mode="STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"
    ```

  - 以管理员身份运行 CMD 执行以下命令，安装一个 MySQL 服务

    ```bash
    # 定位到安装目录下的 bin 文件夹
    # cd <MySQL安装目录>\bin
    cd c:\develep\mysql\bin
    # 初始化数据所需文件以及获取一个临时的访问密码
    mysqld --initialize --user=mysql --console
    ```

    初始化成功如下图：记下临时密码(只能使用一次)

    ![1545190967742](assets/1545190967742.png)

    ```bash
    # 将 MySQL 安装为服务 可以指定服务名称
    mysqld --install MySQL
    
    # 没有以管理员的身份运行命令行
    # 安装失败提示：Install/Remove of the Service Denied! 
    
    # 安装成功后，启动 MySQL 服务器
    net start MySQL
    ```

  - 重置 MySQL  密码

    ```bash
    # 先通过用户名密码进入 MySQL 操作环境
    mysql -u root -p
    Enter password: # 输入临时密码
    
    # 设置数据库访问密码，一定要加分号
    mysql> set password for root@localhost = password('*******');
    ```


#### MySQL 的客户端 ####

- 数据库的客户端 Navicat
- 使用 Navicat 创建数据库
- 使用 Navicat 创建表，添加数据

### SQL ###

要在程序中对数据库进行操作需要 SQL 语句

- 什么是 SQL
  - SQL 指结构化查询语言
  - SQL 使我们有能力访问数据库
  - [参考网站](http://www.w3school.com.cn/sql/index.asp)

- 增删改查

  - 插入数据

    ```sql
    INSERT INTO users (uname, upwd, uqq) values('zs','123', '12345')
    INSERT INTO posts SET uname='zs', upwd='123', uqq='12345'
    -- 如果是所有列，可以省略列名称，不推荐
    INSERT INTO users values('zs','123', '12345')
    ```

  - 修改数据

    ```sql
    UPDATE users SET uname='zsxxx', uqq='111' WHERE uid=1
    ```

  - 删除数据

    ```sql
    DELETE FROM users WHERE uid = 1
    -- 不带条件删除表中所有数据，禁止使用
    DELETE FROM users
    ```

  - 查询数据

    ```sql
    SELECT * FROM users 
    ```

### 查询 ###

- 条件查询

  ```sql
  SELECT * FROM users WHERE uname='zs' AND uname='000000'
  
  SELECT * FROM users WHERE uname='zs' OR uname='ls'
  ```
  
  下面的运算符可在 WHERE 子句中使用：
  | 操作符  | 描述         |
  | ------- | ------------ |
  | =       | 等于         |
  | <>      | 不等于       |
  | >       | 大于         |
  | <       | 小于         |
  | >=      | 大于等于     |
  | <=      | 小于等于     |
  | BETWEEN | 在某个范围内 |
  | LIKE    | 搜索某种模式 |

- 模糊查询

  ```sql
  SELECT * FROM users WHERE uname like '%s%'
  ```

- in 语句

  ```sql
  SELECT * FROM users WHERE uname in ('zs','ls')
  ```

- 排序

  order by 要写在 sql 语句的最后

  ```sql
  -- asc 升序  desc 降序
  SELECT * FROM users ORDER BY DESC
  SELECT * FROM users WHERE uage > 18 ORDER by desc
  ```

- 限制查询条数

    ```sql
    -- 取前3条数据
    SELECT * FROM users LIMIT 3  
    -- 降序后取3条数据
    SELECT * FROM users ORDER BY DESC LIMIT 3
    -- 跳过3条，取2条
    SELECT * FROM users ORDER BY DESC LIMIT 3,2
    ```

- 获取总条数

  ```sql
  SELECT COUNT(*) FROM users
  ```

- 表连接

  ```sql
  SELECT column_name(s)
  FROM table_name1
  INNER JOIN table_name2 
  ON table_name1.column_name=table_name2.column_name
  ```

## Node.js 中操作 MySQL ##

### 使用 mysql 第三方包 ###

https://github.com/mysqljs/mysql

### 安装 ###

```shell
npm install mysql
```

### Hello World ###

```javascript
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();
```

------

### 增删改查 ###

#### 查询 ####

基本查询：

```javascript
connection.query('SELECT * FROM `books` WHERE `author` = "David"', function (error, results, fields) {
  // error will be an Error if one occurred during the query
  // results will contain the results of the query
  // fields will contain information about the returned results fields (if any)
});
```

条件查询：

```javascript
connection.query('SELECT * FROM `books` WHERE `author` = ?', ['David'], function (error, results, fields) {
  // error will be an Error if one occurred during the query
  // results will contain the results of the query
  // fields will contain information about the returned results fields (if any)
});
```

#### 添加 ####

```javascript
var post  = {id: 1, title: 'Hello MySQL'};
var query = connection.query('INSERT INTO posts SET ?', post, function (error, results, fields) {
  if (error) throw error;
  // Neat!
});
console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
```

#### 删除 ####

```javascript
connection.query('DELETE FROM posts WHERE title = "wrong"', function (error, results, fields) {
  if (error) throw error;
  console.log('deleted ' + results.affectedRows + ' rows');
})
```

#### 修改 ####

```javascript
connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
  if (error) throw error;
  // ...
})
```

### 封装 dbHelper.js ###

```javascript
const mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : 'root',
  database : 'guestbook'
});

exports.query = (sql, params, callback) => {
  connection.connect();
  connection.query(sql, params, function (error, results, fields) { 
    callback(error, results, fields);
  });
  connection.end();
};

```






