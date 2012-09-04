var fs = require("fs");

exports.copyFileSync = function(input, output) {
  var buff = new Buffer(65536), pos = 0;
  var infd = fs.openSync(input, "r"), outfd = fs.openSync(output, "w");
  do {
    var read = fs.readSync(infd, buff, 0, 65536, pos);
    pos += read;
    fs.writeSync(outfd, buff, 0, read);
  } while (read);
  fs.closeSync(infd); fs.closeSync(outfd);
};

exports.exists = function(file, isDir) {
  try { return fs.statSync(file)[isDir ? "isDirectory" : "isFile"](); }
  catch(e) { return false; }
};
