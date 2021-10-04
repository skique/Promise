Promise 是异步编程的一种解决方案，所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。
​

Promises 对单个异步操作做出了这样的抽象定义，具体如下所示。

- Promise 操作只会处在 3 种状态的一种：未完成态、完成态和失败态。
- Promise 的状态只会出现从未完成态向完成态或失败态转化，不能逆反。完成态和失败态不能互相转化。
- Promise 的状态一旦转化，将不能被更改。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633163325906-06ee8573-7424-4b4b-92ea-898a4e23a30e.png#clientId=ua40d57d8-589c-4&from=paste&height=190&id=uad254700&margin=%5Bobject%20Object%5D&name=image.png&originHeight=380&originWidth=472&originalType=binary&ratio=1&size=57868&status=done&style=none&taskId=uf90d1cd4-4496-4348-aea7-7961466a668&width=236)

### Promise 构造函数

Promise()使用一个简单的构造器界面来让用户方便地创建 Promise 对象：

```javascript
/* 需用户声明的执行器函数 */
executor = function(resolve, reject) {
    if(/*异步操作成功*/){
        resolve(data);
    }else {
        reject(err)
    }
}
/* 创建Promise对象的构造器 */
var promise = new Promise(executor）
```

Promise 构造函数接受⼀个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，由 JavaScript 引擎提供，不⽤⾃⼰部署。

- resolve 函数的作⽤是：Pending-->Resolved，成功时调⽤，并将异步操作的结果作为参数传递出去；
- reject 函数的作⽤是，Pending-->Rejected，失败时调⽤，并将异步操作报出的错误作为参数传递出去。

​

executor()是用户定义的执行器函数。当 JavaScript 引擎通过 new 运算来创建 promise 对象时，它事实上会在调用 executor()之前就创建好一个新的 promise 对象的实例，并且得到关联给该实例的两个置值器：resolve()与 reject()函数。
接下来，它会调用 executor()，并将 resolve()与 reject()作为入口参数传入，而 executor()函数会被执行直到退出。
​

​**executor()中的用户代码可以利用上述的两个置值器，来向 promise 对象“所代理的那个数据”置值**。亦即是说，为 promise 对象绑定（binding）值的过程是由用户代码触发的。这个过程看起来像是“让用户代码回调 JavaScript 引擎”。
例如：

```javascript
/* 用户通过代码（resolve或reject）来回调引擎以置值 */
new Promise(function (resolve, reject) {
  resolve(100);
});
```

最后需要补充的是，executor()函数中的 resolve()置值器可以接受任何值—除当前 promise 自身之外。当试图用自身来置值时，JavaScript 会抛出一个异常。
​

### Then 方法

Promise 实例⽣成以后，可以⽤ then ⽅法分别指定**Resolved 状态和 Rejected 状态的回调函数**。它的作用是为 Promise 实例添加状态改变后的需要执行的用户代码。

```javascript
promise.then(
  function (res) {
    console.log(res);
  },
  function (err) {
    console.log(err);
  }
);
```

### Promise 处理异步的核心

正上面例子中向 promise 传入的用户执行器函数直接调用了 resolve(100)，没有任何的异步逻辑，这样的代码也是成立的，因此 Promise 处理异步函数的原理并不是内置在 Promise 机制内的。

```javascript
/* 用户通过代码（resolve或reject）来回调引擎以置值 */
new Promise(function (resolve, reject) {
  resolve(100);
});
```

也就是说，Promise 机制中并没有延时，也没有被延时的行为，更没有对“时间”这个维度的控制。因此在 JavaScript 中创建一个 promise 时，创建过程是立即完成的；使用原型方法 promise.XXX 来得到一个新的 promise（即 promise2）时也是立即完成的。
​

同样类似于此的，所有 promise 对象都是在你需要时立即就生成的，重要的是，**这些 promise 所代理的那个值/数据还没有“就绪（Ready）”。这个就绪过程要推迟到“未知的将来”才会发生**。而一旦数据就绪，promise.then（foo）中的 foo 就会被触发了。
​

