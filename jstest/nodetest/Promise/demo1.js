/* 多异步流程协同 */
/* 1. 多异步流程顺序执行，相互之间不相互依赖 */
var { Deferred } = require("./promise-all");
var fs = require("fs");
var smooth = require("./smooth");
// import { Promise, Deferred } from 'promise-all'

// 对于多次文件的读取场景，all将两个单独的Promise重新抽象组合成一个新的Promise
// var readFile = function(file, encoding) {
//     var deferred = new Deferred()
//     fs.readFile(file, encoding, deferred.callback())
//     return deferred.promise
// }
var readFile = smooth(fs.readFile);

var promise1 = readFile("file1.txt", "utf-8");
var promise2 = readFile("file2.txt", "utf-8");

var deferred = new Deferred();
deferred.all([promise1, promise2]).then(
  function (results) {
    console.log(results);
  },
  function (err) {
    // error
  }
);
