## 函数式编程、函子
- 函数式编程： 对数据之间映射关系的描述；相同的输入有相同的输出(纯函数)；方便代码重用组合; 函数可以作为参数、变量、返回值

- 高阶函数的意义： 代码更简洁、逻辑更清晰、注重业务逻辑

- 闭包： 是指能取到外部函数作用域中的某些变量的函数，当外部函数（A）执行完后，会清除当前活动对象，但如果有函数（B）使用了当前活动对象的变量，则会把用到外部函数的活动对象保存在[[Scope]]属性上，所以在执行B时，先访问当前B的活动对象，再访问A的变量对象，再是外层直到全局作用域

- 函数柯里化： 当函数有多个参数时，可拆分成多个部分，每个部分分次调用函数的参数，即fn(n1,n2,n3,n4) => fn1(n1)(n2)(n3))(n4) 或者fn1(n1,n2)(n3,n4)

  ```js
  // 实现函数柯里化
  // 传入一个函数返回一个函数
  function curry(fn) {
    return function curried(...args) {
       if (args.length < fn.length) {
         return function () {
            return curried(...[...args, ...arguments]);
         }
       }
       return fn(...args);
    }
  }
  ```


- compose实现：对函数进行组合，传入多个函数返回一个函数

  ```js
  const compose = (...fn) => {
    // 分为从右向左执行等
    return (...rest) => fn.reverse().reduce((accFn, currFn) => accFn(fn(...rest)), rest)
  }
  ```

- 什么是函子：是一个容器(普通对象)包含值以及值的变形关系（map方法函数处理关系并返回一个新的函子），作用：控制函数式编程中出现的一些副作用
## Promise

- Promise 抛出错误，被catch后或者reject 捕获后，catch或reject回调后续的代码还会执行吗？

  ```js
  const errPromise = new Promise((resolve, reject) => {
    throw Error('错误');
  });

  errPromise.catch((error) => {
    console.log('error', error);
    // catch 或then的reject捕获到错误后还会继续执行
    const a = `{error} ===`;
    console.log('a', a);
  });
  ```

- then中reject捕获的错误和catch有什么区别？then中只能捕获上一个promise的reject或错误，而catch可以捕获整个promise链上的，而且错误只要被捕获就不会继续向下传递，链会继续执行

- catch 能捕获catch后.then中出现的错误吗？**不能捕获，只能由后续的catch捕获**，then回调函数中的参数只能是最近的上一个的then的成功回调或失败回调的返回或错误

- then中传入一个不是函数的参数会怎样？then()的参数如果不是一个函数则无视，即.then(2)相当于.then(val => val)

- 若reslove或reject已经被捕获则后续

- 同一个Promise对象的then方法可以多次调用

  1. 问题： promise可以同时调用多个then，then就是实例的方法，为什么还要把每个then的callback再存储一遍呢(视频中)？



- 宏任务、微任务、事件循环、任务队列、调用栈(Call Stack 、Execution Context)
  -  因为js一开始是针对浏览器的脚本语言，需要用它来操作DOM，若js可以多线程进行，则容易造成在删除增加DOM时候出现问题，所以js是单线程的(代码从下到下依次执行)。但浏览器不是，为了提升性能，浏览器会先在调用找依次执行同步代码，对于异步代码会等异步任务完成后将异步回调处理函数加入等待执行的任务队列(先进先出);
  - 调用找实行先进后出原则，会保存代码执行期间所有执行上下文，排队的任务会依次push进调用找执行后清除;
  - 当有多个异步任务(即所谓的宏任务)时，后执行的异步代码比之前的异步代码先返回结果，这时，会让先得到返回结果的异步回调先进入任务队列；若这个异步任务执行后还有其他的后续任务处理(微任务)，会继续执行完当前所有的微任务才会执行下一个宏任务;
  -  整体script代码相当于首个宏任务，宏任务有: setTimeOut、setInterval、requestAnimationFrame(浏览器)、I/O、用户交互事件(浏览器)等;
  - 微任务：process.nextTick(针对Node)、promise链式调用的函数(then catch finally)、MutationObserver；
  - 所以整体执行逻辑是，先执行同层级代码的宏任务，再执行当前宏任务下的微任务(包含微任务后又产生的微任务)，等同层级微任务执行完毕再执行下一个宏任务...这样就形成事件的循环
  - await 关键字其实相当于产生一个新的promise微任务
  
- 执行到yield 关键字的时候就暂停还是会把yield后面的表达式执行完后才暂停？

  Generator函数第一次调用会产生一个Generator的对象但不会立即执行函数体，调用.next()会执行到第一个yield 停止(yield 后面的代码会执行完再停止，了解代码的执行顺序)，下一次调用next后再执行第一个yield后到下一个yield之间的代码..., **.next('参数')next这里传入的参数会作为上一个yield执行后的直接返回，而{value: 'xx', done: false}这里的value保存的是yield 后语句返回,** 函数执行到最后，done: true时的这次调用保存的value是函数体的返回，没有就是undefined

  ```js
  function* test (x) {
    console.log('satrt', x);
    // console.log(' yield x*2', yield x*2);
    const fn = () => {
      console.log('调用next后才执行');
      return x*2;
    };
    const y = yield fn();
    console.log('y', y);
    const z = yield y*3;
    console.log('z', z);
    return z;
  }
  
  const gen = test(2);
  // // console.log('[...gen]', [...gen]);
  const res1 = gen.next(3);  // 第一次调用会执行到第一个yield关键字停止，返回res1 {value: 4, done: false}
  console.log(res1);
  const res2 = gen.next(7); // 7会作为上个yield 后的返回值
  console.log(res2);
  ```

## ES6新特性

-  **Proxy** 作用？通过代理的模式监视获取操作数据的行为

  ```js
  const obj = {};
  const objProxy = new Proxy(obj, {
    get: (target, property) => {
       // 实现 一些操作监听等；
      return Reflect.get(target, property)
    }, // 获取obj相应的属性的时候会被监听到
    set: (target, property, value) => ,
    has, deleteProperty, getPrototypeOf, setPrototypeOf, isExtensible, apply, construct, defineProperty...
  });
  ```

- Reflect ? 成员的方法就是Proxy处理对象的默认方法的实现，用途？提供统一的操作对象的api 

  

  
