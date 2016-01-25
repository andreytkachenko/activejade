var expect = require('chai').expect;
var tests = require('./lib/tests');
var Q = require('q');

describe('Promises', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('async', function () {
        var ctx = prepare(['test_async'], 'promises');
        var scope, tree, document;

        it('default', function(done) {
            var defer = Q.defer();
            scope = { teste: defer.promise };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML)
                .to.equal('<div></div><div></div>');

            defer.resolve({
                'test.com': 'www.test.com',
                'example.ru': 'www.example.ru'
            });

            setTimeout(function () {
                expect(document.body.innerHTML)
                    .to.equal('<div><span> Test ready!\n</span></div><div><a href="test.com">www.test.com</a><a href="example.ru">www.example.ru</a></div>');
                done();
            }, 0);
        });
    });

    describe('if else', function () {
        var ctx = prepare(['test_ifelse'], 'promises');
        var scope, tree, document;

        it('default', function(done) {
            var deferred = Promise.defer();
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('<div> False\n</div><div><div> False\n</div></div>');

            scope.test = deferred.promise;
            ctx.trigger('test');
            expect(document.body.innerHTML).to.equal('<div></div>');

            deferred.resolve(true);
            setTimeout(function () {
                expect(document.body.innerHTML).to.equal('<div> True\n</div><div><div> True\n</div></div>');
                done();
            }, 0);
        });
    });

    describe('references', function () {
        var ctx = prepare(['test_reference'], 'promises');
        var scope, tree, document;

        it('default', function(done) {
            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();
            global.document = document;

            generateDOM(tree, document, function (xxx) {
                xxx(document.body);
            });

            expect(document.body.innerHTML).to.equal('<div id="main">Hello\n\
</div><div id="test"> Hi\n\
</div>');

            scope.test = true;
            ctx.trigger('test');
            setTimeout(function () {
                expect(document.body.innerHTML).to.equal(
                    '<div id="main">Hello\n, World! Hi\n</div><div id="test"> Hi\n</div>');
                done();
            }, 0);
        });
    });
});
