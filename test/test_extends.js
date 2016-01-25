var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Extends', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('simple', function () {
        // var ctx = prepare(['test_simple'], 'extends');
        // var tree, scope, document;
        //
        // it('static', function() {
        //     scope = { test: false };
        //     tree = ctx.tpl(scope);
        //
        //     expect(generateHTML(tree)).to.equal('<div> False\n</div><div><div> False\n</div></div>');
        //
        //     scope.test = true;
        //     tests.ctx.trigger('test');
        //     expect(generateHTML(tree)).to.equal('<div> True\n</div><div><div> True\n</div></div>');
        // });
        //
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
