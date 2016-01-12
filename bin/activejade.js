var Parser = require('commandline-parser').Parser;
var compiler = require('../lib/compiler.js');
var fs = require('fs');

var parser = new Parser({
	name : "activejade",
	desc : 'Compile Jade templates to javascript templates',
    arguments : {
        generate: {
    		desc : 'Generate file type ("common", "amd" or "callback") default is "common"',
            flags: ['generate', 'g'],
            optional : true
        },
        callback: {
            desc : 'Callback name for generation type "callback"',
            flags: ['callback', 'c'],
            optional: true
        },
        output: {
            desc : 'Output file name',
            flags: ['output', 'o'],
            optional: false
        }
    }
});

parser.exec();

var context = {
    type: parser.get('generate') || "common",
    callback: parser.get('callback'),
    output: parser.get('output'),
    input: parser.getArguments().slice(1)
}

if (!context.output) {
    throw new Error('Output parameter is missing!');
}

if (!context.input.length) {
    throw new Error('No input files!');
}

if (!~['callback', 'common', 'amd'].indexOf(context.type)) {
    throw new Error('Unknown generation type "' + context.type + '"!');
}

if (context.type === "callback" && !context.callback) {
    throw new Error('Callback is missing for callback type!');
}

function compile_files(input) {
    var files = [];
    for (var i = 0; i < input.length; i++) {
        var source = fs.readFileSync(input[i], 'utf8');
        files.push( compiler.compile(source, input[i], context.type, context.callback) );
    }

    return files;
}

fs.writeFile(context.output, compile_files(context.input).join(';'), function(err) {
    if(err) {
        return console.error(err);
    }
});
