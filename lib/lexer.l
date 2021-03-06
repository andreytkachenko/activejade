%{
    var self = this,
        isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };

    if (!this._ctx) {
        this._ctx = {
            _indent: [0],
            _stack: [],
            _tokens: [],
            _quote: [],
            state: function () {
                return this._stack[this._stack.length - 1];
            },
            initial: function () {
                this._stack = [];
                this.conditionStack = ['INITIAL'];
            },
            replace: function (name, less) {
                this.leave();
                this.enter(name, less);
            },
            enter: function (name, less) {
                this._stack.push({
                    name: name,
                    cbc: 0
                });

                if (less !== undefined) {
                    self.less(less);
                }

                return self.begin(name);
            },
            leave: function (count, less) {
                var state = null;
                if (count === undefined) count = 1;
                while (count--) {
                    self.popState()
                    state = this._stack.pop();
                }

                if (less !== undefined) {
                    self.less(less);
                }

                return state;
            }
        };

        this._ctx._lex = this.lex;
        this.lex = function () {
            var tokens = this._ctx._tokens;
            if (tokens.length) return tokens.shift();
            var token = this._ctx._lex.call(this);
            if (isArray(token)) {
                this._ctx._tokens = this._ctx._tokens.concat(token);

                return this.lex();
            } else {
                return token;
            }
        }
    }

    function isExprNotEnd (token, number) {
        var result = true;
        var state = self._ctx.state().state
        var prevTok = state.prevTok;
        state.prevTok = token;

        if (state.invar) state.invar = false;

        var toks = ['REF', 'ID', 'NUM', 'STRING', 'NULL', 'TRUE', 'FALSE'];
        var brace = [')', ']', '}'];
        var internal = [',']

        if (token === '(') state.cbrace++;
        if (token === ')') state.cbrace--;
        if (token === '[') state.bbrace++;
        if (token === ']') state.bbrace--;
        if (token === '{') state.tbrace++;
        if (token === '}') state.tbrace--;

        if (state.cbrace < 0 || state.bbrace < 0 || state.tbrace < 0) {
            result = false;
        }

        if (token === 'VAR' || token === 'LET') {
            state.invar = true;
        }

        if (state.cbrace === 0 && state.bbrace === 0 && state.tbrace === 0) {
            if (
                ~toks.indexOf(prevTok) && ~toks.indexOf(token) ||
                ~brace.indexOf(prevTok) && ~toks.indexOf(token) ||
                prevTok === '}' && token === '(' ||
                ~toks.indexOf(prevTok) && token === '{' ||
                ~internal.indexOf(token)
            ) {
                result = false;
            }
        }

        if (!result) {
            ctx.leave(number, 0);
        }

        return result;
    }

    function inBraces() {
        var state = self._ctx.state().state

        return state.cbrace || state.bbrace || state.tbrace || state.invar;
    }

    function resetExpr() {
        self._ctx.state().state = {
            prevTok: undefined,
            cbrace: 0,
            bbrace: 0,
            tbrace: 0,
            invar: false
        }
    }

    var ctx = this._ctx;
%}

%options backtrack_lexer true

