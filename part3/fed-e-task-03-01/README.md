## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么。

- V2不是,V3应该是响应式的；因为在V2中设置数据为响应式是在vue 实例化的时候对传入的数据进行修改，借助Object.defineProperty对data中每个属性单独包装了set get方法劫持数据，对数据读取时添加依赖(即在这里要保存该数据变更时的操作函数更新视图)，对数据修改时调用该回调。而且对data属性的设置，是递归进行的，即data 下所有的property都有，如果值为对象，name该值的属性也具有set get方法操作value。上述都是在实例化的时候进行，实例化完成后再对data添加新的属性，则该属性就不会有set get 响应方法。而V3如果是new Proxy()来代理整个data来设置数据set get，所以实例化后再加属性也是响应式的

- 可以在data内初始化时就对后续需要用到的值进行占位
- 也可以用Vue.set(this.dog, 'name', 'Trump') 或 observable

```js
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 methods: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

### 2、请简述 Diff 算法的执行过程

- Diff首先是同级比较，比较新旧Vnode的差异，从而确定是否更新或复用Dom；
- 对新旧Vnode节点的开始和结束位置进行标记：oldStartIndex、oblEndIndex、newStartIndex、newEndIndex
- 对同级的所有子node进行遍历比较，while，当oldStartIndex > oblEndIndex || newStartIndex > newEndIndex退出循环，在此条件下又分为以下几种情况：
  - oldStartINdex对应的oldVnode 与newStartIndex Node满足sameVnode(可以复用的节点)，直接patchNode(节点复用处理)，并新老节点的索引+1
  - 否则，比较sameVonde(oldEndNode, newEndNode)，直接patchNode，索引-1
  - 再比较oldStartVnode与newEndVnode，若满足sameVnode条件，则patchNOde，且移动旧的真实Dom到末尾，旧索引+1，新-1
  - sameVonde（oldEndVnode与newStartVnode）若满足，patchNode后移动旧的真实DOM到开始位置，旧索引 -1，新索引 +1
  - 如果以上四种都不满足，则通过旧Vnode index与key 关系找到与当前新的StartVnode索引key对应的旧节点，比较sameVnode，若满足，则patchNode，然后再把旧节点移动到OldStartVnode前面，若不满足，则createElem新建一个元素放到新startIndex位置

- while循环完成之后，根据新老节点的数据不同再做相应的调整，如果老节点数目大于新节点的个数，则把未匹配的节点删除，若旧节点个数小于新节点，则要把新节点剩余的节点创建对应的元素添加到真实Dom中

## 二、编程题

### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

```js
let _Vue = null
export default class MyVueHashRouter {
  constructor (options) {
    this.options = options //! 保存传入的选项，比如路由规则等
    this.data = _Vue.observable({
      current: '/'
    }) // 保存当前路由,且可响应
    this.routeMap = {} // 保存当前路由与组件的对应关系
    this.init()
    console.log('options', options);
  }

  static install (vue) {
    // 判断是否已在Vue
    if (MyVueHashRouter.install.installed) {
      return
    }
    MyVueHashRouter.install.installed = true
    _Vue = vue
    _Vue.mixin({
      beforeCreate () {
        if (this.$options.router) {
          // 把 新建实例传入的router 挂载到Vue实例上
          _Vue.prototype.$router = this.$options.router
        }
      }
    })
  }

  init () {
    this.createRouteMap()
    this.routerComponent()
    this.initEvent()
  }

  createRouteMap () {
    this.options.routes.forEach((r) => {
      this.routeMap[r.path] = r.component
    })
  }

