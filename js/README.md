#Hotel Manager
这是为了老婆做的一个作业，同时也是为了测试使用现有的库能做多块的开发。
#问题
##数据库
目前使用的是WebSQL，因为indexeddb没有全文检索，使用起来相对来说复杂一些，因此还是采用的基于SQLite的WebSQL。和某些人一样，感觉W3C放弃SQLite太早了。
## 更快的开发方式
开发的时候发现大量可重用的地方，实际上可以基于现有使用的库来构建比较快速的开发方式。但是现在依旧没有比较快的解决方案。因此开发这个程序用了差不多8个小时，其中架构用了4个小时来码代码，2个小时用来解决WebSQL的数据库同步问题（本来这里应该使用backbone.Websql来解决，但是时间不够，因此没再继续深究下去了）。2小时用来解决重复性代码的差异。
基于backbone的开发以及观察者模式的确可以更快的解耦。目前所有的form表单也是以组件的方式来走的，应该可以在html做标识，然后继承统一的backbone.form来做这些简单的事情。
