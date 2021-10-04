### Promise/Deferred 标准

Promise/Deferred 模式在 2009 年时被 Kris Zyp 抽象为一个提议草案，发布在 CommonJS 规范中。随着使用 Promise/Deferred 模式的应用逐渐增多，CommonJS 草案目前已经抽象出了 Promises/A、Promises/B、Promises/D 这样典型的异步 Promise/Deferred 模型。

优点：在一定程度上缓解回调地狱的问题。

#### Promises/A

Promise/Deferred 模式其实包含两部分，即 Promise 和 Deferred。

Promises/A 提议对单个异步操作做出了这样的抽象定义，具体如下所示。

- Promise 操作只会处在 3 种状态的一种：未完成态、完成态和失败态。
- Promise 的状态只会出现从未完成态向完成态或失败态转化，不能逆反。完成态和失败态不能互相转化。

<!---->

- Promise 的状态一旦转化，将不能被更改。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0716ec9274d4d35823878ef122b6122~tplv-k3u1fbpfcp-zoom-1.image)

#### Promise/Deferred 内部实现

在 API 的定义上，Promises/A 提议是比较简单的。一个 Promise 对象只要具备 then()方法即可。但是对于 then()方法，有以下简单的要求。

- 接受完成态、错误态的回调方法。在操作完成或出现错误时，将会调用对应方法。
- 可选地支持 progress 事件回调作为第三个方法。

<!---->

- then()方法只接受 function 对象，其余对象将被忽略。
- then()方法继续返回 Promise 对象，以实现链式调用

为了演示 Promises/A 提议，这里我们尝试通过继承 Node 的 events 模块来完成一个简单的实现，相关代码如下：

```
var event = require('events')
var util = require('util')
var EventEmitter = event.EventEmitter

var Promise= function () {
  EventEmitter.call(this)
}
util.inherits(Promise, EventEmitter);

// 实现then方法
Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
  if(typeof fulfilledHandler === 'function') {
    this.once('success', fulfilledHandler);
  }
  if(typeof errorHandler === 'function') {
    this.once('error', errorHandler);
  }
  if(typeof progressHandler === 'function') {
    this.once('progress', progressHandler);
  }
  return this
}
```

这里看到 then()方法所做的事情是将回调函数存放起来。**为了完成整个流程，还需要触发执行这些回调函数的地方，实现这些功能的对象通常被称为 Deferred**，即延迟对象，示例代码如下：

```
// 定义Deferred构造函数
var Deferred = function () {
  this.state = 'unfulfilled';
  this.promise = new Promise();
}

Deferred.prototype.resolve = function (obj) {
  this.state = 'fulfilled';
  this.promise.emit('success', obj);
}

Deferred.prototype.reject = function (err) {
  this.state = 'failed';
  this.promise.emit('error', err);
}

Deferred.prototype.progress = function (data) {
  this.promise.emit('progress', data);
}
// commonjs标准导出的Promise和Deferred
module.exports = {
  Promise,
  Deferred
}
```

这里的状态和方法对应的关系如图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17252d83ae1c4fa3a1baa7871991958e~tplv-k3u1fbpfcp-zoom-1.image)

Promise 和 Deferred 的差别:

- Deferred 主要是用于内部，用于维护异步模型的状态；
- Promise 则作用于外部，通过 then()方法暴露给外部以添加自定义逻辑。

Promise 和 Deferred 的整体关系如图所示。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f0a46dbeb2c4edf8b4c5e5014b6ba74~tplv-k3u1fbpfcp-zoom-1.image)

**优点：**

与事件发布/订阅模式相比，Promise/Deferred 模式的 API 接口和抽象模型都十分简洁。

它将业务中不可变的部分封装在了 Deferred 中，将可变的部分交给了 Promise。

#### Promise/A+的 promise 的基本实现

到这一步，一个基本的符合 Promise/A+的 promise 的基本就实现了

// promise-base.js

