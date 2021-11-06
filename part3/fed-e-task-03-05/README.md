## 简答题

（请直接在本文件中作答）

#### 1、Vue 3.0 性能提升主要是通过哪几方面体现的？

 - 源码打包体积的优化
   - 3.0中使用tree sharking 技术，在编译阶段通过静态分析，找到未引入的vue模块进行标记，这些未引入的模块的代码就不会打包从而减少项目中vue包的体积
   - 同时3.0也移除了一些冷门的模块，比如filter inline-template等
 - 数据劫持的优化
   - 3.0用Proxy代替Object.defineProperty 来处理响应式数据，defineProperty是对数据属性进行劫持，增加getter或setter，形如defineProperty(targert, key, handler = {getter ..., setter}),因为是对单个属性的劫持，所以无法处理数据增加或删除或数组索引长度变化时的响应变化，而且对数据嵌套层级比较深时，需要一直递归处理；
   - 而Proxy则是对整个target进行劫持，所以数据增加或删除时能实时触发trigger函数，且是在内部数据访问到的时候才会变成响应式
 - 编译上的优化
   - 3.0对应的vite更好的开发体验
   - Vnode节点更新的优化，节点重新渲染跟动态内容有关，而不是2.0那样跟模块大小有关(组件有很多静态节点，但只有一个动态节点，但是动态节点改变也会遍历同级的vnode消耗性能)

#### 2、Vue 3.0 所采用的 Composition Api 与 Vue 2.x使用的Options Api 有什么区别？

   Options Api包含所有描述组件信息选项的对象，如果实现一个功能，可能会分别在data methods或computed等地方进行不同的数据处理和事件函数，Composition则提供一个函数，在这个函数内部可以设计组件需要的响应数据和方法，把同一个功能代码组和在一起更有利于阅读和维护

#### 3、Proxy 相对于 Object.defineProperty 有哪些优点？

　- Proxy可以监听到数组的变化，而defineProperty不能监听，vue是改造了数组的shift pop等八中方法
　- defineProperty只能劫持对象属性的变化，对整个数据劫持需要遍历每个属性，如果属性值是对象还需要进一步遍历，如果嵌套层级比较深则比较消耗性能，而proxy可以劫持整个对象返回新的proxy对象，而且proxy内部handler 除了get set deleteProperty等拦截方法还有其他函数方法，



#### 4、Vue 3.0 在编译方面有哪些优化？

- 2.0中模板被编译成渲染函数，当组件的状态发生变化通知watcher，触发watcher的update最终去执行vnode的patch操作，为每个vnode找到差异并更新到真实DOM， 所以V2的更新是组件级的。在diff中，通过标记静态根节点优化diff过程，但每次也都要比较剩下的所有新旧节点，
- 3.0增加了Fragment并会提升标记静态根节点(提升到render外部初始化的时候只创建一次)，diff只对比动态更新的内容(设置patchFlag，根据flg不同标记相应的什么内容变化从而对对应的内容diff，从而提交diff的性能)，所以v3的更新针对动态内容，v3增加了cache缓存事件等，首次渲染后把绑定的事件缓存成一个函数，随后渲染会直接使用缓存的函数得到，从而减少不必要的更新

　

#### 5、Vue.js 3.0 响应式系统的实现原理？

　- 用weakMap的数据形式存储数据(target)的所有依赖关系(value),value中是target的每个属性对应的所有的effect的Map数据，其中effect是用Set数据存放，避免有重复的effect触发

-  用Proxy代理数据，添加get、set 、deleteProperty 处理函数，在获取目标对象数据时，触发get，在get中添加一个track，来跟踪数据变化，track实现的核心是收集到数据属性的相关依赖，通过在暴露给外部一个接口(effect)传入依赖回调并立即执行这个回调来触发proxy数据的get，在track内进行收集；同时在set或deleteProperty中添加trigger，当在外部对响应式数据进行重新赋值或改动时则会调用trigger，同时依次遍历所有的effect Set集合进行重新计算，实现数据响应同步

　