  routerComponent () {
    _Vue.component('router-link', {
      props: {
        to: String
      },
      render (h) {
        return h('a',
        {
          attrs: { href: this.to },
          on: { click: this.clickHandler }
        },
        [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          // history.pushState({}, '', this.to)
          // 更改hash
          window.location.hash = this.to
          // this是当前vue实例，$router是传入的vue-router实例
          // 更新当前path
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const that = this
    _Vue.component('router-view', {
      render (h) {
          const cm = that.routeMap[that.data.current]
          return h(cm)
      }
    })
  }

  initEvent () {
    // 历史path后退监听
    window.addEventListener('hashchange', () => {
        const reHash = window.location.hash.replace('#', '')
        this.data.current = reHash
    })
}
}
```



### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

```js
// 匹配指令
compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text --> text
        const reg = /^(v\-|@|:)/
        attrName = attrName.replace(reg, '')
        // on:click ...
        const attrNameArr = attrName.split(':');
        let eventProps = { name: '', propList: []};
        if (attrNameArr.length > 1) {
          attrName = attrNameArr[0]
          const eventDataArr = attrNameArr[1].split('.')
          eventProps.name = eventDataArr[0]
          if (eventDataArr.length > 1) {
            eventProps.propList = eventDataArr.slice(1)
          }
        }
        let key = attr.value
        console.log('attrName', attrName, 'eventProps', eventProps);
        this.update(node, key, attrName, eventProps)
      }
    })
  }

// v-html
  htmlUpdater (node, value, key) {
    node.innerHTML = value
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }
// v-on @
onUpdater (node, value, key, eventData) {
    node[`on${eventData.name}`] = this.vm.$options.methods[key]
  // 还需处理 propsList 中设置一些属性 ,比如 .stop.prevent 等
    console.log('value==>', value, key);
  }

```

　

### 3、参考 Snabbdom 提供的电影列表的示例，利用Snabbdom 实现类似的效果，如图：

![image-20211003151508717](/Users/test/Library/Application Support/typora-user-images/image-20211003151508717.png)

```js
import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'
// import { attributesModule } from 'snabbdom/build/package/modules/attributes'
import { eventListenersModule } from 'snabbdom/build/package/modules/eventlisteners'
import { propsModule } from 'snabbdom/build/package/modules/props'
import { styleModule } from 'snabbdom/build/package/modules/style'

let patch = init([
  propsModule,
  styleModule,
  eventListenersModule
])
const originalData = [
  {
    rank: 1,
    title: "The Shawshank Redemption",
    desc:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    elmHeight: 0,
  },
  {
    rank: 2,
    title: "The Godfather",
    desc:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    elmHeight: 0,
  },
  {
    rank: 3,
    title: "The Godfather: Part II",
    desc:
      "The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.",
    elmHeight: 0,
  },
  {
    rank: 4,
    title: "The Dark Knight",
    desc:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.",
    elmHeight: 0,
  },
  {
    rank: 5,
    title: "Pulp Fiction",
    desc:
      "The lives of two mob hit men, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    elmHeight: 0,
  },
  {
    rank: 6,
    title: "Schindler's List",
    desc:
      "In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    elmHeight: 0,
  },
  {
    rank: 7,
    title: "12 Angry Men",
    desc:
      "A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.",
    elmHeight: 0,
  },
  {
    rank: 8,
    title: "The Good, the Bad and the Ugly",
    desc:
      "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
    elmHeight: 0,
  },
  {
    rank: 9,
    title: "The Lord of the Rings: The Return of the King",
    desc:
      "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    elmHeight: 0,
  },
  {
    rank: 10,
    title: "Fight Club",
    desc:
      "An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...",
    elmHeight: 0,
  },
]

let data = [...originalData]
let oldVnode = null
let sortedBy = 'rank'
let nextKey = 11
const margin = 8

function add () {
  data = [
    { rank: nextKey++, title: originalData[3].title, desc: originalData[2].desc, elmHeight: 0 },
  ].concat(data);
  render()
}
function changeSort (name) {
  sortedBy = name
  data.sort((a, b) => a[name] > b[name] ? 1 : a[name] < b[name] ? -1 : 0)
  render()
}

function remove (movie) {
  data = data.filter((m) => {
    return m !== movie;
  });
  render();
}
function itemView (item, index) {
  return h('div.row', {
    key: item.rank,
    style:  {
      opacity: "0",
      transform: "translate(-200px)",
      delayed: { transform: `translateY(${0}px)`, opacity: "1" },
      remove: {
        opacity: "0",
        transform: `translateY(${item.offset}px) translateX(200px)`,
      },
      display: 'flex',
      marginTop: '16px',
      height: '50px',
      alignItems: 'center'
    },
    hook: {
      insert: (vnode) => {
        // item.elmHeight = oldVnode.elm.offsetHeight;
      },
    }
  }, [
    h("div", { style: { fontWeight: "bold", minWidth: '20px' } }, item.rank),
    h("div", { style: { minWidth: '200px' } }, item.title),
    h("div", item.desc),
    h('div.btn.rm-btn', { on: { click: () => remove(item) } }, 'x')
  ])

}

function render () {
  data = data.reduce((acc, m) => {
    const last = acc[acc.length - 1];
    m.offset = last ? last.offset + last.elmHeight + margin : margin;
    return acc.concat(m);
  }, []);
  totalHeight =
    data.length === 0
      ? 0
      : data[data.length - 1].offset + data[data.length - 1].elmHeight;
  oldVnode = patch(oldVnode, view(data));
}

function view (data) {
  let vnode = h('div', [
    h('h1', 'Top 10 Movies'),
    h('div', { style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between' } }, [
      h('button', { on: { click: add } }, '添加'),
      // '排序:',
      h('div', { style: { display: 'flex' } }, [
        h('button', { style: { marginRight: '8px' }, classes: { active: sortedBy === 'rank' }, on: { click: () => changeSort('rank') } }, '序号'),
        h('button', { style: { marginRight: '8px' }, classes: { active: sortedBy === 'title', on: { click: () => changeSort('title') } } }, '标题'),
        h('button', { style: { marginRight: '8px' }, classes: { active: sortedBy === 'desc' }, on: { click: () => changeSort('rank') } }, '描述')
      ]),
    ]),
    h('div.list', { style: {height: '500px' } }, data.map(itemView))
  ]);
  return vnode
}

// 首次渲染
// oldVnode = patch(app, view(data))
// render()
window.addEventListener("DOMContentLoaded", () => {
  // const container = document.getElementById("container");
  let app = document.querySelector('#app')
  oldVnode = patch(app, view(data));
  render();
});
```

