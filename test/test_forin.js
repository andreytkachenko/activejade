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
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
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

    describe('with else', function () {
        var ctx = prepare(['test_forin_else'], 'loops');
        var scope, tree, document;

        it('default', function() {
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
            });

            expect(generateHTML(tree)).to.equal('<div> No Items\n</div>');
            expect(document.body.innerHTML).to.equal('<div> No Items\n</div>');

            scope.test = [1,2,3];
            ctx.trigger('test');
            expect(generateHTML(tree))
                .to.equal('<div>1</div><div>2</div><div>3</div>');
            expect(document.body.innerHTML)
                .to.equal('<div>1</div><div>2</div><div>3</div>');

            scope.test = [4,3,2];
            ctx.trigger('test');
            expect(generateHTML(tree))
                .to.equal('<div>4</div><div>3</div><div>2</div>');
            expect(document.body.innerHTML)
                .to.equal('<div>4</div><div>3</div><div>2</div>');
        });
    });
});
