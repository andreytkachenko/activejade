var activejade = require('../../lib/index');
var fs = require('fs');
var jsdom = require("jsdom").jsdom;
var serializeDocument = require('jsdom').serializeDocument;

var self = {
    templates: {},
    printTree: function (tree) {
        var cache = [];
        return JSON.stringify(tree, function(key, value) {
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
        }, 2);
    },
    trigger: function (watching, name) {
        if (watching[name])
            watching[name].forEach(function (i) {i()});
    },
    createGenerator: function (watching) {
        return new activejade.BaseGenerator({
            templates: self.templates,
            watch: function (scope, deps, func) {
                if (deps) {
                    deps.forEach(function (i) {
                        watching[i] = watching[i] || [];
                        watching[i].push(func);
                    })
                }
            }
        })
    },
    loadTemplates: function (filenames) {
        filenames = filenames.map(function (filename) {
            return './test/jade/' + filename + '.jade';
        });

        eval(filenames.map(function (filename) {
            return 'this.templates["' + filename + '"]=' + activejade.compile(fs.readFileSync(filename, 'utf8'), {filename: filename});
        }).join(';'));

        return filenames;
    },
    prepare: function (templates, namespace) {
        var obj = {
            watching: {},
            trigger: function (name) {
                self.trigger(obj.watching, name);
            },

            tpl: function (scope) {
                var generator = self.createGenerator(obj.watching);
                var names = self.loadTemplates(templates.map(function (name) {
                    return namespace + '/' + name;
                }));

                obj.tpls = names.map(function (name) {
                    return self.templates[ name ];
                });

                return self.templates[ names[0] ](scope, generator);
            },
        };

        return obj;
    },
    createDocument: function () {
        var doc = jsdom("<html><body></body></html>");
        var window = doc.defaultView;
        window.document.__serialize = function () {
            return serializeDocument(doc);
        };

        return window.document;
    },
    generateHTML: activejade.generateHTML,
    generateDOM: activejade.generateDOM
};

module.exports = self;
