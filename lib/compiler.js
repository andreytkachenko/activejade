/**
 * Created by tkachenko on 16.04.15.
 */

var util = require("util");

var parser = require("../dist/parser").parser;
parser.yy.$ = require("./scope");

function __wrap_p(value) {
    var id = __gen_id();

    return '(_ct[' + id + ']===undefined?d.__p(' + id + ',_ct,' + value + '):_ct[' + id + '])'
}

var Compiler = function (parser) {
    this.parser = parser;
};

Compiler.prototype = {
    compile: function (source, name) {
        var runtime = 'var _id=function(){return (_id._c||(_id._c=1))&&_id._c++;}';
        var val = this.walkTags(this.parser.parse(source + '\n'), 0);
        var items = [];
        var ids = [];
        for (var i = 0; i < val.values.length; i++) {
            items.push(val.values[i][1]);
            ids.push(val.values[i][0]);
        }

        return util.format(
                        'function(s,d){'+runtime+';var n_0,__FILE__="%s";%s;n_0=d.generate([n_%s],__FILE__);return n_0;}',
                        name, items.join(''), ids.join(',n_'));
    },

    walkNode: function (node, notwrap) {
        if (!this['walk' + node.type]) {
            console.dir(node);
            throw new Error('Unknown ' + node.type);
        }
        var res = this['walk' + node.type].apply(this, arguments);
            res.value = (!res.writable || notwrap) ? res.value : __wrap_p(res.value);

        return res;
    },

    walkTags: function (nodes, parent) {
        var value = [];
        var deps = [];
        var mutable = [];
        var code = [];
        var data;

        for (var i = 0; i < nodes.length; i++) {
            data = this.walkNode(nodes[i], parent);
            value.push(data);
        }

        return {
            values: value,
            deps: deps,
            code: code,
            mutable: mutable
        };
    },

    walkList: function (nodes) {
        var value = [],
            code = [],
            deps = [],
            mut = [],
            data;

        for (var i = 0; i < nodes.length; i++) {
            data = this.walkNode(nodes[i]);
            value.push(data.value);
            code.push(data.code);
            deps = deps.concat(data.deps);
            mut = mut.concat(data.mutable);
        }

        return {
            values: value,
            code: code,
            mutable: mut,
            deps: deps
        };
    },

    /** Expressions **/

    walkString: function (node) {
        return {
            value: '"' + node.value.replace('\n', '\\n').replace('"', '\\"') + '"',
            code: '"' + node.value.replace('\n', '\\n').replace('"', '\\"') + '"',
            deps: [],
            mutable: []
        };
    },

    walkStringArray: function (node) {
        var deps = [],
            mutable = [],
            array = [],
            tmp,
            tmpArray = [];

        for (var i = 0; i < node.nodes.length; i++) {
            tmp = this.walkNode(node.nodes[i]);

            if (tmp.deps.length) {
                if (tmpArray.length) {
                    array.push('"' + tmpArray.join('') + '"');
                    tmpArray = [];
                }

                deps = deps.concat(tmp.deps);
                mutable = mutable.concat(tmp.mutable);
                array.push(tmp.value);
            } else {
                tmpArray.push(tmp.value.slice(1, tmp.value.length - 1));
            }
        }

        if (tmpArray.length)
            array.push('"' + tmpArray.join('') + '"');

        return {
            value: array.length > 1 ? '[' + array.join(', ') + '].join("")' : array[0],
            code: array.join('+'),
            deps: deps,
            mutable: mutable
        };
    },

    walkIdentifier: function (node) {
        var excluded = ~['this', 'JSON', 'Date', 'decondeURIComponent', 'encodeURIComponent',
                        'Promise'].indexOf(node.id);

        return {
            value: excluded ? node.id : 's.' + node.id,
            code: node.id,
            writable: excluded ? false : true,
            parent: excluded ? undefined : 's',
            deps: [ node.id ],
            mutable: []
        };
    },

    walkReference: function (node) {
        return {
            value: __wrap_p('d.__id(\'' + node.id + '\')'),
            code: '#'+node.id,
            deps: [],
            mutable: []
        };
    },

    walkLiteral: function (node) {
        return {
            value: node.value,
            code: node.value,
            deps: [],
            mutable: []
        };
    },

    walkPropertyOp: function (node) {
        var object = this.walkNode(node.object);
        var value;

        if (node.safe) {
            value = '(' + object.value + '||{}).' + node.property;
        } else {
            value = object.value + '.' + node.property;
        }

        return {
            value: value,
            code: object.code + '.' + node.property,
            deps: object.deps.concat([object.code + '.' + node.property]),
            mutable: object.mutable,
            parent: object.value,
            writable: true
        };
    },

    walkIndexOp: function (node) {
        var index = this.walkNode(node.index);
        var expr = this.walkNode(node.expr);

        return {
            value: '(' + expr.value + ')[' + index.value + ']',
            code: '(' + expr.code + ')[' + index.code + ']',
            deps: index.deps.concat(expr.deps, ['(' + expr.code + ')[' + index.code + ']']),
            mutable: index.mutable.concat(expr.mutable),
            parent: expr.value,
            writable: true
        };
    },

    walkSliceOp: function (node) {
        var vals = this.walkList([node.expr, node.from, node.to]);

        return {
            value: '(' + vals.values[0] + ').slice(' + vals.values[1] + ', ' + vals.values[2] + ')',
            code: vals.code[0] + '[' + vals.code[1] + ':' + vals.code[2] + ']',
            mutable: vals.mutable,
            parent: vals.values[0],
            deps: vals.deps
        };
    },

    walkConditionOp: function (node) {
        var cond = this.walkNode(node.cond);
        var onTrue = this.walkNode(node.onTrue);
        var onFalse = this.walkNode(node.onFalse);

        return {
            value: cond.value + '?' + onTrue.value + ':' + onFalse.value,
            code: cond.code + '?' + onTrue.code + ':' + onFalse.code,
            deps: cond.deps.concat(onTrue.deps).concat(onFalse.deps),
            mutable: cond.mutable.concat(onTrue.mutable).concat(onFalse.mutable),
        };
    },

    walkCallExpression: function (node) {
        var callee = this.walkNode(node.callee);
        var args = this.walkList(node.args);

        return {
            value: __wrap_p('(' + callee.value + ').call('+[callee.parent||'null'].concat(args.values).join(',') + ')'),
            code: callee.code + '(' + args.code.join(', ') + ')',
            deps: callee.deps.concat(args.deps),
            mutable: callee.mutable.concat(args.mutable)
        };
    },

    walkUnaryExpression: function (node) {
        var expr, node_expr = node.left || node.right;
        var space = node.operator === 'new' ? ' ' : '';
        var value, code;

        if (node.operator === '++' ||
            node.operator === '--') {

            expr = this.walkNode(node_expr, true);
        } else {
            expr = this.walkNode(node_expr);
        }

        if (node.left) {
            value = node.operator + space + expr.value;
            code = node.operator + space + expr.value;
        } else {
            value = expr.value + node.operator;
            code = expr.value + node.operator;
        }

        return {
            value: value,
            code: code,
            deps: expr.deps.concat([value]),
            mutable: expr.mutable.concat([value])
        };
    },

    walkBinaryExpression: function (node) {
        var left = this.walkNode(node.left);
        var right = this.walkNode(node.right);
        var value = left.value + ' ' + node.operator + ' ' + right.value;

        if (node.operator === '..') {
            value = 'd.util.range(' + left.value + ', ' + right.value + ')';
        }

        return {
            value: value,
            code: left.code + ' ' + node.operator + ' ' + right.code,
            deps: left.deps.concat(right.deps),
            mutable: left.mutable.concat(right.mutable),
        };
    },

    walkArrayExpression: function (node) {
        var elems = this.walkList(node.elements);

        return {
            value: '[' + elems.values.join(', ') + ']',
            code: '[' + elems.code.join(', ') + ']',
            deps: elems.deps,
            mutable: elems.mutable,
        };
    },

    walkObjectExpression: function (node) {
        var elems = this.walkList(node.properties);

        return {
            value: '{' + elems.values.join(', ') + '}',
            code: '{' + elems.code.join(', ') + '}',
            deps: elems.deps,
            mutable: elems.mutable
        };
    },

    walkObjectProperty: function (node) {
        var expr = this.walkNode(node.expr);

        return {
            value: '"' + node.id + '":' + expr.value,
            code: '"' + node.id + '": ' + expr.code,
            deps: expr.deps,
            mutable: expr.mutable
        };
    },

    walkAssignmentExpression: function (node) {
        var value,
            left = this.walkNode(node.left, true),
            right = this.walkNode(node.right);

        if (!left.writable) {
            throw new Error('Syntax Error: Left side is not writable!');
        }

        if (node.operator === '=') {
            value = left.value + node.operator + right.value;
        } else {
            value = left.value + '=' + __wrap_p(left.value) + node.operator.substr(0, node.operator.length-1) + right.value
        }

        return {
            value: value,
            code: left.code + ' ' + node.operator + ' ' + right.code,
            deps: left.deps.concat(right.deps),
            mutable: left.mutable.concat(right.mutable).concat([ left.value ])
        };
    },

    walkStatement: function (node, parent_id) {
        var id = __gen_id();
        var expr = this.walkNode(node.expr);
        var expr_js = expr.value;
            expr_js = __wrap(expr.value);
        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("statement",[s,%s,%s,[%s]]);', id, parent_js, expr_js, __deps(expr.deps))];
    },

    walkVariableStatement: function (node) {
        var declarations = this.walkList(node.declarations);

        return {
            value: declarations.values.join(';') + ';',
            code: declarations.code.join(';'),
            deps: declarations.deps
        };
    },

    walkVariableDeclaration: function (node) {
        var init = node.init ? this.walkNode(node.init) : null;

        return {
            value: 's.' + node.id + '=' + (init ? init.value : 'undefined'),
            code: 'var ' + node.id + (init ? ' = ' + init.value : ''),
            deps: init ? init.deps : []
        };
    },

    walkExpressionStatement: function (node) {
        var data = this.walkNode(node.expr);
        if (node.escape) {
            return {
                value: 'd.util.escape(' + data.value + ')',
                code: data.code,
                deps: data.deps
            };
        } else {
            return data;
        }
    },

    /** Loops **/

    walkWhile: function (node, parent_id) {
        var id = __gen_id();
        var expr = this.walkNode(node.expr);
        var block_js = __wrap_children(this.walkTags(node.block, id));
        var except_js = node.except ? this.walkExcept(node.except, id) : 'null';
        var expr_js = expr.deps.length ? __wrap(expr.value) : expr.value;
        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("dowhile",[s,%s,%s,%s,%s,[%s]]);', id, parent_js, block_js, expr_js, except_js, __deps(expr.deps))];
    },

    walkForInIf: function (node, parent_id) {
        var id = __gen_id();
        var key = node.key;
        var value = node.value;
        var block_js = __wrap_children(this.walkTags(node.block, id));
        var else_js = node.onFalse ? __wrap_children(this.walkTags(node.onFalse, id)) : 'null';
        var except_js = node.except ? this.walkExcept(node.except, id) : 'null';

        var expr = this.walkNode(node.expr);
        var expr_js = expr.deps.length ? __wrap(expr.value) : expr.value;
        var cond_js = 'true';

        if (node.cond) {
            var cond =  this.walkNode(node.cond);

            if (cond.deps.length) {
                cond_js = __wrap(cond.value);
            } else {
                cond_js = cond.value;
            }
        }

        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("forin",[s,%s,%s,%s,"%s","%s",%s,%s,%s,[%s]]);',
                    id, parent_js, block_js, expr_js, value, key, cond_js, else_js, except_js,__deps(expr.deps))];
    },

    /** Branching **/

    walkIfElse: function (node, parent_id) {
        var id = __gen_id();
        var cond = this.walkNode(node.cond);
        var onTrue = this.walkTags(node.onTrue, id);
        var except_js = node.except ? this.walkExcept(node.except, id) : 'null';
        var onFalse = null;
        var except = null;

        if (node.onFalse) {
            if (node.onFalse instanceof Array) {
                onFalse = this.walkTags(node.onFalse, id);
            } else {
                onFalse = this.walkTags([node.onFalse], id);
            }
        }

        var cond_js = cond.value;

        if (cond.deps.length) {
            cond_js = __wrap(cond.value);
        }

        var parent_js = __wrap_f('n_' + parent_id);
        var onTrue_js = __wrap_children(onTrue);

        var children = [onTrue_js];

        if (onFalse) {
            var onFalse_js = __wrap_children(onFalse);
            children.push(onFalse_js);
        }

        var children_js = '[' + children.join(',') + ']';

        return [id, util.format('var n_%d=d.next("ifelse",[s,%s,%s,%s,%s,[%s]]);', id, parent_js, children_js, cond_js, except_js, __deps(cond.deps))];
    },

    walkCase: function (node, parent_id) {
        var id = __gen_id();
        var expr = this.walkNode(node.expr);
        var except_js = node.except ? this.walkExcept(node.except, id) : 'null';
        var children_js = [];
        var exprs = [], tcase, texpr;
        var parent_js = __wrap_f('n_' + parent_id);
        var default_idx = null;
        var deps = expr.deps;

        expr_value = expr.deps ? __wrap(expr.value) : expr.value;

        for (var i = 0; i < node.cases.length; i++) {
            tcase = node.cases[i];
            texpr = tcase.when ? this.walkNode(tcase.when) : null;

            if (texpr) {
                exprs.push(util.format('{c:%d,e:%s}', children_js.length, texpr.deps.length ? __wrap(texpr.value) : texpr.value));
                deps = deps.concat(texpr.deps);
            } else {
                default_idx = children_js.length;
            }

            if (tcase.block) {
                var tags = this.walkTags(tcase.block, id);
                children_js.push(__wrap_children(tags));
            }
        }

        return [
            id,
            util.format('var n_%d=d.next("casewhen",[s,%s,[%s],[%s],%s,%s,%s,[%s]]);',
                id, parent_js, children_js.join(','), exprs.join(','), expr_value, default_idx, except_js, __deps(deps))
        ];
    },

    /** Include **/

    walkInclude: function (node, parent_id) {
        var id = __gen_id();
        var href = this.walkNode(node.href);
        var withExpr = node.with ? this.walkNode(node.with) : null;
        var except_js = node.except ? this.walkExcept(node.except, id) : 'null';
        var href_js = href.value;
        var with_js = withExpr ? withExpr.value : 'null';

        if (href.deps.length) {
            href_js = __wrap(href.value);
        }

        if (withExpr && withExpr.deps.length) {
            with_js = __wrap(with_js);
        }

        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("include",[s,%s,%s,%s,%s,__FILE__,[%s]]);', id, parent_js, href_js, with_js, except_js,__deps(href.deps))];
    },

    /** Comments **/

    walkComment: function () {
        throw new Error('unimplemented!');
    },

    walkCommentLine: function () {
        throw new Error('unimplemented!');
    },

    /** Filter **/

    walkFilter: function (node, parent_id) {
        throw new Error('unimplemented!');
    },

    /** Blocks **/

    walkExtend: function (node) {
        var id = __gen_id();
        var href = this.walkNode(node.href);
        var href_js = href.value;

        if (href.deps.length) {
            href_js = __wrap(href.value);
        }

        return [id, util.format('var n_%d=d.next("extend",[s,%s,__FILE__,[%s]]);', id, href_js, __deps(href.deps))];
    },

    walkBlock: function (node, parent_id) {
        var id = __gen_id();
        var block = node.block ? this.walkTags(node.block, id) : null;
        var children_js = __wrap_children(block);
        var root_js = node.root ? 'true' : 'false';

        return [id, util.format('var n_%d=d.next("block",[s,"%s","%s",%s, %s,__FILE__]);', id, node.id, node.embed, children_js, root_js)];
    },

    walkSuperBlock: function (node, parent_id) {
        var id = __gen_id();
        return [id, util.format('var n_%d=d.next("superblock",[s]);', id)];
    },

    /** Mixins **/

    walkMixin: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_' + parent_id);

        var block = this.walkTags(node.block, id);
        var children_js = __wrap_children(block);

        var args = [];
        var ellipsis = node.args.ellipsis ? '"' + node.args.ellipsis + '"' : null;

        for (var i = 0; i < node.args.args.length; i++) {
            args.push('"' + node.args.args[i].id + '"');
        }

        return [id, util.format('var n_%d=d.next("mixin",[s,%s,%s,"%s",[%s],%s]);', id, parent_js, children_js, node.id, args.join(','), ellipsis)];
    },

    walkMixinCall: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_' + parent_id);

        var args = this.walkList(node.args);
        var attrs = node.attrs ? this.walkNode(node.attrs) : {value: '{}', deps: []};
        var decors = node.decorators ? this.walkList(node.decorators, id) : null;

        var block = node.block ? this.walkTags(node.block, id) : null;
        var children_js = block ? __wrap_children(block) : '[]';
        var decors_js = decors ? decors.values.join(',') : 'null';
        var args_js = args.values.join(',');

        return [id, util.format('var n_%d=d.next("mixincall",[s,%s,%s,"%s",[%s],%s,%s,[%s]]);',
                    id, parent_js, children_js, node.id, args_js, attrs.value, decors_js , __deps(attrs.deps))];
    },

    walkMixinCallArgument: function (node) {
        var expr = this.walkNode(node.expr);
        var expr_js = expr.deps.length ? __wrap(expr.value) : expr.value;

        return {
            value: util.format('{id:"%s",expr:%s,deps:[%s]}', node.id || '', expr_js, __deps(expr.deps)),
            deps: expr.deps
        };
    },

    walkMixinYield: function (node, parent_id) {
        throw new Error('unimplemented!');
    },

    walkMixinBlock: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("mixinblock",[s,%s]);', id, parent_js)];
    },

    /** Doctype **/

    walkDoctype: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("doctype",[s,%s,"%s"]);', id, parent_js, node.doctype)];
    },

    /** Text and Tags **/

    walkText: function (node, parent_id) {
        var id = __gen_id();
        var value = this.walkNode(node.text);
        var value_js = value.value;
        if (value.deps.length) {
            value_js = __wrap(value.value);
        }
        var parent_js = __wrap_f('n_' + parent_id);

        return [id, util.format('var n_%d=d.next("text",[s,%s,%s,[%s]]);', id, parent_js, value_js, __deps(value.deps))];
    },

    walkTag: function (node, parent_id) {
        var id = __gen_id();
        var tags = node.block ? this.walkTags(node.block, id) : null;
        var attrs = this.walkNode(node.attrs);
        var decors = node.decorators ? this.walkList(node.decorators, id) : null;

        var children_js = __wrap_children(tags);
        var parent_js = __wrap_f('n_' + parent_id);
        var decors_js = decors ? decors.values.join(',') : '';
        var tag_js = node.tag ? '"' + node.tag + '"' : 'null';
        var self_closing_js = node.selfClosing ? 'true' : 'false';

        return [id, util.format('var n_%d=d.next("tag",[s,%s,%s,%s,%s,%s,[%s],[%s]]);',
                id, parent_js, children_js, tag_js, attrs.value, self_closing_js, decors_js, __deps(attrs.deps))];
    },

    walkTagAttributes: function (node) {
        var attrs_items = [];
        var attrs_deps = [];
        var attrs_js = 'null';

        if (node.attrs && node.attrs.length) {
            for (var i = 0; i < node.attrs.length; i++) {
                var attr = this.walkNode(node.attrs[i]);
                attrs_deps = attrs_deps.concat(attr.deps);
                attrs_items.push(attr.value);
            }

            attrs_js = util.format('d.util.merge_attrs([%s])', attrs_items.join(','));

            if (attrs_deps.length) {
                attrs_js = __wrap(attrs_js);
            }
        }

        return {
            value: attrs_js,
            deps: attrs_deps
        };
    },

    walkTagAttribute: function (node) {
        var value = this.walkNode(node.value);

        return {
            value: '{"' + node.attr + '": ' + value.value + '}',
            deps: value.deps
        };
    },

    walkDecorator: function (node) {
        var args = [], deps = [], mutable = [];
        var arg;

        for (var i = 0; i < node.args.length; i++) {
            arg = this.walkNode(node.args[i]);
            deps = deps.concat(arg.deps);
            mutable = mutable.concat(arg.mutable);
            args.push(util.format('{e:%s,d:[%s],m:[%s]}', arg.value, __deps(arg.deps), __deps(arg.mutable)));
        }

        return {
            value: util.format(
                '{id:"%s",args:[%s]}',
                node.id, args.join(',')),
            deps: deps,
            mutable: mutable
        };
    },

    walkDecoratorArgument: function (node) {
        var expr = this.walkNode(node.expr);
        return {
            value: expr.deps.length ? __wrap(expr.value) : expr.value,
            deps: expr.deps,
            mutable: expr.mutable
        };
    },

    walkExcept: function (node, id) {
        var wait = node.wait ? this.walkExceptWait(node.wait, id) : 'null';
        var error = node.error ? this.walkExceptError(node.error, id) : [ 'null', 'null' ];

        return '{w:' + wait + ',e:' + error[0] + ',i:' + error[1] + '}';
    },

    walkExceptWait: function (node, id) {
        var block = this.walkTags(node.block, id);

        return  __wrap_children(block);
    },

    walkExceptError: function (node, id) {
        var block = this.walkTags(node.block, id);

        return  [ __wrap_children(block), node.id ];
    }
};

function __wrap(value) {
    return 'function(s,c){var _=arguments.callee,_ct=_.q||(_.q={}),_t=' + value + ';_.q=0;return _t;}';
}

function __wrap_f(value) {
    return 'function(){return ' + value + ';}';
}

function __wrap_children(tags) {
    var children_ids = [];
    var js = [];

    if (tags) {
        for (var i = 0; i < tags.values.length; i++) {
            children_ids.push('n_' + tags.values[i][0]);
            js.push(tags.values[i][1]);
        }
    }

    return 'function(s){\n' + js.join('') + 'return [' + children_ids.join(',') + '];\n}';
}

function __deps(list) {
    return list.length ? '"' + list.join('","') + '"' : '';
}

function __gen_id() {
    arguments.callee.idx = arguments.callee.idx || 0;
    return arguments.callee.idx += 1;
}

module.exports.Compiler = Compiler;
module.exports.compile = function () {
    var compiler = new this.Compiler(parser);

    return compiler.compile.apply(compiler, arguments);
};