换句话说，Promise 处理异步逻辑的核心在于可以向 promise 构造器函数传入一个异步的执行器函数，一旦异步函数成功时调用 resolve 进行置值并响应结果通过 resolve 传给构造函数并保存在构造函数内部，失败时调用 reject 置值。结合 then 方法，promise 中传入的异步函数一旦成功返回，用户传入 Resolved 状态回调函数会被触发**。**
**​**

通过这种方式处理后，直观的表现为用户传入的异步函数可以并不要求立即生成返回值，换句话说用户不关心它的结果什么时候返回，只要求在它有值返回的时候调用 Resolved 状态的回调函数。
​

Promise 是一种可在语言层面实现并行执行的模型。它封装了一个“剥离了时间特性的数据”，并代理在该数据上的一切行为。由于该数据是剥离了时间特性的，因此施于它的行为也是没有时序意义、可并行的。
​

Promise 本身并不具有“并行执行”的特性，它的 promise 实例相当于是封装了数据的触发器：**当数据就绪（Ready）时，就触发指定行为（Actions）。而后者（行为或反应）**，才是真正的执行逻辑。
​

因此 Promise 语境下的 Hello World 程序的正确写法是：

```javascript
Promise.resolve("hello world") // data Ready ?
  .then((res) => console.log(res)); // call Action?
```

Promise 作为构造器，其作用是将一个**为 futurel 置值的函数**关联（resolving 或 binding）到具体的 promise 实例。
​

### 简易版 Promsie 实现

上面已经基本讲完了 Promise 的核心机制，Promise 内部保存了一个状态容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。
​

Promise 通常包含两部分，Promise 构造函数以及基于原型链实现的 then 方法。

- Promise 构造函数接受一个执行器函数，用户通过代码（resolve 或 reject）来回调引擎以置值。
- then 方法为 Promise 实例添加状态改变后的需要执行的用户代码 ResolveCallback 和 RejectCallback。

​

基于上面的讨论我们很模拟出基本的实现：

##### promsie 构造函数

1. Promise 构造函数接受 executor 作为执行器函数，通常这个 executor 里包裹了一个异步操作。
1. Promise 构造函数内部保存了 state 状态和 data 异步函数结果，以及定义了 resolve 置值函数和 reject 置值函数。
1. 调用 executor 并传入构造函数内部的 resolve 方法和 reject 方法作为函数实际参数。开始置值操作

##### then 方法

4. 当 Promise 的状态发生了改变，不论是成功或是失败都会调用 then 方法。它的作用是为 Promise 实例添加状态改变时的回调函数并在异步完成时执行这个函数。
5. then 方法被调用的时候，并不确定当前 promise 处于那个状态下，因为针对三种状态分别处理
   - 如果 state 已经变为了 fulfilled 状态，运行用户传入的 ResolveCallback
   - 如果 state 已经变为了 failed 状态，运行用户传入的 RejectCallback
   - 当执行 then 时候，异步函数可能还没有执行完成，此时 state 状态依然是 pending，这时要将回调函数保存起来，留待状态改变的时候执行。而状态的改变依赖用户传入的执行器函数，所以回到构造函数内部需要增加 ResolvedCallbacks 队列和 RejectedCallbacks 队列用以保存回调函数，并且在状态改变的时候需要手动调用对应的回调函数

​

分析完以后对应如下代码：

```javascript
// myPromise.js
function Promise(executor) {
  this.state = "pending";
  this.data = undefined;
  this.reason = undefined;
  this.resolvedCallbacks = [];
  this.rejectedCallbacks = [];
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
      for (let i = 0; i < self.rejectedCallbacks.length; i++) {
        self.rejectedCallbacks[i](reason);
      }
    }
  };
  try {
    // 向promise对象“所代理的那个数据”置值
    // 由用户传入的回调函数（接受resolve, reject参数）
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}
Promise.prototype.then = function (fn1, fn2) {
  var self = this;
  var promise2;

  // 首先对入参 fn1, fn2做判断
  fn1 = typeof fn1 === "function" ? fn1 : function (v) {};
  fn2 = typeof fn2 === "function" ? fn2 : function (r) {};

  if (self.state === "fulfilled") {
    // 把 fn1、fn2 放在 try catch 里面，毕竟 fn1、fn2 是用户传入的，报错嘛，很常见
    try {
      var x = fn1(self.data);
    } catch (e) {}
  }

  if (self.state === "rejected") {
    try {
      var x = fn2(self.data);
    } catch (e) {}
  }

  if (self.state === "pending") {
    // 当执行then时候，异步函数可能还没有执行完成，此时state状态依然是pending
    // 所以这步处理要将Resolved回调函数和Rejected回调函数保存
    self.resolvedCallbacks.push(function (value) {
      try {
        var x = fn1(self.data);
      } catch (e) {}
    });
    self.rejectedCallbacks.push(function (value) {
      try {
        var x = fn2(self.data);
      } catch (e) {}
    });
  }
};

module.exports = Promise;
```

