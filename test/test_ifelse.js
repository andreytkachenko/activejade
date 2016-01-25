var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('IfElse', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('simple', function () {
        var ctx = prepare(['test_simple'], 'ifelse');
        var tree, scope, document;

        it('static', function() {
            scope = { test: false };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('<div> False\n</div><div><div> False\n</div></div>');

            scope.test = true;
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div> True\n</div><div><div> True\n</div></div>');
        });

        it('dynamic', function() {
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('<div> False\n</div><div><div> False\n</div></div>');

            scope.test = true;
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div> True\n</div><div><div> True\n</div></div>');
        });
    });

    describe('heavy', function () {
        var ctx = prepare(['test_heavy'], 'ifelse');
        var tree, scope;

        it('static', function() {
            scope = {
                test1: true,
                test2: true,
                test3: true
            };

            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_true"> Test2 True
</div><div id="test1_true-test2_true-test3_true"> Test3 True
</div>`);

            scope.test3 = false;
            ctx.trigger('test3');
            expect(generateHTML(tree)).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_true"> Test2 True
</div><div id="test1_true-test2_true-test3_false"> Test3 False
</div>`);

            scope.test2 = false;
            ctx.trigger('test2');
            expect(generateHTML(tree)).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_false"> Test2 False
</div><div id="test1_true-test2_false-test3_false"> Test3 False
</div>`);

            scope.test1 = false;
            ctx.trigger('test1');
            expect(generateHTML(tree)).to.equal(
`<div id="test1_false"> Test1 False
</div><div id="test1_false-test2_false"> Test2 False
</div><div id="test1_false-test2_false-test3_false"> Test3 False
</div>`);

        });

        it('dynamic', function() {
            scope = {
                test1: true,
                test2: true,
                test3: true
            };

            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            document.getElementById('test1_true').test1 = true;
            document.getElementById('test1_true-test2_true').test2 = true;

            expect(document.body.innerHTML).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_true"> Test2 True
</div><div id="test1_true-test2_true-test3_true"> Test3 True
</div>`);

            scope.test3 = false;
            ctx.trigger('test3');
            expect(document.body.innerHTML).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_true"> Test2 True
</div><div id="test1_true-test2_true-test3_false"> Test3 False
</div>`);

            expect(document.getElementById('test1_true-test2_true').test2).to.equal(true);

            scope.test2 = false;
            ctx.trigger('test2');
            expect(document.body.innerHTML).to.equal(
`<div id="test1_true"> Test1 True
</div><div id="test1_true-test2_false"> Test2 False
</div><div id="test1_true-test2_false-test3_false"> Test3 False
</div>`);

            expect(document.getElementById('test1_true').test1).to.equal(true);

            scope.test1 = false;
            ctx.trigger('test1');
            expect(document.body.innerHTML).to.equal(
`<div id="test1_false"> Test1 False
</div><div id="test1_false-test2_false"> Test2 False
</div><div id="test1_false-test2_false-test3_false"> Test3 False
</div>`);

        });
    });
});
