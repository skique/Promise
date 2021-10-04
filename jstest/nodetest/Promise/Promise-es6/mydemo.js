const Promise = require("./myPromise.js");

// Promsie构造函数转入的回调函数是一个“数据置值器”
// 接收resolve，和reject，成功时调用resolve置值，失败时调用reject置值
// 用户通过代码（resolve或reject）来回调引擎以置值
const p = new Promise(function (resolve, reject) {
  // 设置了一个定时器，1s后才能知道对应的状态
  try {
    setTimeout(() => {
      resolve("我在1s后被执行");
    }, 1000);
  } catch (e) {
    reject(e);
  }
});

// Promise的状态发生了改变后需要执行的用户代码
// then执行的时候state的状态还没确定下来
p.then((res) => {
  console.log("p1", res);
  // return '回调结果成功'
  return new Promise(function (resolve, reject) {
    try {
      setTimeout(() => {
        resolve("我在第2s后被执行");
      }, 1000);
    } catch (e) {
      reject(e);
    }
  });
}).then((res) => {
  console.log("p2", res);
});
