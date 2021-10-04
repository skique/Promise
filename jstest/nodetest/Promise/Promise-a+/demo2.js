/* 多异步流程协同 */
/* 2. 多异步流程顺序执行，下一个流程依赖上一个流程的返回结果 */
// import { Deferred } from 'promise-chain'
var fs = require("fs");
// var smooth = require('./smooth');
var { Deferred } = require("./promise-chain");

var readFile = function (file, encoding) {
  var deferred = new Deferred();
  fs.readFile(file, encoding, deferred.callback());
  return deferred.promise;
};

// var readFile = smooth(fs.readFile)
readFile("../file1.txt", "utf8")
  .then(function (file1) {
    console.log(file1);
    return readFile("../" + file1.trim(), "utf8");
  })
  .then(function (file2) {
    console.log(file2);
  });
