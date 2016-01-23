var compiler = require('./compiler.js');
var fs = require('fs');

module.exports = {
    compile: function (source, options) {
        return this._wrap([compiler.compile(source, options.filename)], [options.filename], options).shift();
    },

    compileFile: function (filename, options) {
        return this.compile(this._readFile(filename), options);
    },

    compileFIles: function (files, options) {
        var sources, self = this;
        if (files instanceof Array) {
            sources = files.map(function (file) {
                return compiler.compile(self._readFile(file), file);
            });

            return this._wrap(sources, files, options);
        }
    },
    /** Private Methods **/
    _readFile: function (filename) {
        return fs.readFileSync(filename, 'utf8');
    },
    _wrap: function (results, files, options) {
        switch (options.type) {
            default:
            case 'none':
                return results;
            case 'callback':
                return options.callback_name + '(["' + files.join('","') + '"],[' + results.join(',') + ']);';
            case 'custom':
                return options.prcess(files, result);
            case 'common':
                var tpls = [];
                for (var i = 0; i < files.length; i++) {
                    tpls.push('{FILE_NAME:"'+files[i]+'",TEMPLATE:'+results[i]+'}')
                }
                return 'module.exports=[' + tpls.join(',') + ']';
        }
    }
};
