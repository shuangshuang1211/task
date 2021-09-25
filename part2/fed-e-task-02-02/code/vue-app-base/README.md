# vue-app-base

```
- npm run serve
  - 在本地开起一个服务，端口4001
  - 实现了热加载
- npm run build
  - 打包最后生产代码
  - css js等文件分离，minizer等
  - 最终得到一个dist目录，包含js和styles目录以及public 文件和以上所有资源的build.zip压缩包
- npm run lint 
  - 检查src下 .vue js文件是否有语法错误
  - 实现eslint检查也可以通过在webpack中加入eslint-loader实现(这里注释掉)
```