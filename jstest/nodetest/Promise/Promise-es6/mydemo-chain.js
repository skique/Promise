const Promise = require("./PromisePlus.js");
var fs = require("fs");

const p1 = (file) => {
  return new Promise(function (resolve, reject) {
    try {
      fs.readFile(file, "utf-8", (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    } catch (e) {
      reject(e);
    }
  });
};

p1("../file1.txt")
  .then((res) => {
    console.log(res);
    return p1("../" + res.trim());
  })
  .then((res) => {
    console.log(res);
  });