```
var event = require('events')
var util = require('util')
var EventEmitter = event.EventEmitter

// 定义一个Promise构造函数，继承EventEmitter模块
var Promise= function () {
  EventEmitter.call(this)
}
util.inherits(Promise, EventEmitter);

// 实现then方法
Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
  if(typeof fulfilledHandler === 'function') {
    this.once('success', fulfilledHandler);
  }
  if(typeof errorHandler === 'function') {
    this.once('error', errorHandler);
  }
  if(typeof progressHandler === 'function') {
    this.once('progress', progressHandler);
  }
  return this
}

// 定义Deferred构造函数
var Deferred = function () {
	this.state = 'unfulfilled';
  this.promise = new Promise();
}

Deferred.prototype.resolve = function (obj) {
  this.state = 'fulfilled';
  this.promise.emit('success', obj);
}

Deferred.prototype.reject = function (err) {
  this.state = 'failed';
  this.promise.emit('error', err);
}

Deferred.prototype.progress = function (data) {
  this.promise.emit('progress', data);
}

// 生成回调函数
Deferred.prototype.callback = function () {
  var that = this
  return function (err, file) {
    if(err) {
      return that.reject(err);
    }
    that.resolve(file)
  }
};

module.exports = {
  Promise,
  Deferred
}
```

### Promise 中的多异步协作

#### 多异步并行流程

对于多次文件的读取场景，all 将两个单独的 Promise 重新抽象组合成一个新的 Promise，这里给出了一个简单的原型实现，相关代码如下：

// promise-all.js

```
var { Promise, Deferred } = require('./promise-base')

Deferred.prototype.all = function (promises) {
    var count = promises.length;
    var that = this;
    var results = [];
    promises.forEach(function(promise , i) {
        promise.then(function(data){
            count--;
            results[i] = data;
            if(count === 0){
                that.resolve(results);
            }
        }, function(err){
            that.reject(err);
        })
    });
    return this.promise
}

module.exports = {
  Promise,
  Deferred
}
```

这里通过 all()方法抽象多个异步操作。只有所有异步操作成功，这个异步操作才算成功，一旦其中一个异步操作失败，整个异步操作就失败。

// demo1.js

```
var { Deferred } = require('./promise-all')
var fs = require('fs')

var readFile = function(file, encoding) {
    var deferred = new Deferred()
    fs.readFile(file, encoding, deferred.callback())
    return deferred.promise
}

var promise1 = readFile('file1.txt', 'utf-8')
var promise2 = readFile('file2.txt', 'utf-8')

var deferred = new Deferred
deferred.all([promise1, promise2]).then(function(results){
    console.log(results)
}, function (err) {
    // error
})
```

运行 demo2，得到

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44147c87a47b44fd959f58a1f2935025~tplv-k3u1fbpfcp-zoom-1.image)

#### 异步调用的依赖处理

all()适合无依赖的异步串行执行，但当前一个的结果是后一个调用的输入时，all()方法就无法满足需求了。
这里针对这种场景 promise 提供了链式调用的写法。链式调用支持 promise 每一次返回新的 promise,响应结果作为回调函数函数传给新的 promsie。

要让 Promise 支持链式执行，主要通过以下两个步骤。

1. 将所有的回调都存到队列中。
2. Promise 完成时，逐个执行回调，一旦检测到返回了新的 Promise 对象，停止执行，然后将当前 Deferred 对象的 promise 引用改变为新的 Promise 对象，并将队列中余下的回调转交给它。

// promose-chain.js

```
var Promise = function () {
  // 队列用于存储待执行的回调函数
  this.queue = [];
  this.isPromise = true
}

// then()方法所做的事情是将回调函数存放起来。
Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
  var handler = {};
  if(typeof fulfilledHandler === 'function') {
    handler.fulfilled = fulfilledHandler
  }
  if(typeof errorHandler === 'function') {
    handler.error = errorHandler
  }
  this.queue.push(handler)
  return this
}

var Deferred = function () {
  this.promise = new Promise();
}

// 完成态
Deferred.prototype.resolve = function (obj) {
  var promise = this.promise;
  var handler;
  while ((handler = promise.queue.shift())) { // 从promsie队列中取出第一个元素，直到取不到为止
    if(handler && handler.fulfilled){
      var ret = handler.fulfilled(obj) // 触发完成态回调函数
      if(ret && ret.isPromise) { // 如果它返回的也是回调函数
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
    if(handler && handler.error){
      var ret = handler.error(err) // 触发失败态回调函数
      if(ret && ret.isPromise) {  // 如果它返回的也是回调函数
        ret.queue = promise.queue; // 初始化它的内部队列
        this.promise = ret; // 赋值给内部的promise
        return;
      }
    }
  }
};

// 生成回调函数
Deferred.prototype.callback = function () {
  var that = this
  return function (err, file) {
    if(err) {
      return that.reject(err);
    }
    that.resolve(file)
  }
};

module.exports = {
  Promise,
  Deferred
}
```

