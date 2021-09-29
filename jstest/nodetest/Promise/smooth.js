const { Deferred } = require("./promise-chain");

var smooth = function (method) {
  return function () {
    var deferred = new Deferred();
    var args = Array.prototype.slice.call(arguments, 0); // 获取参数列表：数组的深拷贝（从0开始截取到数组结束的所有元素）
    args.push(deferred.callback()); // 构造参数，将deferred.callback作为回调函数（一般作为最后一个参数）
    method.apply(null, args); // 绑定到method
    return deferred.promise;
  };
};

module.exports = smooth;
