var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Decorators', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('on click', function () {
        // var ctx = prepare(['test_decorators'], 'decorators');
        // var scope, tree, document;

        // it('default', function (done) {
        //     scope = { };
        //     tree = ctx.tpl(scope);

        //     document = createDocument();
        //     generateDOM(tree, document, {
        //         onchange: function (xxx) {
        //             xxx(document.body);
        //         }
        //     });

        //     expect(document.body.innerHTML).to.equal('<div> times</div><div><a href="#">Click Me</a></div>');

            
            
        // });
    });
});
