var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Decorators', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('index page', function () {
        // var ctx = prepare(['test_interp_expr'], 'decorators');
        // var scope, tree, document;
        //
        // it('default', function() {
        //     scope = {};
        //     tree = ctx.tpl(scope);
        //
        //     expect('\
        //     <!DOCTYPE html>\
        //     <html>\
        //     <head>\
        //     <title>ActiveJade Examples</title>\
        //     <script src="/js/app.js"></script>\
        //     <script src="/js/view.js"></script>\
        //     <link href="/css/main.css" rel="stylesheet">\
        //     </head>\
        //     <body><h1> Hello, World!\n\
        //     </h1></body>\
        //     </html>', generateHTML(tree));
        // });
    });
});
