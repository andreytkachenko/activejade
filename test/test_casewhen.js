var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('CaseWhen', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('default', function () {
        var ctx = prepare(['test_casewhen'], 'casewhen');
        var scope, tree, document;

        it('static', function () {
            scope = { test: [] };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('<div></div>');

            scope.test = [ 1 ];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div><span> One\n</span></div>');

            scope.test = [ 1, 1 ];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div><span> Two\n</span></div>');

            scope.test = [ 1, 1, 1, 1, 1 ];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div><span> Five or Six\n</span></div>');

            scope.test = [ 1, 1, 1, 1, 1, 1, 1, 1 ];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div><span> Others\n</span></div>');
        });

        it('dynamic', function() {
            scope = {test: []};
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('<div></div>');

            scope.test = [ 1 ];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div><span> One\n</span></div>');

            scope.test = [ 1, 1 ];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div><span> Two\n</span></div>');

            scope.test = [ 1, 1, 1, 1, 1 ];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div><span> Five or Six\n</span></div>');

            scope.test = [ 1, 1, 1, 1, 1, 1, 1, 1 ];
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div><span> Others\n</span></div>');
        });
    });
});