至此，一个简易版的 promise 已经实现。
​

验证我们手写的 Promsie

```javascript
// mydemo.js
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
p.then(
  (res) => {
    console.log(res);
  },
  (e) => {
    console.log(e);
  }
);
```

运行结果如预期
![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633167479262-0b99c092-9f1c-403b-ac58-8d1a9c8e9c1d.png#clientId=ua40d57d8-589c-4&from=paste&height=40&id=u99f8ea15&margin=%5Bobject%20Object%5D&name=image.png&originHeight=80&originWidth=988&originalType=binary&ratio=1&size=19527&status=done&style=none&taskId=u738ee77f-3e9a-45bf-82fd-853f53748d0&width=494)

### 包含 then 链的 Promsie 实现

假设我们有一个场景是多异步相互依赖，后一个异步流程依赖于前一个异步流程，这里针对这种场景 promise 提供了链式调用的写法。链式调用支持 promise 每一次返回新的 promise，响应结果作为回调函数函数传给新的 promsie。
​

两个 promise 对象之间顺序执行的关系，在 JavaScript 中被称为“Then 链”。通过调用 p.then()的方式来约定当前 promise 对象与下一个 promise2 对象之间的“链”关系，并且这事实上也代表了它们之间的顺序执行关系，是 Promise 机制的基本用法和关键机制。
​

p.then()代表了对顺序逻辑的理解，同时它隐含地说明：promise2 与 promise 两者所代理的数据之间是有关联的。
​

因此从宏观的角度上来看，是“给 promise 绑定值”的行为（result ready）触发了 thenable 行为。所谓“thenable 行为”，就是调用“Then 链（thenable chain）”的后续 promise 置值器，并在整个链上触发连锁的“thenable 行为”。
​

最后，在 p.then()中，它主要完成了三件事：

- 创建新的 promise2 对象；并且，
- 登记 p 与 promise2 之间的关系；然后，
- 将 ResolvedCallbacks、RejectedCallbacks 关联给 promise2 的 resolve 置值器。

​

因此对上面实现的 promise 进行改造，主要是针对 then 中的处理，返回一个新的 promise 函数，回调函数成功调用并返回后进行置值处理。then 链的执行流程变成了如下：
​

完整代码如下

```javascript
// myPromise.js
function Promise(executor) {
  this.state = "pending";
  this.data = undefined;
  this.reason = undefined;
  this.resolvedCallbacks = [];
  this.rejectedCallbacks = [];
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
      for (let i = 0; i < self.rejectedCallbacks.length; i++) {
        self.rejectedCallbacks[i](reason);
      }
    }
  };
  try {
    // 向promise对象“所代理的那个数据”置值
    // 由用户传入的回调函数（接受resolve, reject参数）
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}
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
        // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
        resolve(x);
      } catch (e) {
        reject(e);
      }
    }));
  }

  if (self.state === "failed") {
    return (promise2 = new Promise(function (resolve, reject) {
      try {
        var x = fn2(self.data);
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
          resolve(x);
        } catch (e) {
          reject(e);
        }
      });
      self.rejectCallbacks.push(function (value) {
        try {
          var x = fn2(self.data);
          resolve(x);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }
};
```

验证 promsie 支持链式调用的特性。

```javascript
const Promise = require("./myPromise.js");

const p = new Promise(function (resolve, reject) {
  try {
    setTimeout(() => {
      resolve("我在1s后被执行");
    }, 1000);
  } catch (e) {
    reject(e);
  }
});

p.then((res) => {
  console.log("p1", res);
  return "回调结果成功";
}).then((res) => {
  console.log("p2", res);
});
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633315694139-fdc0ad94-f05e-4a80-867c-e9fbd5391a60.png#clientId=ua40d57d8-589c-4&from=paste&height=52&id=ub127c170&margin=%5Bobject%20Object%5D&name=image.png&originHeight=104&originWidth=872&originalType=binary&ratio=1&size=25117&status=done&style=none&taskId=u08539c44-9078-4f13-9d2e-29dee1917f8&width=436)

这里需要注意的是下一个 then 链返回的是上一个 then 链回调的结果，如果上一个 then 链回调没有返回值将会返回 undefined，即如果注视 p.then 中的回调中的 return 返回值，运行后将会返回
![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633316287302-978c1a19-e256-44cb-80b6-86c4266e3f6b.png#clientId=ua40d57d8-589c-4&from=paste&height=51&id=u74941211&margin=%5Bobject%20Object%5D&name=image.png&originHeight=102&originWidth=856&originalType=binary&ratio=1&size=22943&status=done&style=none&taskId=u5c16c0fc-e924-47f3-9491-52216231c80&width=428)

当 then 函数返回是一个 promise 时，上面的代码运行后会返回这个 promise 对象，
例如改造一下 mydemo.js：

```javascript
const Promise = require("./myPromise.js");

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
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633327884347-24661d86-f698-4704-83da-65ec064e2a31.png#clientId=u792a8af0-bafb-4&from=paste&height=153&id=u4f97420e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=306&originWidth=864&originalType=binary&ratio=1&size=66656&status=done&style=none&taskId=u61aeb3c7-4b93-4478-b1ac-591748e46bc&width=432)
为了得到预期的效果，需要对单独判断一下：

```javascript
// myPromise.js

...

Promise.prototype.then = function(fn1, fn2) {
    var self = this
    var promise2

    // 首先对入参 fn1, fn2做判断
    fn1 = typeof fn1 === 'function' ? fn1 : function(v) {}
    fn2 = typeof fn2 === 'function' ? fn2 : function(r) {}

    if (self.state === 'fulfilled') {
        return promise2 = new Promise(function(resolve, reject) {
            // 把 fn1、fn2 放在 try catch 里面，毕竟 fn1、fn2 是用户传入的，报错嘛，很常见
            try {
                var x = fn1(self.data)
                if (x instanceof Promise) {
                    // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                    x.then(res => resolve(res), (e) => reject(e))
                } else {
                    // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
                    resolve(x)
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    if (self.state === 'failed') {
        return promise2 = new Promise(function(resolve, reject) {
            try {
                var x = fn2(self.data)
                if (x instanceof Promise) {
                    // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                    x.then(res => resolve(res), (e) => reject(e))
                } else {
                    // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
                    resolve(x)
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    if (self.state === 'pending') {
        return promise2 = new Promise(function(resolve, reject) {
            self.resolvedCallbacks.push(function(value){
                try {
                    var x = fn1(self.data);
                    if (x instanceof Promise) {
                    	// 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                      x.then(res => resolve(res), (e) => reject(e))
                    } else {
                        // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
                        resolve(x)
                    }
                } catch (e) {
                    reject(e)
                }
            })
            self.rejectCallbacks.push(function(value) {
                try {
                    var x = fn2(self.data);
                    if (x instanceof Promise) {
                        // 如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                        x.then(res => resolve(res), (e) => reject(e))
                    } else {
                        // fn1 执行后，会有返回值，通过 resolve 注入到 then 返回的 promise 中
                        resolve(x)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
  }
```

运行 demo
![image.png](https://cdn.nlark.com/yuque/0/2021/png/638254/1633328020761-951edd77-e1f4-42f2-a89a-8d0e4e626726.png#clientId=u792a8af0-bafb-4&from=paste&height=54&id=u45ecab32&margin=%5Bobject%20Object%5D&name=image.png&originHeight=108&originWidth=828&originalType=binary&ratio=1&size=25988&status=done&style=none&taskId=u229ad826-6492-411a-a6b2-a570b1586bf&width=414)
