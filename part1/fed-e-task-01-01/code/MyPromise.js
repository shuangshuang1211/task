/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/

// Promise是一个类，接受的参数是一个函数，且会立即执行
// 原型方法 then、 catch、 finally，返回的是一个promise，可链式调用，如果有异步则等待后续调用, 每个promise实例可以多次调用then方法
//
// 静态方法 all race resolve reject allSettled any

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    // 传入的创建函数会立即执行，在执行期间如果出错会直接reject
    try {
      executor(this.resolve, this.reject);
    } catch (err) {
      this.reject(err);
    }
  }

  // 定义promise状态；
  status = PENDING;
  // 存储返回的成功的值；
  value;
  /// 失败原因；
  reason;
  // 定义 resolve reject函数, resolve改变状态为fulfilled, rejct 改变状态为 rejected
  // 状态只改变一次，若不是pending则不能再次执行resolve或reject
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    while (this.cacheSuscessCallback.length) {
      this.cacheSuscessCallback.shift()();
    }
  }
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.cacheFailedCallback.length) {
      this.cacheFailedCallback.shift()();
    }
  };

  cacheSuscessCallback = [];
  cacheFailedCallback = [];

  // 定义then；
  then (successCallback, rejectCallback) {
    const isFunc = (fn) => fn instanceof Function;
    const resolveThenValue = (thenReturnPromsie, thenCallbackReturnValue, res, rej) => {
      // 判断then执行后返回的新的promise与then回调函数中返回的promise(如果是promsie)是否是同一个
      // 是同一个则reject
      if (thenReturnPromsie === thenCallbackReturnValue) {
        rej(new TypeError('Type Error'));
      } else if (thenCallbackReturnValue instanceof MyPromise) {
        // 若then回调中返回的是一个promise的新实例则调用这个promise的then方法；
        thenCallbackReturnValue.then(res, rej);
      } else {
        // 若是其他值，则直接reslove；
        res(thenCallbackReturnValue);
      }
    };

    // 若then中回调不是函数则用(value) => value代替，只要resolve或reject值未被捕获就会一直传递下去
    let successCall = isFunc(successCallback) ? successCallback : (value) => value;
    let failCall = isFunc(rejectCallback) ? rejectCallback : (value) => value;

    // then 执行后会返回一个新的回调
    const thenPromise = new MyPromise((res, rej) => {
      // 定义执行成功回调函数后对返回结果的处理
      const thenSuccess = () => {
        // 若then回调返回的Promise出现错误，需要被后续的then或catch捕获
        try {
          const thenValue = successCall(this.value);
          setTimeout(() => {
            // 异步调用是为了拿到thenPromise值
            resolveThenValue(thenPromise, thenValue, res, rej);
          });
        } catch (err) {
          rej(err);
        }
      };
      // 定义执行Reject回调函数后对返回结果的处理
      const thenReject = () => {
        const thenValue = failCall(this.reason);
        try {
          setTimeout(() => {
            resolveThenValue(thenPromise, thenValue, res, rej);
          });
        } catch (err) {
          rej(err);
        }
      }
      if (this.status === FULFILLED) {
        // status 变为resolve则执行成功回调
        // 要考虑thenValue的类型，若是promise则进行promsie.then处理返回new promise，后续可以继续调用，其实这里就是再走一遍then逻辑
        thenSuccess();
      } else if (this.status === REJECTED) {
        // reject回调执行后返回的值，也要考虑是否是promise
        thenReject();
      } else {
        // pending，则要存储调用的回调函数，等到resolve或reject时直接调用
        this.cacheSuscessCallback.push(thenSuccess);
        this.cacheFailedCallback.push(thenReject);
      }
    });
    return thenPromise;
  }
  // 定义catch, catch其实是对then中只处理reject回调的包装
  catch (rejectCallback) {
    return this.then(undefined, rejectCallback)
  }

  // finally 无论resolve或者rejected都会调用，这里回调不会有参数，且返回一个新的promise
  // finally 返回的promise会resolve或reject finally之前promise的值，而不是finally中回调的返回值
  finally(call) {
    return this.then((value) => {
      // 这里直接调用当前执行finally promise的then方法，所以此时的value就是新promise要处理的value
      return MyPromise.resolve(call()).then(() => value);
    }, (error) => {
      // 这里的error就是finally执行后reject的error
      return MyPromise.resolve(call()).then(() => { throw error });
    })
  }

  // resolve 如果传入的值是一个promise则返回，如果传入的是其他类型的值则返回一个resolve的promise
  static resolve (value) {
    if (value instanceof MyPromise) {
      return value;
    } else {
      return new MyPromise((res) => {
        res(value);
      })
    }
  }

  // 传入一个值返回一个reject的promise
  static reject (value) {
    return new MyPromise((res,rej) => {
      rej(value);
    })
  }

  // 参数是具有iterable类型，其值可以是promsie或普通数据类型值；所有promsie都resolve则返回一个resolve(值为对应promise处理结果)的promsie,
  // 若有一个reject 则返回reject promise
  // 如果不传值会同步地返回一个已完成（resolved）状态的promise
  static all (arr) {
    let res = [];
    let key = 0;
    return new MyPromise((resolve, reject) => {
      const addData = (value, index) => {
        res[index] = value;
        key ++;
        if (key === res.length) {
          resolve(res);
        }
      };
      if (arr !== null && typeof arr[Symbol.iterator] === 'function') {
        for (let index = 0; index < arr.length ; index ++) {
          const arrValue = arr[index];
          if (arrValue instanceof MyPromise) {
            arrValue.then((v) => {
              addData(v, index);
            }, (err) => {
              key ++;
              reject(err);
            });
          } else {
            addData(arrValue, index);
          }
        }
      } else if (!arr) {
        resolve();
      } else {
        console.error('arr must be iterable data');
      }
    });
  }

  // 参数可迭代，与all一样，若有一个被拒绝或已解决，则返回rejct 或resolve的promsie；
  // 若参数为空，则返回一个pending的promsie；若有参数已经是resolve或reject或非promise值，则会标记为找到的第一个值
  static race (arr) {
    return  new MyPromise((resolve, reject) => {
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] instanceof MyPromise) {
            arr[i].then((rev) => {
              resolve(rev);
              return;
            }, (err) => {
              reject(err);
              return;
            });
          } else {
            resolve(arr[i]);
            return;
          }
        }
      }
    });
  }

  // 参数可迭代，若所有的promise都resolve(fulfilled)或reject异步也完成时，返回一个resolve 数组promsie对应的结果对象数组的promise
  // [{status: 'fulfilled', value: xxx}, {status: 'rejected', reason: xxx}]
  static allSettled (arr) {
    let res = [];
    let key = 0;
    return new MyPromise((resolve, reject) => {
      const addData = (value, index, isReject) => {
        const obj = {
          status: isReject ? 'rejected' : 'fulfilled',
          value: isReject ? undefined : value,
          reason: isReject && value,
        }
        res[index] = obj;
        key ++;
        if (key === res.length) {
          resolve(res);
        }
      };
      if (arr !== null && typeof arr[Symbol.iterator] === 'function') {
        for (let index = 0; index < arr.length ; index ++) {
          const arrValue = arr[index];
          if (arrValue instanceof MyPromise) {
            arrValue.then((v) => {
              addData(v, index);
            }, (err) => {
              addData(err, index, true);
            });
          } else {
            addData(arrValue, index);
          }
        }
      } else {
        console.error('arr must be iterable data');
      }
    });
  }

  // 传入空，则返回已拒绝的promsie，若有一个成功(非promise会返回成功)，则返回这个promsie，若都是失败，返回rejected AggregateErr 的错误
  static any (arr) {
    let key = 0;
    return new MyPromise((resolve, reject) => {
      if (arr !== null && typeof arr[Symbol.iterator] === 'function') {
        for (let index = 0; index < arr.length ; index ++) {
          const arrValue = arr[index];
          if (arrValue instanceof MyPromise) {
            arrValue.then((v) => {
              resolve(v);
              return ;
            }, (err) => {
              key ++;
              if (key === arr.length) {
                reject('AggregateErr: No Promise in Promise.any was resolved');
              }
            });
          } else {
            resolve(arrValue);
            return ;
          }
        }
      } else if (!arr) {
        resolve();
      } else {
        console.error('arr must be iterable data');
      }
    });
  }
}

