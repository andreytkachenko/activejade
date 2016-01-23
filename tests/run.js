var BaseGenerator = require('../lib/basegenerator');
var htmlGenerator = require('../lib/htmlgenerator');
var domGenerator = require('../lib/domgenerator');
var template = require('../lib/template').template;
var jsdom = require("jsdom").jsdom;
var serializeDocument = require("jsdom").serializeDocument;
var htmltidy = require('htmltidy').tidy;
var fork = require('child_process').fork;
var Q = require('q');

var printTree = function (tree) {
    var cache = [];
    console.log(JSON.stringify(tree, function(key, value) {
        if (key === '_cache' || key === '$') {
            return undefined;
        }
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return '#id=' + value.id;
            }
            cache.push(value);
        }

        return value;
    }, 2));

    cache = null;
}

var watching = {};
var generator = new BaseGenerator({
    templateManager: template,
    watch: function (scope, deps, func) {
        if (deps) {
            deps.forEach(function (i) {
                watching[i] = watching[i]||[];
                watching[i].push(func);
            })
        }
    }
});

var compile = function (name, deps, callback, reject) {
    var files = [];
    if (deps) {
        deps.forEach(function (i) {
            files.push('./tests/'+ i);
        })
    }
    files.push('./tests/'+name+'.jade');
    var exe = fork('bin/activejade.js', ['-o', './tests/compiled/'+name+'.js'].concat(files));
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
            var tpls = require('../tests/compiled/' + name);
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

var setElements = function (el, els) {
    while(el.firstChild) el.removeChild(el.firstChild);
    while(els.length) el.appendChild(els.shift());
}

var trigger = function (name) {
    if (watching[name])
        watching[name].forEach(function (i) {i()});
}

var wrap = function (value) {
    return '<html><head></head><body>' + value + '</body></html>';
}

var assert = function (expected, actual) {
    if (expected !== actual) {
        console.log('--------Error:--------\n');
        console.log(expected, '\n');
        console.log(actual, '\n');
        console.log('----------------------');
    }
}

var context = {
    test_method: function (scope, tpl) {
        scope.test = false;
        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<div>false</div>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [1,2,3];
        trigger('test');
        assert('<div>1,2,3</div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },
    test_mixin: function (scope, tpl) {
        scope.test = false;
        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<div></div>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [1,2,3];
        trigger('test');
        assert('<div><div>1</div><div>1 Bob\n</div><div>1<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div></div>',
                htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [4,3,2];
        trigger('test');
        assert('<div><div>4</div><div>4 Bob\n</div><div>4<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div></div>',
                htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },

    test_include: function (scope, tpl) {
        scope.test = false;
        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<div id="root"></div>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [1,2,3];
        trigger('test');
        assert('<div id="root"><div>1</div><div>2</div><div>3</div></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [3,2,1];
        trigger('test');
        assert('<div id="root"><div>3</div><div>2</div><div>1</div></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },

    test_casewhen: function (scope, tpl) {
        scope.test = [];

        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<div></div>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [ 1 ];
        trigger('test');
        assert('<div><span> One\n</span></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [ 1, 1 ];
        trigger('test');
        assert('<div><span> Two\n</span></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [ 1, 1, 1, 1, 1 ];
        trigger('test');
        assert('<div><span> Five or Six\n</span></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [ 1, 1, 1, 1, 1, 1, 1, 1 ];
        trigger('test');
        assert('<div><span> Others\n</span></div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },

    test_while: function (scope, tpl) {
        scope.test = false;
        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<h1 id="x2"> No records\n</h1>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [];
        trigger('test');
        assert('<h1 id="x1"> Hello, this is a while test\n</h1>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [1,2,3,4];
        trigger('test');
        assert('<h1 id="x1"> Hello, this is a while test\n</h1><div id="x3">1</div><div id="x3">3</div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },

    test_forin: function (scope, tpl) {
        scope.test = false;
        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert('<h1 id="x2"> No records\n</h1>', htmlGenerator(tree));
        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [];
        trigger('test');
        assert('<h1 id="x1"> Hello, this is a for-in test\n</h1>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));

        scope.test = [1,2,3,4];
        trigger('test');
        assert('<h1 id="x1"> Hello, this is a for-in test\n</h1><div id="x3">1</div><div id="x3">3</div>', htmlGenerator(tree));
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },

    test_ifelse: function (scope, tpl) {
        scope.test1 = true;
        scope.test2 = true;
        scope.test3 = true;

        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        assert(`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_true"> Test2 True
</div><div id="test1_true-test2_true-test3_true"> Test3 True
</div>`, htmlGenerator(tree));

        setElements(window.document.body, eee);
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
        window.document.getElementById('test1_true').test1 = true;
        window.document.getElementById('test1_true-test2_true').test2 = true;

        scope.test3 = false;
        trigger('test3');
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
        assert(window.document.getElementById('test1_true-test2_true').test2, true);

        scope.test2 = false;
        trigger('test2');
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
        assert(window.document.getElementById('test1_true').test1, true);

        scope.test1 = false;
        trigger('test1');
        assert(wrap(htmlGenerator(tree)), serializeDocument(doc));
    },
    test_reference: function (scope, tpl) {
        scope.test = false;

        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;
        global.document = window.document;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        setElements(window.document.body, eee);

        assert('<html><head></head><body><div id="main">Hello\n\
</div><div id="test"> Hi\n\
</div></body></html>', serializeDocument(doc));

        scope.test = true;
        trigger('test');
        setTimeout(function () {
            assert(
                '<html><head></head><body><div id="main">Hello\n, World! Hi\n</div><div id="test">Hi</div></body></html>',
                serializeDocument(doc));
        }, 0);
    },
    test_async: function (scope, tpl) {
        var defer = Q.defer();

        scope.test = defer.promise;

        var tree = tpl(scope, generator);

        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;

        var eee = domGenerator(tree, window.document, function (xxx) {
            xxx(window.document.body);
        });

        setElements(window.document.body, eee);

        assert(
            '<html><head></head><body><div></div><div></div></body></html>',
            serializeDocument(doc));

        defer.resolve({
            'test.com': 'www.test.com',
            'example.ru': 'www.example.ru'
        });
        setTimeout(function () {
            assert(
                '<html><head></head><body><div><span> Test ready!\n</span></div><div><a href="test.com">www.test.com</a><a href="example.ru">www.example.ru</a></div></body></html>',
                serializeDocument(doc));
        }, 0);
    }
};

Promise.all([
    load('test_method'),
    load('test_ifelse'),
    load('test_while'),
    load('test_forin'),
    load('test_include', ['include/test1.jade']),
    load('test_casewhen'),
    load('test_mixin'),
    load('test_reference'),
    load('test_async'),
]).then(function (data) {
    data.forEach(function (p) {
        watching = {};
        try {
            context[p.name]({}, template.get( p.file ));
        } catch (e) {
            console.log(e.stack);
        }
        console.log('testing ', p.name);
    })
}, function (err) {
    console.log(err);
});