TAG                     [a-zA-Z][a-zA-Z0-9_:-]+[a-zA-Z0-9]|[a-zA-Z][a-zA-Z0-9]|[a-zA-Z]
CLASS                   [a-zA-Z_][a-zA-Z0-9_-]*
STRING                  \"|\'
NUM                     [0-9]
ID                      [$a-zA-Z_][$a-zA-Z0-9_]*
REF                     \#(?:[$a-zA-Z0-9_][$a-zA-Z0-9_-]*[$a-zA-Z_0-9_]|[$a-zA-Z_0-9_]+)
MIXINNAME               [$a-zA-Z_][$a-zA-Z0-9_-]*
WS                      [ \t]
EQUAL                   \=\=\=|\=\=|\>\>\>|\<\<\<|\!\=\=|\=\=|\!\=|\>\=|\<\=|\>\>|\<\<
ASSIGN                  \>\>\>\=|\<\<\<\=|\|\=|&\=|\+\=|\-\=|\*\=|\/\=|%\=|\>\>\=|\<\<\=|\^\=|\=
OPERATORS               \&\&|\|\||\+\+|\-\-|\.\.|[!~\[\]\(\)\{\},>.<+/*&%:?^|-]
NL                      (?![a-zA-Z0-9_$])

%s number string string-body text-block comment comment-line comment-block
%s simplestring simplestring-body
%s interp tag-interp tag-interp-body
%s expr expr-body
%s tag tag-attrs tag-body tag-and-attrs
%s for-each if-while
%s mixin mixin-args mixin-call
%s block include include-filter filter decorator
%s doctype except

%%

<interp>"#{"                ctx.enter('expr');yytext=true;return 'INTERP_EXPR_BEGIN';
<interp>"!{"                ctx.enter('expr');yytext=false;return 'INTERP_EXPR_BEGIN';
<interp>"}"                 ctx.leave();return 'INTERP_EXPR_END';
<interp>"#["                ctx.enter('tag-interp');return 'INTERP_TAG_BEGIN';
<interp>"]"                 ctx.leave();return 'INTERP_TAG_END';

<string>{STRING}            ctx._quote.unshift(yytext);ctx.enter('string-body');
<string-body>[^'"#!\n\]]*[^] {
                                var last = yytext.charAt(yyleng-1);
                                var quote = ctx._quote[0];
                                var preLast = yyleng > 0 ? yytext.charAt(yyleng-2) : quote;

                                switch (true) {
                                    default:
                                    case preLast === '\\':
                                        this.more();break;
                                    case last === '\n':
                                        ctx.leave(1, yyleng - 1);
                                        return 'STRING';
                                    case ctx._quote[0] === last:
                                        if (ctx._quote[0] === '"' || ctx._quote[0] === "'") {
                                            yytext = yytext.substr(0, yyleng - 1);
                                        } else if (ctx._quote[0]) {
                                            this.less(yyleng - 1);
                                        }
                                        ctx._quote.shift()
                                        ctx.leave(2);
                                        return 'STRING';
                                    case last === '#' || last === '!':
                                        var nextChar = this.input();
                                        this.unput(nextChar);

                                        if (nextChar === '{' || (last === '#' && nextChar === '[')) {
                                            this.unput(last);
                                            ctx.enter('interp');
                                            return 'STRING';
                                        } else {
                                            this.more();
                                        }
                                }
                            }

<simplestring>{STRING}    ctx._quote.unshift(yytext);ctx.enter('simplestring-body');
<simplestring-body>[^'"]*[^] {
                                var last = yytext.charAt(yyleng-1);
                                var quote = ctx._quote[0];
                                var preLast = yyleng > 0 ? yytext.charAt(yyleng-2) : quote;

                                switch (true) {
                                    default:
                                    case preLast === '\\':
                                        this.more();break;
                                    case ctx._quote[0] === last:
                                        yytext = yytext.substr(0, yyleng - 1);
                                        ctx._quote.shift()
                                        ctx.leave(2);
                                        return 'STRING';
                                }
                            }

<number>{NUM}+\.{NUM}+      ctx.leave();return 'NUMBER';
<number>{NUM}+              ctx.leave();return 'NUMBER';

<expr>[^]                   ctx.replace('expr-body', 0); resetExpr();

<expr-body>let{NL}          if (isExprNotEnd('LET')) return 'LET';
<expr-body>var{NL}          if (isExprNotEnd('VAR')) return 'VAR';
<expr-body>delete{NL}       if (isExprNotEnd('DELETE')) return 'DELETE';
<expr-body>in{NL}           if (isExprNotEnd('IN')) return 'IN';
<expr-body>typeof{NL}       if (isExprNotEnd('TYPEOF')) return 'TYPEOF';
<expr-body>new{NL}          if (isExprNotEnd('NEW')) return 'NEW';
<expr-body>instanceof{NL}   if (isExprNotEnd('INSTANCEOF')) return 'INSTANCEOF';
<expr-body>null{NL}         if (isExprNotEnd('NULL')) return 'NULL';
<expr-body>true{NL}         if (isExprNotEnd('TRUE')) return 'TRUE';
<expr-body>false{NL}        if (isExprNotEnd('FALSE')) return 'FALSE';
<expr-body>{REF}            if (isExprNotEnd('REF')) return 'REF';
<expr-body>{ID}             if (isExprNotEnd('ID')) return 'ID';
<expr-body>{NUM}            if (isExprNotEnd('NUMBER')) ctx.enter('number', 0);
<expr-body>{STRING}         if (isExprNotEnd('STRING')) ctx.enter('string', 0);
<expr-body>"?."             if (isExprNotEnd(yytext)) return yytext;
<expr-body>{EQUAL}          if (isExprNotEnd(yytext)) return yytext;
<expr-body>{ASSIGN}         if (isExprNotEnd(yytext)) return yytext;
<expr-body>\;               if (isExprNotEnd(yytext)) return yytext;
<expr-body>{OPERATORS}      if (isExprNotEnd(yytext)) return yytext;
<expr-body>\n               if (!inBraces()) ctx.leave(1, 0);

<text-block>\n{WS}*\n       this.unput('\n');
<text-block>\n{WS}*         {
                                var len = yyleng - 1,
                                    tokens = ['NEWLINE'];

                                if (len <= ctx._indent[0]) {
                                    ctx._block = undefined;
                                    ctx.leave(1, 0);
                                    ctx._noNewLine = true;
                                    tokens.push('DEDENT');
                                } else {
                                    ctx._quote.shift();
                                    ctx.enter('string-body', (ctx._block||len) + 1);
                                    if (ctx._block === undefined) {
                                        ctx._block = len;
                                        tokens.push('INDENT');
                                    }
                                }

                                if (tokens.length) return tokens;
                            }
<text-block>[^]             ctx.enter('string-body', 0);

<comment>\/\/\-|\/\/        ctx.leave(); ctx.enter('comment-block'); ctx.enter('comment-line'); yytext = yytext === '//-'; return 'COMMENT-TAG';
<comment-line>{WS}+         /* ignore */
<comment-line>[^\n]+        ctx.leave(); return 'COMMENT-LINE';
<comment-block>\n{WS}*\n    this.unput('\n');
<comment-block>\n{WS}*      {
                                var len = yyleng - 1,
                                    tokens = ['NEWLINE'];

                                if (ctx.inComment && len <= ctx._indent[0]) {
                                    ctx._block = undefined;
                                    ctx.leave(1, 0);
                                    ctx._noNewLine = true;
                                    ctx.inComment = false;
                                    tokens.push('DEDENT');
                                } else if (len > ctx._indent[0]) {
                                    ctx.inComment = true;
                                    ctx.enter('comment-line', (ctx._block||len) + 1);
                                    if (ctx._block === undefined) {
                                        ctx._block = len;
                                        tokens.push('INDENT');
                                    }
                                } else {
                                    ctx.leave(1, 1);
                                }

                                if (tokens.length) return tokens;
                            }
<comment-block>[^]          ctx.enter('comment-line', 0);

<mixin>"mixin"              return 'MIXIN';
<mixin>{MIXINNAME}          return 'MIXINNAME';
<mixin>"("                  ctx.enter('mixin-args', 0);
<mixin>\n                   ctx.leave(1, 0);
<mixin-args>"..."           return 'ELLIPSIS';
<mixin-args>"("             return '(';
<mixin-args>")"             ctx.leave(1); return ')';
<mixin-args>","             return ',';
<mixin-args>{ID}            return 'ID';

<mixin-call>{MIXINNAME}     return 'MIXINNAME';
<mixin-call>"("             ctx.enter('expr');return '(';
<mixin-call>")"             ctx.replace('tag-body');return ')';
<mixin-call>","             ctx.enter('expr');return ',';
<mixin-call>\n              ctx.leave(1,0);

<block>"block"              return 'BLOCK';
<block>"append"             return 'APPEND';
<block>"prepend"            return 'PREPEND';
<block>\n                   ctx.leave(1, 0);
<block>{ID}                 ctx.leave();return 'ID';

<for-each>"foreach"         return 'EACH';
<for-each>"for"             return 'EACH';
<for-each>"each"            return 'EACH';
<for-each>","               return ',';
<for-each>in{NL}            ctx.enter('expr');return 'IN';
<for-each>if{NL}            ctx.enter('expr');return 'IF';
<for-each>{ID}              return 'ID';
<for-each>\n                ctx.leave(1, 0);

<tag-attrs>\=|\!\=          ctx.enter('expr');yytext = yytext === '=';return 'EXPR_TAG';
<tag-attrs>"("              return '(';
<tag-attrs>")"              ctx.leave(); return ')';
<tag-attrs>","              return ',';
<tag-attrs>{TAG}            return 'ATTR';
<tag-attrs>\"{TAG}\"        return 'ATTR';
<tag-attrs>\'{TAG}\'        return 'ATTR';
<tag-attrs>{WS}+            /* ignore */
<tag-attrs>\n               /* ignore */

<tag-and-attrs>"("          ctx.enter('expr');return '(';
<tag-and-attrs>")"          ctx.leave();return ')';

<tag-interp-body,tag-body>\#{TAG}           yytext=yytext.substr(1);return 'TAG_ID';
<tag-interp-body,tag-body>\.{CLASS}         yytext=yytext.substr(1);return 'TAG_CLASS';
<tag-interp-body,tag-body>"("               ctx.enter('tag-attrs', 0);
<tag-interp-body,tag-body>"."               ctx.leave(2); ctx.enter('text-block'); return '.';
<tag-interp-body,tag-body>\=|\!\=           ctx.leave(2, 0);
<tag-interp-body,tag-body>\&attributes{NL}  ctx.enter('tag-and-attrs'); return 'ATTRIBUTES';
<tag-interp-body,tag-body>\:{NL}            ctx.leave(1); return ':';
<tag-interp-body,tag-body>\|                ctx._quote.unshift(null); ctx.enter('string-body');
<tag-interp-body,tag-body>\/                return '/';
<tag-body>\n                                ctx.leave(1, 0);
<tag-interp-body>[\]]                       ctx.leave(1, 0);
<tag-interp-body>[^\n]                      ctx._quote.unshift(']'); ctx.enter('string-body', 0);
<tag-body>[^]                               ctx._quote.unshift(null); ctx.enter('string-body', 0);

