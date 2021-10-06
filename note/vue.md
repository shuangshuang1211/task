- 响应式基本原理
  
  - 本质是在创建vm实例时，对传入的数据进行get set处理以及相关依赖数据变动时更新视图、视图更新时数据更新，主要有几个重点：
    - 创建实例时，挂载options、el、data...到vm的实例上，对挂载的数据进行劫持(设置get set)，同时也要考虑data中有数据还是引用类型的数据，递归处理
    - data要变成响应式数据，则在取值时(get)就要添加一个数据依赖(即把数据变更时的回调函数保存起来)，在修改值时(set)发送通知(即执行保存的回调函数，这个函数其本质就是修改dom中展示此变更数据部分)
    - 这个依赖和回调函数什么时候添加？则就要在展示数据dom部分首次渲染后就要添加视图与数据的联系，即让数据与视图有了联系的桥梁
    - 后续更改数据，则就会走到set这部分就触发回调修改视图
    - 视图数据更改到vm数据更改则是在视图部分添加一个事件input 监听函数，在回调执行更改数据的操作
  
  - V2： 通过 Object.defineProperty来设置 get set数据劫持， get获取data中某个值，如果data改变则在set内更改dom
  - V3： 通过 new Proxy代理整个data进行处理

- 发布订阅模式
  - 通过事件触发器$on注册事件，$emit调用事件，
  - 事件注册或调用不依赖
- 观察者模式
  - 观察者Watcher创建update函数更新
  - 发布者Dep添加订阅(addSub)并发布通知(notify ,即调用update)
  - 发布订阅相互依赖

- ### Diff 算法的执行过程

  - Diff首先是同级比较，比较新旧Vnode的差异，从而确定是否更新或复用Dom；
  - 对新旧Vnode节点的开始和结束位置进行标记：oldStartIndex、oblEndIndex、newStartIndex、newEndIndex
  - 对同级的所有子node进行遍历比较，while，当oldStartIndex > oblEndIndex || newStartIndex > newEndIndex退出循环，在此条件下又分为以下几种情况：
    - oldStartINdex对应的oldVnode 与newStartIndex Node满足sameVnode(可以复用的节点)，直接patchNode(节点复用处理)，并新老节点的索引+1
    - 否则，比较sameVonde(oldEndNode, newEndNode)，直接patchNode，索引-1
    - 再比较oldStartVnode与newEndVnode，若满足sameVnode条件，则patchNOde，且移动旧的真实Dom到末尾，旧索引+1，新-1
    - sameVonde（oldEndVnode与newStartVnode）若满足，patchNode后移动旧的真实DOM到开始位置，旧索引 -1，新索引 +1
    - 如果以上四种都不满足，则通过旧Vnode index与key 关系找到与当前新的StartVnode索引key对应的旧节点，比较sameVnode，若满足，则patchNode，然后再把旧节点移动到OldStartVnode前面，若不满足，则createElem新建一个元素放到新startIndex位置

  - while循环完成之后，根据新老节点的数据不同再做相应的调整，如果老节点数目大于新节点的个数，则把未匹配的节点删除，若旧节点个数小于新节点，则要把新节点剩余的节点创建对应的元素添加到真实Dom中

- Vue初始化

  - 给Vue实例添加一些方法和属性
    - initMixin：给Vue原型增加 _init
    - stateMixin: 给 Vue prototype 增加全局方法和属性比如：$delete $set $watch $props $data
    - eventsMixin: 原型 + $emit $off $once 等
    - lifecycleMixin: 原型 + $forceUpdate $destory _update
    - renderMixin: + _render nextTick等

  - 初始化挂载全局的组件指令方法等，initGobalAPI（Vue），component directive filter mixin obeservable  extend options(components(KeepAlive) directives filters)
  - 设置Vue.config 参数随后并在Vue原型 + $mount（把页面挂载到浏览器）
  - 在runtime + compiler版本重写mount
    - 查询 el，判断el不能是body或document元素
    - options 没有render则判断template，有template 则获取对应的template innerHtml(‘#string’等形式)，没有template则获取el的外部元素为模板
    - 编译获取的template(compileTofunctions)得到render函数给options

- Vue初始渲染

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

  - 实例化Watcher
    - 在Watcher里面传入了上述的updateComponent函数，并根据是否及时更新(y)通过get来调用updateComonent
    - updateComponent中先调用_render() 产生虚拟DOM，无论是用户传入的render还是模板编译的render，内部的h函数其本质还是createElement()
    - 后再调用_update(vnode)把虚拟dom转成真实dom，这里又执行了 _ _patch_ _(preVode, vode)函数，此函数在内部定义了操作dom的api，最后返回patch函数，在patch函数内会挂载节点属性事件等操作回调，patch：
       - 判断第一个参数是真实DOM还是虚拟DOM，首次加载时，第一个参数是真实dom，会转换成虚拟dom调用createElm(createElm把vnode及vnode 的children转成真实dom挂载到)真实dom
       - 若是数据更新，则判断sameVnode后patchVnode(diff)
         1. patchNode对比新旧vnode及其子节点，并更新差异，如果新旧vnode都有子节点且子节点不同就用updateChildren对比差异
         2. updateChildren，参考 Diff 算法的执行过程

  - 触发mounted钩子，返回实例

- Vue 中数据响应式的处理

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

- 模板编译过程
  - 看缓存是否有当前模板编译好的render函数
  - 没有则编译模板complie(template, options),合并当前组件options和Vue的options
  - 在baseComplie中把模板转成AST语法树，并对AST语法树进行优化，找出静态节点以及根节点(包含静态文本且有其他标签)，静态节点patch会跳过，再通过generate 把优化后的ast转成字符串形式的js代吗
  - 最后，调用createFunction把js代吗转成js函数，产生render和staticRenderFns，并挂载到options上
