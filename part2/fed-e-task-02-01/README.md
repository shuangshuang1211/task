## 简答题

**1、谈谈你对工程化的初步认识，结合你之前遇到过的问题说出三个以上工程化能够解决问题或者带来的价值。**

答: 工程化就是帮助在实际项目开发中更高效更快捷解决一些问题，专注于业务逻辑实现，减少一些重复代码的编写，其主要意义有：
  1. 解决传统语法的弊端，借助工程化使用ES6、7的新特性，但同时也保证最后能兼容老版本；
  2. Less、Sass、postCss增加Css编程性，但在运行环境不支持
  3. 可以使用模块化或组件化方式来管理优化代码，提高可维护性 ，模块化组件化
  4. 减少重复机械的操作，比如一些手动实现(比如手动打包上传到服务器)
  5. 代码风格统一、质量保证
  6. 减少依赖后端项目或接口(mock 实现加接口之类)

**2、你认为脚手架除了为我们创建项目结构，还有什么更深的意义？**

答: 脚手架的本质其实是封装一部分你需要在很多项目都需要做的事情，把这部分要做的事情单独拿出来，分流程或分步实现，增加一些配置文件来适应多个项目，就是一种方案的封装。通过脚手架来创建项目结构目录只是运用脚手架一种体现方式


## 编程题

**1、概述脚手架实现的过程，并使用 NodeJS 完成一个自定义的小型脚手架工具**
实现过程：
  - 创建一个新目录(名字一般为这个脚手架的名称),npm init 初始化，安装运行这个脚手需要的一些依赖；

  - 创建一个入口文件(运行脚手架实际node执行的代码)，这个文件头部必须有`#!/usr/bin/env node`；
      `#!/usr/bin/env node`中'#!'是一个符号用于解释这个脚本的解释程序，实现脚手架，最后其实执行的还是一个脚本，一段代码，这段代码需要什么执行器这是需要指定的，而解释器安装在哪里可以通过/usr/bin/env来确定就是告诉系统可以在PATH目录中查找

  - 编写入口文件，这个脚手架需要做的事情，可以npm link到本地全局进行测试此脚手架

  - 在脚手架写好后再package.json中增加bin属性，确定运行这个脚手架时执行的文件

  - 如果需要可以提交到代码仓库后进行publish
    实现的脚手架代码在  [仓库engineer](https://github.com/shuangshuang1211/engineer_prj)

    项目使用以及作用见 README.md

**2、尝试使用 Gulp 完成项目的自动化构建**

​     [fed-e-task-02-01/code/pages-boilerplate](https://github.com/shuangshuang1211/task/tree/master/part2/fed-e-task-02-01/code/pages-boilerplate)　

　 ~~视频演示： 在 [fed-e-task-02-01](https://github.com/shuangshuang1211/task/tree/master/part2/fed-e-task-02-01) 下~~






## 说明：

本次作业中的编程题要求大家完成相应代码后

- 提交一个项目说明文档，要求思路流程清晰。
- 或者简单录制一个小视频介绍一下实现思路，并演示一下相关功能。
- 说明文档和代码统一提交至作业仓库。