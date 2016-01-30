var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Mixin', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('default', function () {
        var ctx = prepare(['test_mixin'], 'mixin');
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

            expect(generateHTML(tree)).to.equal('<div></div>');
            expect(document.body.innerHTML).to.equal('<div></div>');

            scope.test = [1,2,3];
            ctx.trigger('test');
            expect(generateHTML(tree))
                .to.equal('<div><div>1</div><div>1 Bob\n</div><div>1<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div></div>');
            expect(document.body.innerHTML)
                .to.equal('<div><div>1</div><div>1 Bob\n</div><div>1<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div></div>');

            scope.test = [4,3,2];
            ctx.trigger('test');
            expect(generateHTML(tree))
                .to.equal('<div><div>4</div><div>4 Bob\n</div><div>4<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div></div>');
            expect(document.body.innerHTML)
                .to.equal('<div><div>4</div><div>4 Bob\n</div><div>4<span> Bob\n</span></div><div>3</div><div>3 Bob\n</div><div>3<span> Bob\n</span></div><div>2</div><div>2 Bob\n</div><div>2<span> Bob\n</span></div></div>');
        });
    });
});