<tag>{TAG}                  ctx.enter('tag-body');return 'TAG';
<tag>\#{TAG}                ctx.enter('tag-body');yytext=yytext.substr(1);return 'TAG_ID';
<tag>\.{CLASS}              ctx.enter('tag-body');yytext=yytext.substr(1);return 'TAG_CLASS';
<tag-interp>{TAG}           ctx.enter('tag-interp-body');return 'TAG';
<tag-interp>\#{TAG}         ctx.enter('tag-interp-body');return 'TAG_ID';
<tag-interp>\.{CLASS}       ctx.enter('tag-interp-body');return 'TAG_CLASS';
<tag-interp>[\]]            ctx.leave(1, 0);
<tag>\n                     ctx.leave(1, 0);

<if-while>"if"              ctx.enter('expr');return 'IF';
<if-while>"unless"          ctx.enter('expr');return 'UNLESS';
<if-while>"when"            ctx.enter('expr');return 'WHEN';
<if-while>"case"            ctx.enter('expr');return 'CASE';
<if-while>"while"           ctx.enter('expr');return 'WHILE';
<if-while>else[ \t]*if      ctx.enter('expr');return ['ELSE', 'IF'];
<if-while>":"               ctx.leave(); return ':';
<if-while>\n                ctx.leave(1, 0);

