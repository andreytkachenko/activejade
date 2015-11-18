var compiler = require('../lib/compiler.js');
var fs = require('fs');

function compile_file(file_name, name, callback_name) {
    var source = fs.readFileSync(file_name, 'utf8');
    return compiler.compile(source, name, callback_name);
}

if (!process.argv[2] || !process.argv[3]) {
    throw 'No file provided!';
} else {
    var callback_name = process.argv[4] || 'template.add';
    var value = eval(process.argv[2]);
    var files = [];
    
    if (typeof value === 'string') {
        files.push(compile_file(value, value, callback_name));
    } else if (typeof value === 'object') {
        if (value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
                files.push(compile_file(value[i], value[i], callback_name));
            }
        } else {
            for (var i in value) {
                files.push(compile_file(value[i], i, callback_name));
            }
        }
    } else {
        throw new Error('No files provided');
    }
    
    fs.writeFile(process.argv[3], files.join(';'), function(err) {
        if(err) { return console.error(err); }
    }); 
}