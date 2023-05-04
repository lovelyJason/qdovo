---
title: 易语言批量处理excel数据
date: 2022-11-15
categories: 易语言
headimg: https://cdn.qdovo.com/img/headimg/libxl.png
---

易语言批量处理excel数据，自动化地完成工作

<!-- more -->

女朋友是开猫舍的，经常需要处理一些报表之类的， 每次发给我做，真的烦(可不敢说出来)， 对照数据然后整理出来着实费劲

要实现的功能是读取表格的一个sheet页的数据，每一行是一个宠物的消费数据， 把每一行的关键数据金额提取出来， 然后合并同类， 相同列的金额进行相加， 保存在新的sheet中。

话说手动下来， 加上调整格式，没有一个小时是搞不定的😅

{% gallery %}
![](https://cdn.qdovo.com/assets/Snipaste_2023-04-05_20-27-28.png)
{% endgallery %}

现在不到一秒时间chua chua搞定

主要就是使用的libxl.dll， 是一个c++的库，易语言中调用还是比较方便

源码：

```易语言
.版本 2
.支持库 edroptarget
.支持库 EThread
.支持库 iext
.支持库 spec
.支持库 eAPI

.程序集 窗口程序集_启动窗口
.程序集变量 线程句柄, 整数型
.程序集变量 filePath, 文本型
.程序集变量 book, EXCEL工作簿类
.程序集变量 sheet1, EXCEL工作表类
.程序集变量 sheet2, EXCEL工作表类
.程序集变量 Format, EXCEL格式类
.程序集变量 Font, EXCEL字体类
.程序集变量 nameList, 文本型, , "0"
.程序集变量 startTime, 日期时间型

.子程序 __启动窗口_创建完毕
.局部变量 a, 整数型
.局部变量 b, 整数型

皮肤_加载 (#皮肤_清新)
拖放对象1.注册拖放控件 (_启动窗口.取窗口句柄 ())
程序_禁止重复运行 ()

' nameList ＝ { “1”, “2”, “3”, “2” }
' 数组_去重复 (nameList)
' 调试输出 (nameList)

' a ＝ 8
.' 变量循环首 (a, 30, 1, b)
    ' ' b从8开始
    ' 调试输出 (a, b)
.' 变量循环尾 ()

.子程序 __启动窗口_将被销毁

拖放对象1.撤消拖放控件 (_启动窗口.取窗口句柄 ())
皮肤_释放 ()
.如果 (等待线程 (线程句柄, 1))
    强制结束线程 (线程句柄)
.否则
    关闭线程句柄 (线程句柄)
.如果结束



.子程序 _拖放对象1_得到文件
.参数 接收到的文件路径, 文本型
.局部变量 文件扩展名, 文本型

.如果 (文件_是否存在 (接收到的文件路径))
    文件扩展名 ＝ 文件_取扩展名 (接收到的文件路径)
    .如果 (寻找文本 (文件扩展名, “xlsx”, , 假) ≠ -1 或 寻找文本 (文件扩展名, “xls”, , 假) ≠ -1)
        提示框 (“导入excel成功, 启动之前请先关闭excel文件”, , , , 800)
        filePath ＝ 接收到的文件路径
        透明标签2.标题 ＝ 接收到的文件路径
    .否则
        提示框 (“请导入excel文件，格式xls或xlsx”, , , , 800)
    .如果结束

.否则
    提示框 (“请导入excel文件，格式xls或xlsx”, , , , 800)
.如果结束


.子程序 _按钮1_被单击

按钮1.禁止 ＝ 真
.如果真 (取反 (到逻辑型_通用版 (filePath)))
    信息框 (“请导入excel文件”, 0, , )
    返回 ()
.如果真结束

时间_取间隔_开始 ()
启动线程 (&生成提成表, , 线程句柄)


.子程序 获取表头索引
.参数 索引列表, 整数型, 参考 数组
.局部变量 cur, 整数型
.局部变量 cellContent, 文本型
.局部变量 手机号索引, 整数型
.局部变量 品种索引, 整数型
.局部变量 名字索引, 整数型
.局部变量 项目索引, 整数型
.局部变量 操作人索引, 整数型
.局部变量 实收金额索引, 整数型
.局部变量 应收金额索引, 整数型


.计次循环首 (20, cur)
    ' 暂停 ()
    cellContent ＝ sheet1.取单元格内容 (0, cur － 1)
    调试输出 (cellContent)
    .如果真 (寻找文本 (删首尾空 (cellContent), “手机”, , 假) ≠ -1)
        手机号索引 ＝ cur
        加入成员 (索引列表, 手机号索引)
        到循环尾 ()
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “品种”, , 假) ≠ -1)
        品种索引 ＝ cur
        加入成员 (索引列表, 品种索引)
        到循环尾 ()
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “名字”, , 假) ≠ -1)
        名字索引 ＝ cur
        加入成员 (索引列表, 名字索引)
        到循环尾 ()
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “项目”, , 假) ≠ -1)
        项目索引 ＝ cur
        加入成员 (索引列表, 项目索引)
        到循环尾 ()
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “操作人”, , 假) ≠ -1)
        操作人索引 ＝ cur
        加入成员 (索引列表, 操作人索引)
        到循环尾 ()
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “实收”, , 假) ≠ -1)
        实收金额索引 ＝ cur
        加入成员 (索引列表, 实收金额索引)
        到循环尾 ()
        ' 调试输出 (cellContent ＝ “实收金额”)
    .如果真结束

    .如果真 (寻找文本 (删首尾空 (cellContent), “应收”, , 假) ≠ -1)
        应收金额索引 ＝ cur
        加入成员 (索引列表, 应收金额索引)
        到循环尾 ()
    .如果真结束

.计次循环尾 ()

重定义数组 (索引列表, 真, 7)


.子程序 生成提成表
.局部变量 list, 文本型, , "200,20"
.局部变量 row, 整数型
.局部变量 column, 整数型
.局部变量 filename, 文本型
.局部变量 isBlankRow, 逻辑型
.局部变量 cellContent, 文本型
.局部变量 record, 对象
.局部变量 sheetList, 对象, , "0"
.局部变量 sheet2CurRow, 整数型
.局部变量 endTIme, 日期时间型
.局部变量 interval, 文本型
.局部变量 extension, 文本型
.局部变量 表头索引, 整数型, , "0"
.局部变量 文本型表头索引, 文本型, , "0"
.局部变量 cur, 整数型

filename ＝ 文件_取文件名 (filePath, 真)
extension ＝ 文件_取扩展名 (filePath)
.如果 (extension ＝ “.xlsx”)
    book.创建XLSX ()
    调试输出 (“xlsx”)
.否则
    book.创建XLS ()
    调试输出 (“xls”)
.如果结束

row ＝ 0
调试输出 (filePath)
.如果 (book.打开文件 (filePath))
    透明标签2.标题 ＝ “文件读入成功,开始工作......”
    ' 需要注意易语言数组下标从1开始, libxl excel中行列索引从0开始
    sheet1 ＝ book.选择工作表 (0)
    透明标签2.标题 ＝ “准备读取sheet1 - [” ＋ sheet1.工作表名 () ＋ “]......”

    sheet2 ＝ book.添加工作表 (“提成” ＋ 时间_到文本 ())

    sheet2.置单元格列宽 (0, 0, 14.51)
    sheet2.置单元格列宽 (1, 1, 15.48)
    sheet2.置单元格列宽 (2, 2, 16.46)
    sheet2.置单元格列宽 (3, 3, 11.04)
    sheet2.置单元格列宽 (4, 4, 22.84)
    sheet2.置单元格列宽 (5, 7, 11.04)
    sheet2.置单元格行高 (0, 30)
    .计次循环首 (199, row)
        sheet2.置单元格行高 (row, 19.15)
    .计次循环尾 ()

    .如果 (编辑框1.内容 ≠ “”)
        文本_分割文本 (编辑框1.内容, “,”, , 文本型表头索引)
        .计次循环首 (取数组成员数 (文本型表头索引), cur)
            加入成员 (表头索引, 到整数 (文本型表头索引 [cur]))
        .计次循环尾 ()
        重定义数组 (表头索引, 真, 7)
    .否则
        获取表头索引 (表头索引)
    .如果结束

    调试输出 (表头索引)
    .如果真 (取数组成员数 (表头索引) ＝ 0)
        程序_出错退出 ()
        返回 ()
    .如果真结束

    Format ＝ book.添加格式 (Format)
    Format.垂直对齐方式 (#Alignv_居中对齐)
    Format.水平对齐方式 (#Alignh_居中对齐)

    sheet2.置单元格文本 (0, 0, “时间”, Format)
    sheet2.置单元格文本 (0, 1, “手机号”, Format)
    sheet2.置单元格文本 (0, 2, “品种”, Format)
    sheet2.置单元格文本 (0, 3, “名字”, Format)
    sheet2.置单元格文本 (0, 4, “项目”, Format)
    sheet2.置单元格文本 (0, 5, “操作人”, Format)
    sheet2.置单元格文本 (0, 6, “实收金额”, Format)
    sheet2.置单元格文本 (0, 7, “应收金额”, Format)

    ' 初始化提成表单元格格式,存储宠物洗澡数据,回填提成表
    .计次循环首 (199, row)
        sheet2.置单元格行高 (row, 19.55)

        .计次循环首 (20, column)
            sheet2.置单元格格式 (row, column, Format)

            cellContent ＝ sheet1.取单元格内容 (row － 1, column － 1)

            .判断开始 (column ＝ 表头索引 [1])  ' 手机号
                record.手机号 ＝ cellContent
            .判断 (column ＝ 表头索引 [2])
                record.品种 ＝ cellContent
            .判断 (column ＝ 表头索引 [3])
                record.名字 ＝ cellContent
            .判断 (column ＝ 表头索引 [4])
                record.项目 ＝ cellContent
            .判断 (column ＝ 表头索引 [5])
                record.操作人 ＝ cellContent
            .判断 (column ＝ 表头索引 [6])
                record.实收金额 ＝ 到小数 (cellContent)
            .判断 (column ＝ 表头索引 [7])
                record.应收金额 ＝ 到小数 (cellContent)
            .默认

            .判断结束


        .计次循环尾 ()

        ' 调试输出 (record.手机号, record.名字, record.项目, record.操作人, record.实收金额, record.应收金额)
        ' 调试输出 (是否为手机号 (record.手机号), 到逻辑型 (record.名字), 到逻辑型 (record.项目), 到逻辑型 (record.操作人), 到逻辑型 (, record.实收金额, 2), 到逻辑型 (, record.实收金额, 2))

        .如果真 (是否为手机号 (record.手机号) 且 record.名字 ≠ “” 且 record.项目 ≠ “” 且 record.操作人 ≠ “” 且 到逻辑型 (, record.实收金额, 2) 且 到逻辑型 (, record.实收金额, 2))
            sheet2CurRow ＝ sheet2CurRow ＋ 1
            record.行索引 ＝ sheet2CurRow
            加入成员 (sheetList, record)
            加入成员 (nameList, record.操作人)
            ' 问题: 直接传入row这里可能导致中间出现很多空行
            回填提成表 (record, sheet2CurRow)
        .如果真结束


    .计次循环尾 ()

    透明标签2.标题 ＝ “提成表格生成成功,开始计算提成金额......”
    数组_去重复 (nameList)
    回填提成表姓名和提成金额 (sheetList)
    book.保存文件 (filePath)

    interval ＝ 时间_取间隔_结束 ()
    透明标签2.标题 ＝ “任务完成,耗时: ” ＋ interval
    提示框 (“操作完成,即将退出窗口, 总耗时: ” ＋ interval, , , , 4000)
    运行文件 (filename)

.否则
    提示框 (“文件读入失败,貌似只能支持xlsx......”, , , , 800)

.如果结束

按钮1.禁止 ＝ 假
book.释放 ()
数组清零 (表头索引)
数组清零 (文本型表头索引)
_启动窗口.销毁 ()


.子程序 回填提成表
.参数 提成数据, 对象
.参数 行, 整数型

' TODO:时间
sheet2.置单元格文本 (行, 0, “时间自行处理”)
sheet2.置单元格文本 (行, 1, 提成数据.手机号)
sheet2.置单元格文本 (行, 2, 提成数据.品种)
sheet2.置单元格文本 (行, 3, 提成数据.名字)
sheet2.置单元格文本 (行, 4, 提成数据.项目)
sheet2.置单元格文本 (行, 5, 提成数据.操作人)
sheet2.置单元格数值或日期 (行, 6, 提成数据.实收金额)
sheet2.置单元格数值或日期 (行, 7, 提成数据.应收金额)


.子程序 回填提成表姓名和提成金额
.参数 sheetList, 对象, 数组
.局部变量 sheetRowIndex, 整数型
.局部变量 findSheet2OperatorNameCycleVar, 整数型
.局部变量 sheet2CommissionAmountIndex, 整数型
.局部变量 commissionAmount, 双精度小数型
.局部变量 operatorName, 文本型

sheet2CommissionAmountIndex ＝ 8

' 生成姓名表头
Format ＝ book.添加格式 (Format)
Format.垂直对齐方式 (#Alignv_居中对齐)
Format.水平对齐方式 (#Alignh_居中对齐)
.计次循环首 (取数组成员数 (nameList), sheetRowIndex)
    sheet2.置单元格文本 (0, sheet2CommissionAmountIndex, nameList [sheetRowIndex], Format)
    sheet2CommissionAmountIndex ＝ sheet2CommissionAmountIndex ＋ 1
.计次循环尾 ()
sheet2CommissionAmountIndex ＝ 8

.计次循环首 (取数组成员数 (sheetList), sheetRowIndex)  ' 注意curSheet2OperationCycleVar从1开始

    commissionAmount ＝ sheetList [sheetRowIndex].应收金额 × 0.1
    operatorName ＝ sheetList [sheetRowIndex].操作人
    .变量循环首 (sheet2CommissionAmountIndex, sheet2CommissionAmountIndex ＋ 取数组成员数 (nameList) － 1, 1, findSheet2OperatorNameCycleVar)
        ' 内部起始值不会递增
        ' 取表头姓名,注意索引是0
        .如果真 (sheet2.取单元格文本 (0, findSheet2OperatorNameCycleVar) ＝ operatorName)
            sheet2.置单元格数值或日期 (sheetRowIndex, findSheet2OperatorNameCycleVar, commissionAmount)
            跳出循环 ()
        .如果真结束


    .变量循环尾 ()


.计次循环尾 ()

按钮1.禁止 ＝ 假

.子程序 是否为手机号, 逻辑型
.参数 phone, 文本型
.局部变量 局_正则, 正则表达式类

phone ＝ 删首尾空 (phone)
.如果真 (取文本长度 (phone) ≠ 11)
    返回 (假)
.如果真结束

局_正则.创建 (“^(13[0-9]|14[5-9]|15[0-3,5-9]|16[2,5,6,7]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$”, phone)
.如果 (局_正则.取匹配文本 (1, ) ＝ phone)
    返回 (真)
.否则
    返回 (假)
.如果结束


.子程序 _按钮2_被单击

打开指定网址 (“http://cdn.qdovo.com/wechat.jpg”)


```

现在再来看效果

{% gallery %}
![](https://cdn.qdovo.com/assets/a.gif)
{% endgallery %}