<include>"include"          return 'INCLUDE';
<include>"with"             return 'WITH';
<include>"extend"           ctx.enter('expr'); return 'EXTEND';
<include>":"                ctx.enter('include-filter');return 'FILTER_TAG';
<include>{WS}+              /* ignore */
<include>\n                 ctx.leave(1, 0);
<include>[^]                ctx.enter('expr', 0);
<include-filter>{WS}+       /* ignore */
<include-filter>{ID}        ctx.leave();return 'ID';

<filter>{ID}                ctx.replace('text-block'); return 'ID';

<decorator>\@{ID}           yytext = yytext.substr(1); return 'DECORATOR_NAME';
<decorator>"("              ctx.enter('expr'); return '(';
<decorator>")"              return ')';
<decorator>","              ctx.enter('expr');return ',';
<decorator>{WS}+            /* ignore */
<decorator>\n               ctx.leave(1, 0);

<doctype>\n                 ctx.leave(1, 0);
<doctype>"doctype"          /* ignore */
<doctype>{WS}+              /* ignore */
<doctype>[^\n]+             return 'DOCTYPE';

<except>"wait"              return 'WAIT';
<except>"error"             return 'ERROR';
<except>"except"            return 'EXCEPT';
<except>{ID}                return 'ID';
<except>{WS}+               /* ignore */
<except>\n                  ctx.leave(1, 0);

