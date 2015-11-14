/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var JisonLex = require('jison-lex');
var fs = require('fs');

var grammar = fs.readFileSync('./lib/lexer.l', 'utf8');
var lexerSource = JisonLex.generate(grammar);
var lexer = new JisonLex(grammar);

if (!process.argv[2]) {
    throw 'No file provided!';
} else {
    var test = fs.readFileSync(process.argv[2], 'utf8');lexer.setInput(test + '\n');
    var data = [];
    while ((t = lexer.lex()) !== 1) {
        console.log(t, ":", lexer.yytext)
    }
}
