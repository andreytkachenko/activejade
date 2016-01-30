var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Include', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('default', function () {
        var ctx = prepare(['test_include', 'main', 'test1'], 'include');
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

            expect(generateHTML(tree)).to.equal('<div id="root"><h1> Hello, World!\n</h1></div>');
            expect(document.body.innerHTML).to.equal('<div id="root"><h1> Hello, World!\n</h1></div>');

            scope.test = [1,2,3];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div id="root"><h1> Hello, World!\n</h1><div>1</div><div>2</div><div>3</div></div>');
            expect(document.body.innerHTML).to.equal('<div id="root"><h1> Hello, World!\n</h1><div>1</div><div>2</div><div>3</div></div>');

            scope.test = [3,2,1];
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div id="root"><h1> Hello, World!\n</h1><div>3</div><div>2</div><div>1</div></div>');
            expect(document.body.innerHTML).to.equal('<div id="root"><h1> Hello, World!\n</h1><div>3</div><div>2</div><div>1</div></div>');
        });
    });
});