// demo2.js

```
var fs = require('fs');
// var smooth = require('./smooth');
var { Deferred } = require('./promise-chain')

var readFile = function(file, encoding) {
    var deferred = new Deferred()
    fs.readFile(file, encoding, deferred.callback())
    return deferred.promise
}

readFile('file1.txt', 'utf8').then(function(file1) {
    return readFile(file1.trim(), 'utf8');
}).then(function(file2) {
    console.log(file2)
})
```

运行 demo2 得到

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba2c5d9009854683b9d660808364f59c~tplv-k3u1fbpfcp-zoom-1.image)

运行结果如预期！

### 将 API Promise 化

这里仍然会发现，为了体验更好的 API，需要做较多的准备工作。这里提供了一个方法可以批量将方法 Promise 化，相关代码如下：

```
// smooth.js
const { Deferred } = require("./promise-chain")

var smooth = function (method) {
  return function () {
    var deferred = new Deferred()
    var args = Array.prototype.slice.call(arguments, 0) // 获取参数列表：数组的深拷贝（从0开始截取到数组结束的所有元素）
    args.push(deferred.callback()); // 构造参数，将deferred.callback作为回调函数（一般作为最后一个参数）
    method.apply(null, args) // 绑定到method
    return deferred.promise
  }
}

module.exports = smooth
```

如此我们便得到了一个简单的方法将以回调函数运行的异步方法 promsie 化

改写 demo2

```
// import { Deferred } from 'promise-chain'
var fs = require('fs');
var smooth = require('./smooth');
var { Deferred } = require('./promise-chain')

var readFile = smooth(fs.readFile)
readFile('file1.txt', 'utf8').then(function(file1) {
    return readFile(file1.trim(), 'utf8');
}).then(function(file2) {
    console.log(file2)
})
```

运行 demo2 得到

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba2c5d9009854683b9d660808364f59c~tplv-k3u1fbpfcp-zoom-1.image)

运行仍然如预期！

### 写在最后

本来先从 Promise/A+的标准的层面表述了一个 Promise 的抽象定义，即：

- Promise 操作只会处在 3 种状态的一种：未完成态、完成态和失败态
- Promise 的状态一旦转化，将不能被更改。。
- Promise 的状态只会出现从未完成态向完成态或失败态转化，不能逆反。完成态和失败态不能互相转化。

接着从 Promise 和 Deffered 两部分分别实现了对应部分的的内部原理，手写实现了一个基本的 promise。主要表述了
Promise/Deferred 模式其实包含两部分，即 Promise 和 Deferred。

- Deferred 主要是用于内部，主要是触发执行这些回调函数的地方，用于维护异步模型的状态；
- Promise 则作用于外部，then()方法所做的事情是将回调函数存放起来，通过 then()方法暴露给外部以添加自定义逻辑。

接着讨论了 Promise 中的多异步协作问题，分为两部分

1. 多异步并行流程
   Promsie 提供了 all 方法，处理多异步并行流程，只有所有异步操作成功，这个异步操作才算成功，一旦其中一个异步操作失败，整个异步操作就失败。基于 promise-base 实现了 promsie-all。对 promise 扩展实现了 all 方法，主要维护一个结果队列，当所有异步流程都成功时，将结果队列返回。

2. 多异步调用依赖处理  
   典型的异步处理场景中，有时会涉及到依赖关系的处理，当前一个的结果是后一个调用的输入时，promise 提供了链式调用的方式满足这种需求。

then()方法继续返回 Promise 对象，以实现链式调用。

- 在内部维护了一个回调队列，将所有的回调都存到队列中。
- Promise 完成时，逐个执行回调，一旦检测到返回了新的 Promise 对象，停止执行，然后将当前 Deferred 对象的 promise 引用改变为新的 Promise 对象，并将队列中余下的回调转交给它。

源码地址：[Promise](https://github.com/skique/Promise/tree/master/jstest/nodetest/Promise)，可以对照代码来学习本文内容，有用的话别忘了给个 star 呀～
