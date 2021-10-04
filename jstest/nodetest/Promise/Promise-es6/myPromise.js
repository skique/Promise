function Promise(executor) {
  this.state = "pending";
  this.data = undefined;
  this.reason = undefined;
  this.resolvedCallbacks = [];
  this.rejectCallbacks = [];
  let self = this;
  // 保存内部状态和响应数据，依次调用成功的回调函数
  let resolve = (value) => {
    if (this.state === "pending") {
      this.state = "fulfilled";
      this.data = value;
      for (let i = 0; i < self.resolvedCallbacks.length; i++) {
        self.resolvedCallbacks[i](value);
      }
    }
  };
  // 保存内部状态和响应数据，依次调用失败的回调函数
  let reject = (reason) => {
    if (this.state === "pending") {
      this.state = "failed";
      this.reason = reason;
      for (let i = 0; i < self.rejectCallbacks.length; i++) {
        self.rejectCallbacks[i](reason);
      }
    }
  };
  try {
    // 向promise对象“所代理的那个数据”置值
    // 由用户传入的回调函数（接受resolve, reject参数）,
    // 在这个例子中是function (resolve, reject){ resolve(100) }
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

// 它的作用是为Promise实例添加状态改变时的回调函数并在异步完成时执行这个函数
// then方法会返回一个新的Promise(详情)对象。
// then方法接收两个参数，fn1，fn2，分别为Promise成功或失败后的回调
Promise.prototype.then = function (fn1, fn2) {
  var self = this;
  var promise2;

  // 首先对入参 fn1, fn2做判断
  fn1 = typeof fn1 === "function" ? fn1 : function (v) {};
  fn2 = typeof fn2 === "function" ? fn2 : function (r) {};

  if (self.state === "fulfilled") {
    return (promise2 = new Promise(function (resolve, reject) {
      // 把 fn1、fn2 放在 try catch 里面，毕竟 fn1、fn2 是用户传入的，报错嘛，很常见
      try {
        var x = fn1(self.data);
        if (x instanceof Promise) {
          // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
          x.then(
            (res) => resolve(res),
            (e) => reject(e)
          );
        } else {
          // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    }));
  }

  if (self.state === "failed") {
    return (promise2 = new Promise(function (resolve, reject) {
      try {
        var x = fn2(self.data);
        if (x instanceof Promise) {
          // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
          x.then(resolve, reject);
        }
        resolve(x);
      } catch (e) {
        reject(e);
      }
    }));
  }

  if (self.state === "pending") {
    return (promise2 = new Promise(function (resolve, reject) {
      self.resolvedCallbacks.push(function (value) {
        try {
          var x = fn1(self.data);
          if (x instanceof Promise) {
            // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
            x.then(resolve, reject);
          } else {
            resolve(x);
          }
        } catch (e) {
          reject(e);
        }
      });
      self.rejectCallbacks.push(function (value) {
        try {
          var x = fn2(self.data);
          if (x instanceof Promise) {
            // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
            x.then(resolve, reject);
          } else {
            resolve(x);
          }
        } catch (e) {
          reject(e);
        }
      });
    }));
  }
};

module.exports = Promise;
