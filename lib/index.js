var compiler = require('./compiler.js');

exports.compile = function (source, options) {
    return compiler.compile(source, options.filename, 'template.add');
};