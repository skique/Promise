var event = require("events");
var util = require("util");
var EventEmitter = event.EventEmitter;

// 定义一个Promise构造函数，继承EventEmitter模块
var Promise = function () {
  EventEmitter.call(this);
};
util.inherits(Promise, EventEmitter);

// 实现then方法
Promise.prototype.then = function (
  fulfilledHandler,
  errorHandler,
  progressHandler
) {
  if (typeof fulfilledHandler === "function") {
    this.once("success", fulfilledHandler);
  }
  if (typeof errorHandler === "function") {
    this.once("error", errorHandler);
  }
  if (typeof progressHandler === "function") {
    this.once("progress", progressHandler);
  }
  return this;
};

// 定义Deferred构造函数
var Deferred = function () {
  this.state = "unfulfilled";
  this.promise = new Promise();
};

Deferred.prototype.resolve = function (obj) {
  this.state = "fulfilled";
  this.promise.emit("success", obj);
};

Deferred.prototype.reject = function (err) {
  this.state = "failed";
  this.promise.emit("error", err);
};

Deferred.prototype.progress = function (data) {
  this.promise.emit("progress", data);
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

// export  {
//   Promise,
//   Deferred
// }
module.exports = {
  Promise,
  Deferred,
};
