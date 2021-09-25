- 怎么提升webpack的打包速度？

  1. dll 动态库，开发环境下让大的外部依赖模块打包成dll库，这样以后不用每次再打包

  2. webpack config 可以配置prod和dev的模式，单独配置merge

  3. entry可以有多个，输出目录的配置，runtimechunk可以减少浏览器请求的一些公共文件，进行缓存

  4. Splichunks动态加载的模块进行单独打包，懒加载设置，，外部模块 .vendor

  5. CDN

  6. scope hoisting

     

- Loader 与plugins 
  1. Loader 只是对文件输入到输出的转换，其本质是一个函数，这个函数如果是在最后一步执行的，其导出必须是一段js代码的字符串(在webpack中经过loader处理完后，会直接把返回值附加到输出的模块代码中)，如果返回的是其他格式，也可以用其他格式的loader再接着进行处理，所以所有loader可以配合一起使用（管道）
  2. Plugins (函数或者包含apply方法的对象，注入到webpack中后会被webpack调用)通过注入到webpack暴露出的钩子节点进行挂载任务然后对代码的一些处理