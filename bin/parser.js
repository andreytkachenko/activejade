/**
 * Created by tkachenko on 16.04.15.
 */
var parser = require("./dist/parser").parser;
parser.yy.$ = require("./lib/scope");

var fs = require("fs");

if (!process.argv[2]) {
    throw 'No file provided!';
} else {
    console.log(JSON.stringify(parser.parse(fs.readFileSync(process.argv[2], 'utf8') + '\n'), null, 4));
}
