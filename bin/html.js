var BaseGenerator = require('../lib/basegenerator');
var htmlGenerator = require('../lib/htmlgenerator');
var domGenerator = require('../lib/domgenerator');
var template = require('../lib/template').template;
var statements = require('../tests/compiled/test_test');
var jsdom = require("jsdom").jsdom;
var serializeDocument = require("jsdom").serializeDocument;
var htmltidy = require('htmltidy').tidy;

template.add( statements.FILE_NAME, statements.template );

var printTree = function (tree) {
    var cache = [];
    console.log(JSON.stringify(tree, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return '#id=' + value.id;
            }
            cache.push(value);
        }

        return value;
    }, 2));

    cache = null;
}

var printHTML = function (data) {
    htmltidy(data, {indent: true},  function(err, html) {
        console.log(html);
    });
}


var watching = {};
var generator = new BaseGenerator({
    templateManager: template,
    watch: function (scope, deps, func) {
        if (deps) {
            deps.forEach(function (i) {
                watching[i] = watching[i]||[];
                watching[i].push(func);
            })
        }
    }
});

// var $scope = {
//     cal: {
//         mode: 'month',
//         prevMonth: function () { console.log('prevMonth happened!') },
//         nextMonth: function () { console.log('nextMonth happened!') },
//         cycleMode: function () { console.log('cycleMode happened!', arguments) },
//         setCurrentMonth: function () { console.log('setCurrentMonth happened!', arguments) },
//         setCurrentYear: function () { console.log('setCurrentMonth happened!', arguments) },
//         select: function () { console.log('select happened!', arguments) },
//         isSelected: function (d) { return d.format() === '12' },
//         isCurrent: function (d) { return d.format() === '22' },
//         isSameMonth: function (d) { return !d.s },
//         current: {
//             value: "1234",
//             format: function (fmt) {
//                 return this.value;
//             }
//         },
//         months: [
//             { format: function (fmt) { return 'Jan' } },
//             { format: function (fmt) { return 'Feb' } },
//             { format: function (fmt) { return 'Mar' } },
//             { format: function (fmt) { return 'Apr' } },
//             { format: function (fmt) { return 'May' } },
//             { format: function (fmt) { return 'Jun' } },
//             { format: function (fmt) { return 'Jul' } },
//             { format: function (fmt) { return 'Aug' } },
//             { format: function (fmt) { return 'Sep' } },
//             { format: function (fmt) { return 'Oct' } },
//             { format: function (fmt) { return 'Nov' } },
//             { format: function (fmt) { return 'Dec' } }
//         ],
//         weeks: [
//             { format: function (fmt) { return 'Mon' } },
//             { format: function (fmt) { return 'Tue' } },
//             { format: function (fmt) { return 'Wed' } },
//             { format: function (fmt) { return 'Thu' } },
//             { format: function (fmt) { return 'Fri' } },
//             { format: function (fmt) { return 'Sat' } },
//             { format: function (fmt) { return 'Sun' } }
//         ],
//         years: [
//             { format: function (fmt) { return '2014' } },
//             { format: function (fmt) { return '2015' } },
//             { format: function (fmt) { return '2016' } },
//         ],
//         calendar: [
//             [{ format: function (fmt) { return '1' } },
//              { format: function (fmt) { return '2' } },
//              { format: function (fmt) { return '3' } },
//              { format: function (fmt) { return '4' } },
//              { format: function (fmt) { return '5' } },
//              { format: function (fmt) { return '6' } },
//              { format: function (fmt) { return '7' } }],
//             [{ format: function (fmt) { return '8' } },
//              { format: function (fmt) { return '9' } },
//              { format: function (fmt) { return '10' } },
//              { format: function (fmt) { return '11' } },
//              { format: function (fmt) { return '12' } },
//              { format: function (fmt) { return '13' } },
//              { format: function (fmt) { return '14' } }],
//             [{ format: function (fmt) { return '15' } },
//              { format: function (fmt) { return '16' } },
//              { format: function (fmt) { return '17' } },
//              { format: function (fmt) { return '18' } },
//              { format: function (fmt) { return '19' } },
//              { format: function (fmt) { return '20' } },
//              { format: function (fmt) { return '21' } }],
//             [{ format: function (fmt) { return '22' } },
//              { format: function (fmt) { return '23' } },
//              { format: function (fmt) { return '24' } },
//              { format: function (fmt) { return '25' } },
//              { format: function (fmt) { return '26' } },
//              { format: function (fmt) { return '27' } },
//              { format: function (fmt) { return '28' } }],
//             [{ format: function (fmt) { return '29' } },
//              { format: function (fmt) { return '30' } },
//              { format: function (fmt) { return '31' } },
//              { format: function (fmt) { return '1' }, s:1 },
//              { format: function (fmt) { return '2' }, s:1 },
//              { format: function (fmt) { return '3' }, s:1 },
//              { format: function (fmt) { return '4' }, s:1 }],
//         ]
//     }
// }

var $scope = {
    test1: true,
    test2: true,
    test3: true
};

var el = template.get( statements.FILE_NAME )($scope, generator);

var setElements = function (el, els) {
    while(el.firstChild) el.removeChild(el.firstChild);
    while(els.length) el.appendChild(els.shift());
}

var doc = jsdom("<html><body></body></html>");
var window = doc.defaultView;
// printHTML(htmlGenerator(el));
// printTree(el);

var eee = domGenerator(el, window.document, function (xxx) {
    xxx(window.document.body);
});
setElements(window.document.body, eee);
printHTML(serializeDocument(doc));

$scope.test2 = false;
watching['test2'].forEach(function (i) {i()});
printHTML(serializeDocument(doc));

$scope.test1 = false;
watching['test1'].forEach(function (i) {i()});
printHTML(serializeDocument(doc));
