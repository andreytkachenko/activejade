var compiler = require('./compiler.js');
var BaseGenerator = require('./basegenerator');
var HtmlGenerator = require('./htmlgenerator');
var fs = require('fs');

module.exports = {
    BaseGenerator: BaseGenerator,
    HtmlGenerator: HtmlGenerator,
    
    compile: function (source, options) {
        return compiler.compile(source, options.filename);
    },

    compileFile: function (filename, options) {
        return this._wrap([this.compile(this._readFile(filename), options)], options);
    },

    compileFiles: function (files, options) {
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
                var res = [];
                for (var i = 0; i < files.length; i++ ) {
                    res.push(options.callback_name + '("' + files[i] + '", ' + results[i] + ');');
                }
                return res.join('');
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
