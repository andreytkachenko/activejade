var expect = require('chai').expect;
var tests = require('./lib/tests');

describe('Tags', function() {
    var generateDOM = tests.generateDOM,
        generateHTML = tests.generateHTML,
        prepare = tests.prepare.bind(tests),
        createDocument = tests.createDocument;

    describe('tags', function () {
        var ctx = prepare(['test_tag'], 'tags');
        var scope, tree, document;

        it('default', function() {
            scope = {};
            tree = ctx.tpl(scope);
            expect(generateHTML(tree)).to.equal('\
<div></div><div id="id"></div><div class="class"></div><div attr="value"></div><div test="test"></div><div> Text\n\
</div><div><div></div></div><div>Text\n\
</div><div>Hi this is\n\
Few lines of text\n\
</div><div></div><div class="test1 test2 test3"></div>');
        });
    });

    describe('index page', function () {
        var ctx = prepare(['test_indexpage'], 'tags');
        var scope, tree, document;

        it('default', function() {
            scope = {};
            tree = ctx.tpl(scope);
            expect(generateHTML(tree)).to.equal('\
<!DOCTYPE html>\
<html>\
<head>\
<title>ActiveJade Examples</title>\
<script src="/js/app.js"></script>\
<script src="/js/view.js"></script>\
<link href="/css/main.css" rel="stylesheet">\
</head>\
<body><h1> Hello, World!\n\
</h1></body>\
</html>');
        });
    });
});
