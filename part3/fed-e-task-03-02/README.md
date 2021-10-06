## Vue.js 源码剖析-响应式原理、虚拟 DOM、模板编译和组件化

### 简答题

#### 1、请简述 Vue 首次渲染的过程。

- 初始化Vue，添加实例成员静态成员等

- new Vue, 调用_init 初始化vue实例，合并options

- 设置实例的renderProxy，并给实例挂载一些成员

- 调用.$mount

  - 如果是runtime+complier版本则调用上述带编译版本的mount，runtime则在mount中重新获取el

- 随后后调用了mountComponent函数

  - 判断是否有render

  - 触发beforeMount

  - 定义updateComponent更新组件

    - 调用render生成虚拟Dom
      - 调用用户传入的render
      - 或compileTofunctions生成的render
      - return Vnode

    - 返回的虚拟DOM传入vm._update，将虚拟DOM挂载到真实页面, 其实就是执行_patch(vm.$el, Vnode)


#### 2、请简述 Vue 响应式原理。

- 初始化Vue时，进行initState、initData、oberve()
- observe(value)，判断value是否是对象，是对象再判断对象是否具有__ob__属性，有直接返回，没有则调用Observe，新建一个observe对象并返回
- new Observe(), 给value对象定义不可枚举的ob属性并记录此observe对象，
  - 是数组对象，则重写数组的push pop shift unshift splice sort reverse 方法(数组改变发送通知dep.notify)，遍历数组中每个值进行observe()
  - 不是数组对象，调用walk(value),遍历每个key，对值进行defineRactive

- defineReactive, 为每个属性创建Dep对象，如果是对象再对其进行observe
  - getter，收集依赖，如果有子对象也对子对象收集依赖
  - setter， 保存新值，新值是对象也调用observe，发送通知dep.,notify

- 收集依赖，在实例化Watche调用get方法()r时，把watcher保存到Dep.target中；访问data属性在defineReactive时，把watcher对象添加到dep.subs数组中(dep.depende())，如果有子对象，对子对象也添加依赖
- Watcher， 数据变化发送通知其实调用的是watcher对象的update方法
  - queueWatcher判断watcher是否被处理，没有处理添加到队列中，随后flushSchedulerQueue
  - flushSchedulerQueue，触发beforeUpdate，调用watcher.run()(其实也是调用watcher.get()),清空上一次依赖，触发actived钩子，updated

#### 3、请简述虚拟 DOM 中 Key 的作用和好处。

　增加key，可以减少在进行子节点变化(增删排序等)更新的时候减少DOM的操作，从而提高性能。一般key用在数据不同展示形式类似的子列表元素中，到patch vnode时，执行到updateChildren时可以按key是否相同从而减少真实元素的创建

#### 4、请简述 Vue 中模板编译的过程。

- 模板编译的最终目的是得到能产生虚拟dom的render函数，其实质是一开始在createCompileToFunctionFn函数中看缓存对象是否有当前模板编译好的render函数
- 没有则编译模板complie(template, options),合并当前组件options和Vue的options
- 在baseComplie中把模板转成AST语法树，并对AST语法树进行优化，找出静态节点以及根节点(包含静态文本且有其他标签)，静态节点patch会跳过，再通过generate 把优化后的ast转成字符串形式的js代吗
- 最后，调用createFunction把js代吗转成js函数，产生render和staticRenderFns，并挂载到options上

　

　

　