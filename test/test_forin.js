var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('ForIn', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('for in', function () {
        var ctx = prepare(['test_forin'], 'loops');
        var scope, tree, document;

        it('static', function() {
            scope = { test: false };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('<h1 id="x2"> No records\n</h1>');

            scope.test = [];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1>');

            scope.test = [1,2,3,4];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1><div id="x3">1</div><div id="x3">3</div>');
        });

        it('dynamic', function() {
            scope.test = false;
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('<h1 id="x2"> No records\n</h1>');

            scope.test = [];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1>');

            scope.test = [1,2,3,4];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1><div id="x3">1</div><div id="x3">3</div>');
        });
    });
});
