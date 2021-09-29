var Promise = function () {
  // 队列用于存储待执行的回调函数
  this.queue = [];
  this.isPromise = true;
};

// then()方法所做的事情是将回调函数存放起来。
Promise.prototype.then = function (
  fulfilledHandler,
  errorHandler,
  progressHandler
) {
  var handler = {};
  if (typeof fulfilledHandler === "function") {
    handler.fulfilled = fulfilledHandler;
  }
  if (typeof errorHandler === "function") {
    handler.error = errorHandler;
  }
  this.queue.push(handler);
  return this;
};

var Deferred = function () {
  this.promise = new Promise();
};

// 完成态
Deferred.prototype.resolve = function (obj) {
  var promise = this.promise;
  var handler;
  while ((handler = promise.queue.shift())) {
    // 从promsie队列中取出第一个元素，直到取不到为止
    if (handler && handler.fulfilled) {
      var ret = handler.fulfilled(obj); // 触发完成态回调函数
      if (ret && ret.isPromise) {
        // 如果它返回的也是回调函数
        ret.queue = promise.queue; // 初始化它的内部队列
        this.promise = ret; // 赋值给内部的promise
        return;
      }
    }
  }
};

// 失败态
Deferred.prototype.reject = function (err) {
  var promise = this.promise;
  var handler;
  while ((handler = promise.queue.shift())) {
    if (handler && handler.error) {
      var ret = handler.error(err); // 触发失败态回调函数
      if (ret && ret.isPromise) {
        // 如果它返回的也是回调函数
        ret.queue = promise.queue; // 初始化它的内部队列
        this.promise = ret; // 赋值给内部的promise
        return;
      }
    }
  }
};

// 生成回调函数
Deferred.prototype.callback = function () {
  var that = this;
  return function (err, file) {
    if (err) {
      return that.reject(err);
    }
    that.resolve(file);
  };
};

// export {
//   Promise,
//   Deferred
// }
module.exports = {
  Promise,
  Deferred,
};