<INITIAL>\n{WS}*\n          this.unput('\n');
<INITIAL>\n{WS}*            {
                                var indent = ctx._indent;
                                var tokens = ['NEWLINE'];

                                if (ctx._noNewLine) {
                                    tokens.pop();
                                    ctx._noNewLine = false;
                                }

                                yytext = '';
                                var len = yyleng - 1;

                                if (len > indent[0]) {
                                    indent.unshift(len);
                                    tokens.push("INDENT");
                                } else {
                                    while (len < indent[0]) {
                                        tokens.push("DEDENT");
                                        indent.shift();
                                    }
                                }

                                if (tokens.length) return tokens;
                            }

\/\/\-|\/\/                 ctx.enter('comment', 0);
\+                          ctx.enter('mixin-call'); return 'CALL'
\|{WS}+                     ctx.enter('string-body'); return 'TEXT_TAG'
\<                          ctx.enter('string-body', 0);
\-                          ctx.enter('expr'); return 'STATEMENT_TAG';
\=|\!\=                     ctx.enter('expr'); yytext = yytext === '='; return 'EXPR_TAG';
\:                          ctx.enter('filter'); return 'FILTER_TAG';
\@                          ctx.enter('decorator', 0);

doctype{NL}                 ctx.enter('doctype', 0);
mixin{NL}                   ctx.enter('mixin', 0);
block{NL}                   ctx.enter('block', 0);
superblock{NL}              return 'SUPERBLOCK';
append{NL}                  ctx.enter('block', 0);
prepend{NL}                 ctx.enter('block', 0);
(?:if|unless|while|else{WS}*if|when|case){NL}  ctx.enter("if-while", 0);
(?:for|each){NL}            ctx.enter("for-each", 0);
else{NL}                    return 'ELSE';
default{NL}                 return 'DEFAULT';
pass{NL}                    return 'PASS';
continue{NL}                return 'CONTINUE';
yield{NL}                   return 'YIELD';
break{NL}                   return 'BREAK';
(?:except|wait|error){NL}   ctx.enter('except', 0);
(?:extend|include){NL}      ctx.enter('include', 0);

{TAG}                       ctx.enter("tag", 0);
\#{TAG}                     ctx.enter("tag", 0);
\.{CLASS}                   ctx.enter("tag", 0);

<*>[ \t]+                   /* ignore */
<<EOF>>                     return Array(ctx._indent.length - 1).fill('DEDENT').concat(['EOF']);
%%
