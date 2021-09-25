# 一、简答题

#### 1、Webpack 的构建流程主要有哪些环节？如果可以请尽可能详尽的描述 Webpack 打包的整个过程。

- 初始化配置参数,merge webpack.config.js或shell中输入的配置选项
- 编译
   - 创建一个complier 对象(具有文件读写能力)
	 - 挂载配置的pulgins和webpack默认的插件到此对象上
	 - complier对象需要定义某些特定事件流的钩子，当执行到该事件时触发回调注入一些新的操作或修改
	 - Complier必须有run方法(最终调用此方法来执行打包操作)，在此方法中，实际又实例化了Complition(Complier)
- Complition
   - 确定entry入口(mouduleId),保存在Complition属性上
	 - 创建模块，存入依赖的所有模块，从文件中读取依赖模块，若不是js模块或其他非CommonJs规范的加载模块方式，则用loader进行处理，返回js模块
	 - 对模块进行转换，转换成AST语法树，用自定义的_webpack_require替换模块导入的关键字require，最终将修改后的AST转换成node code保存
	 - 如果依赖的模块又依赖了模块，则递归进行上述操作直到处理完所有依赖模块
- 生成chunk
   - 根据入口找到依赖所有模块后，把所有模块的源码合并到一起，并根据提供的template与源码生成chunk.js文件
- 最后输出chunk assets到目标目录

#### 2、Loader 和 Plugin 有哪些不同？请描述一下开发 Loader 和 Plugin 的思路。

	- Loader 只是对文件输入到输出的转换，其本质是一个函数，这个函数如果是在最后一步执行的，其导出必须是一段js代码的字符串(在webpack中经过loader处理完后，会直接把返回值附加到输出的模块代码中)，如果返回的是其他格式，也可以用其他格式的loader再接着进行处理，所以所有loader可以配合一起使用（管道）
  - Plugins (函数或者包含apply方法的对象，注入到webpack中后会被webpack调用)通过注入到webpack暴露出的钩子节点进行挂载任务然后对代码的一些处理


# 二、编程题

#### 1、使用 Webpack 实现 Vue 项目打包任务

具体任务及说明：

1. 在 code/vue-app-base 中安装、创建、编辑相关文件，进而完成作业。
2. 这是一个使用 Vue CLI 创建出来的 Vue 项目基础结构
3. 有所不同的是这里我移除掉了 vue-cli-service（包含 webpack 等工具的黑盒工具）
4. 这里的要求就是直接使用 webpack 以及你所了解的周边工具、Loader、Plugin 还原这个项目的打包任务
5. 尽可能的使用上所有你了解到的功能和特性



**提示：(开始前必看)**

在视频录制后，webpack 版本以迅雷不及掩耳的速度升级到 5，相应 webpack-cli、webpack-dev-server 都有改变。

项目中使用服务器的配置应该是改为下面这样：

```json
// package.json 中部分代码
"scripts": {
	"serve": "webpack serve --config webpack.config.js"
}
```

vue 文件中 使用 style-loader 即可

**其它问题, 可先到 https://www.npmjs.com/ 上搜索查看相应包的最新版本的配置示例, 可以解决大部分问题.**



#### 作业要求

本次作业中的编程题要求大家完成相应代码后

- 提交一个项目说明文档，要求思路流程清晰。
- 或者简单录制一个小视频介绍一下实现思路，并演示一下相关功能。
- 最终将录制的视频或说明文档和代码统一提交至作业仓库。