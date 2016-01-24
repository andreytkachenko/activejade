var BaseGenerator = require('../lib/basegenerator');
var htmlGenerator = require('../lib/htmlgenerator');
var template = require('../lib/template').template;
// var htmltidy = require('htmltidy').tidy;

var generator = new BaseGenerator({
    templateManager: template
});

var compile = function (name, deps, callback, reject) {
    var files = [];
    if (deps) {
        deps.forEach(function (i) {
            files.push(i);
        })
    }

    files.push(name);
    var exe = fork('bin/activejade.js', ['-o', name+'.js'].concat(files));
    exe.on('exit', (code) => {
        if (!code)
            callback();
        else
            reject();
    });
    exe.on('uncaughtException', function (exception) {
      console.log(exception.stack);
    });
}

var load = function(name, deps) {
    var deffered = Promise.defer();

    compile(name, deps, function () {
        try {
            var tpls = require(name+'.js');
            var tpl_name;
            tpls.forEach(function (tpl) {
                template.add( tpl.FILE_NAME, tpl.TEMPLATE );
                if (~tpl.FILE_NAME.indexOf(name)) {
                    tpl_name = tpl.FILE_NAME;
                }
            });

            if (tpl_name) {
                deffered.resolve({file: tpl_name, name: name});
            } else {
                deffered.reject();
            }
        } catch (e) {
            console.log(e.stack);
            deffered.reject();
        }
    }, deffered.reject);

    return deffered.promise;
}

if (!process.argv[2]) {
    throw 'No file provided!';
} else {
    var scope = JSON.parse(process.argv[3] || '{}');
    load(process.argv[2]).then(function (p) {
        var tpl = template.get( p.file );
        var tree = tpl(scope, generator);
        console.log(htmlGenerator(tree));
    });
}
