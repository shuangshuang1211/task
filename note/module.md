- CommonJS基于(node，同步模式加载模块，如果用在浏览器端，加载一个页面会出现多个同步请求)

  - 一个文件就是一个模块
  - 单独作用域
  - Module.exports导出成员（别名是exports.xxx = xxx）
  - require载入模块

- ESModules

  - 异步加载

  - 私有作用域

  - 严格模式

  - 通过CORS请求外部的模块

    esModule可以导入commonjs导出的成员，commonjs只导出默认成员，且不能导入esmodules导出的成员

- EsModule 与commonJs的区别