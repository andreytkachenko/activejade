var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Extends', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('simple', function () {
        var ctx = prepare(['test_page-1', 'test_page-2', 'test_index-1', 'test_index-2'], 'extends');
        var tree, scope, document;

        it('static', function() {
            scope = { index: 'index-1' };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('<div> Main File\nPage 1\n</div>Page 1\nMain Content\nPage 1\nPage 1\nMain Content\n');

            scope.index = 'index-2';
            ctx.trigger('index');
            expect(generateHTML(tree)).to.equal('<div> Index 2\nPage 1\n</div>Page 1\nIndex 2\nPage 1\nPage 1\nIndex 2\n');
        });

        // it('dynamic', function() {
        //     scope = { test: false };
        //     tree = ctx.tpl(scope);
        //     document = createDocument();
        //
        //     generateDOM(tree, document, function (xxx) {
        //         xxx(document.body);
        //     });
        //
        //     expect(document.body.innerHTML).to.equal('<div> False\n</div><div><div> False\n</div></div>');
        //
        //     scope.test = true;
        //     tests.ctx.trigger('test');
        //     expect(document.body.innerHTML).to.equal('<div> True\n</div><div><div> True\n</div></div>');
        // });
    });
});
