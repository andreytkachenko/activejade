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

            scope = { test: defer.promise };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
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
            var deferred = Q.defer();

            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
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

    describe('for in', function () {
        var ctx = prepare(['test_forin'], 'promises');
        var scope, tree, document;

        it('static', function( done ) {
            var deferred = Q.defer();

            scope = { test: false };
            tree = ctx.tpl(scope);

            expect(generateHTML(tree)).to.equal('<h1 id="x2"> No records\n</h1>');

            scope.test = deferred.promise;
            ctx.trigger('test');

            expect(generateHTML(tree)).to.equal('');

            deferred.resolve([1,2,3,4]);
            setTimeout(function () {
                expect(generateHTML(tree))
                    .to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1><div id="x3">1</div><div id="x3">3</div>');
                done();
            }, 0);
        });

        it('dynamic', function() {
            var deferred = Q.defer();

            scope = { test: false };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
            });

            expect(document.body.innerHTML).to.equal('<h1 id="x2"> No records\n</h1>');

            scope.test = deferred.promise;
            ctx.trigger('test');

            expect(document.body.innerHTML).to.equal('');

            deferred.resolve([1,2,3,4]);
            setTimeout(function () {
                expect(document.body.innerHTML)
                    .to.equal('<h1 id="x1"> Hello, this is a for-in test\n</h1><div id="x3">1</div><div id="x3">3</div>');
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

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
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

    describe('except', function () {
        var ctx = prepare(['test_except', 'test_except_include'], 'promises');
        var scope, tree, document;

        it('resolve', function(done) {
            var test_defer = Q.defer();
            var incl_defer = Q.defer();

            scope = { test: false, incl: incl_defer.promise };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
            });

            expect(generateHTML(tree)).to.equal('<div id="if"> False\n</div><div class="for-else"> For Else\n</div><div id="include-wait"> Include Wait\n</div>');
            expect(document.body.innerHTML).to.equal('<div id="if"> False\n</div><div class="for-else"> For Else\n</div><div id="include-wait"> Include Wait\n</div>');

            scope.test = test_defer.promise;
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div id="if-wait"> If Waiting...\n</div><div id="for-wait"> For Waiting...\n</div><div id="include-wait"> Include Wait\n</div>');
            expect(document.body.innerHTML).to.equal('<div id="if-wait"> If Waiting...\n</div><div id="for-wait"> For Waiting...\n</div><div id="include-wait"> Include Wait\n</div>');

            test_defer.resolve([ 1,2,3 ]);
            setTimeout(function () {
                expect(generateHTML(tree)).to.equal('<div id="if"> True\n</div><div class="for">1</div><div class="for">2</div><div class="for">3</div><div class="while">1</div><div class="while">2</div><div class="while">3</div><div id="include-wait"> Include Wait\n</div>');
                expect(document.body.innerHTML).to.equal('<div id="if"> True\n</div><div class="for">1</div><div class="for">2</div><div class="for">3</div><div class="while">1</div><div class="while">2</div><div class="while">3</div><div id="include-wait"> Include Wait\n</div>');

                incl_defer.resolve('test_except_include.jade');
                setTimeout(function () {
                    expect(generateHTML(tree)).to.equal('<div id="if"> True\n</div><div class="for">1</div><div class="for">2</div><div class="for">3</div><div class="while">1</div><div class="while">2</div><div class="while">3</div><a> Include Content\n</a>');
                    expect(document.body.innerHTML).to.equal('<div id="if"> True\n</div><div class="for">1</div><div class="for">2</div><div class="for">3</div><div class="while">1</div><div class="while">2</div><div class="while">3</div><a> Include Content\n</a>');
                    done();
                }, 0);
            }, 0);
        });

        it('reject', function(done) {
            var test_defer = Q.defer();
            var incl_defer = Q.defer();

            scope = { test: false, incl: incl_defer.promise };
            tree = ctx.tpl(scope);
            document = createDocument();

            generateDOM(tree, document, {
                onchange: function (xxx) {
                    xxx(document.body);
                }
            });

            expect(generateHTML(tree)).to.equal('<div id="if"> False\n</div><div class="for-else"> For Else\n</div><div id="include-wait"> Include Wait\n</div>');
            expect(document.body.innerHTML).to.equal('<div id="if"> False\n</div><div class="for-else"> For Else\n</div><div id="include-wait"> Include Wait\n</div>');

            scope.test = test_defer.promise;
            ctx.trigger('test');
            expect(generateHTML(tree)).to.equal('<div id="if-wait"> If Waiting...\n</div><div id="for-wait"> For Waiting...\n</div><div id="include-wait"> Include Wait\n</div>');
            expect(document.body.innerHTML).to.equal('<div id="if-wait"> If Waiting...\n</div><div id="for-wait"> For Waiting...\n</div><div id="include-wait"> Include Wait\n</div>');

            test_defer.reject('Oops');
            setTimeout(function () {
                expect(generateHTML(tree)).to.equal('<div id="if-error"> If Error!\n</div><div id="while-error"> While Error\n</div><div id="include-wait"> Include Wait\n</div>');
                expect(document.body.innerHTML).to.equal('<div id="if-error"> If Error!\n</div><div id="while-error"> While Error\n</div><div id="include-wait"> Include Wait\n</div>');

                incl_defer.reject('Oops');

                setTimeout(function () {
                    expect(generateHTML(tree)).to.equal('<div id="if-error"> If Error!\n</div><div id="while-error"> While Error\n</div><div id="include-error"> Include Error\n</div>');
                    expect(document.body.innerHTML).to.equal('<div id="if-error"> If Error!\n</div><div id="while-error"> While Error\n</div><div id="include-error"> Include Error\n</div>');
                    done();
                }, 0);
            }, 0);
        });
    });
    describe('multicall', function () {
        var ctx = prepare(['test_multicall'], 'promises');

        it('default', function(done) {
            var defer1 = Q.defer();
            var defer2 = Q.defer();

            var scope = {
                ttt: 0,
                test1: 5,
                test2: function () {
                    return scope.ttt++;
                },
                test3: defer1.promise
            }

            var tree = ctx.tpl(scope);
            expect(generateHTML(tree)).to.equal('<div></div>');

            defer1.resolve(function () {return defer2.promise});
            setTimeout(function() {
                expect(generateHTML(tree)).to.equal('<div></div>');
                defer2.resolve(7);
                setTimeout(function() {
                    expect(generateHTML(tree)).to.equal('<div>12</div>');
                    done();
                }, 0);
            }, 0);
        });
    });
});