// 测试案例
const myPromise1 = new MyPromise((res, rej) => {
  // res(1);
  // rej(2);
  setTimeout(() => {
    rej(1000);
  }, 2000);
});

// console.log(myPromise1.reject.toString());
// const p1 = new Promise((res) => {
//   res(1);
// })
// console.log('p1', p1.reject.toString());
const myPromise2 = new MyPromise((res, rej) => {
  // res(1);
  rej(2);
  // setTimeout(() => {
  //   rej(1000);
  // }, 2000);
});
const myPromise3 = new MyPromise((res, rej) => {
  rej(3);
  // rej(2);
  // setTimeout(() => {
  //   rej(1000);
  // }, 2000);
});
const _ = require('lodash');
// console.log('test', myPromise1.resolve.toString());
const susCall = _.curry((order, value) => {
  console.log(`成功_${order}`, value);
  return '成功';
});
const failCall = _.curry((order, value) => {
  console.log(`失败_${order}`, value);
  return '失败'
});
myPromise1
// .catch(failCall(1))
// .then((value) => {
//   susCall(1.1, value);
//   return '1.1';
// }, (reason) => {
//   failCall(1.1, reason);
// })
// .finally(() => {
//   console.log('finally');
//   return 'finally';
// })
// // .then().then(3)
// .then((value) => {
//   susCall(1.2, value);
// }, (reason) => {
//   failCall(1.2, reason);
// })
;
myPromise1
// .then((value) => {
//   susCall(2.1, value);
// }, (reason) => {
//   failCall(2.2, reason);
// })
// .then((value) => {
//   susCall(2.3, value);
// }, (reason) => {
//   failCall(2.4, reason);
// });
;
// MyPromise.reject('myPromise1').catch((err) => console.log('2', err));
// console.log('MyPromise.reject(myPromise1)', MyPromise.reject(myPromise1));
// Promise.reject(myPromise1).then(() => console.log('1=')).catch((err) => console.log('2=', err));
// console.log('Promise.reject(myPromise1)', Promise.reject(myPromise1));

const res = MyPromise.all([myPromise1, myPromise2, myPromise3, 4]);
res.then((value) => console.log('all所有成功', value), (err) => console.log('有一个失败', err));

const raceRes = MyPromise.race([myPromise1, myPromise2, myPromise3, 4]);
raceRes.then((value) => console.log('race有一个已被resolve', value), (err) => console.log('有一个reject', err));

const allSettledRes = MyPromise.allSettled([myPromise1, myPromise2, myPromise3, 4]);
allSettledRes.then((value) => console.log('allSettled已被resolve', value), (err) => console.log('有一个reject', err));

const anyRes = MyPromise.any([myPromise1, myPromise2, myPromise3, 4]);
anyRes.then((value) => console.log('anyRes 有一个resolve', value), (err) => console.log('所有都reject', err));
