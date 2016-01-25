var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Expressions', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('expr interpolation', function () {
        var ctx = prepare(['test_interp_expr'], 'expressions');
        var scope, tree, document;

        it('static', function() {
            scope = { test: '<b>Hi</b>' };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('\
before <b>Hi</b> after \n\
before&gt;b&lt;Hi&gt;/b&lt;after\n\
<b>Hi</b> after\n\
before <b>Hi</b>\n');

        });

        it('dynamic', function() {
            scope = { test: '<b>Hi</b>' };
            tree = ctx.tpl(scope);
            document = createDocument();
            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('\
before <b>Hi</b> after \n\
before&gt;b&lt;Hi&gt;/b&lt;after\n\
<b>Hi</b> after\n\
before <b>Hi</b>\n');

            scope.test = '<i>Hello</i>';
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('\
before <i>Hello</i> after \n\
before&gt;i&lt;Hello&gt;/i&lt;after\n\
<i>Hello</i> after\n\
before <i>Hello</i>\n')
        });
    });

    describe('method expr', function () {
        var ctx = prepare(['test_method'], 'expressions');
        var scope, tree, document;

        it('default', function() {
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(generateHTML(tree)).to.equal('<div>false</div>');
            expect(document.body.innerHTML).to.equal('<div>false</div>');

            scope.test = [1,2,3];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div>1,2,3</div>');
            expect(document.body.innerHTML).to.equal('<div>1,2,3</div>');
        });

    });

//     describe('tag interpolation', function () {
//         var ctx = prepare(['test_interpolation']);
//         var scope = {
//             test: '<b>Hi</b>'
//         };
//
//         var tree = ctx.tpl(scope);
//         var html;
//         var dom = tests.generateDOM(tree, window.document, function (xxx) {
//             xxx(window.document.body);
//         });
//
//         it('default', function() {
//             html = generateHTML(tree);
//             expect(html).to.equal('\
// before <b>Hi</b> after \n\
// before&gt;b&lt;Hi&gt;/b&lt;after\n\
// <b>Hi</b> after\n\
// before <b>Hi</b>\n')
//         });
//     });
});
