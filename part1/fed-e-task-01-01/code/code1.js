/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/

// 方法1
const promise = (resValue) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(resValue);
  }, 10);
});
const p1 = promise('hello');
const p2 = p1.then((value1) => {
  return promise(`${value1}lagou`);
});
const p3 = p2.then((value2) => {
  setTimeout(console.log, 10, `${value2}I ♥ U`);
});

// 方法2
async function asyncFn () {
  // console.log(new Date().getTime());
  const p1 = await promise('hello');
  // console.log(new Date().getTime());
  const p2 = await promise('lagou');
  // console.log(new Date().getTime());
  const p3 = await promise('I ♥ U');
  console.log(p1 + p2 + p3);
}

asyncFn();

