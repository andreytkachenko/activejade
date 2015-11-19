/**
 * Created by tkachenko on 16.04.15.
 */

var util = require("util");

var parser = require("../dist/parser").parser;
parser.yy.$ = require("./scope");

var Compiler = function (parser) {
    this.parser = parser;
};

Compiler.prototype = {
    compile: function (source, name, callback_name) {
        var val = this.walkTags(this.parser.parse(source + '\n'), 0)
        var items = [];
        var ids = [];
        for (var i = 0; i < val.values.length; i++) {
            items.push(val.values[i][1]);
            ids.push(val.values[i][0]);
        }

        return util.format('%s("%s", function(s,d){var __FILE__="%s";%s; return d.generate([n_%s]);});', 
                            callback_name, name, name, items.join(''), ids.join(',n_'));
    },
    
    walkNode: function (node) {
        if (!this['walk' + node.type]) {
            console.dir(node);
            throw new Error('Unknown ' + node.type);
        }
        return this['walk' + node.type].apply(this, arguments);
    },

    walkTags: function(nodes, parent) {
        var value = [];
        var deps = [];
        var data;

        for (var i = 0; i < nodes.length; i++) {
            data = this.walkNode(nodes[i], parent);
            value.push(data);
            deps.concat(data.deps);
        }

        return {
            values: value,
            deps: deps
        };
    },

    walkList: function(nodes) {
        var value = [];
        var deps = [];
        var data;

        for (var i = 0; i < nodes.length; i++) {
            data = this.walkNode(nodes[i]);
            value.push(data.value);
            deps = deps.concat(data.deps);
        }

        return {
            values: value,
            deps: deps
        };
    },
    
    /** Expressions **/
    
    walkString: function(node){
        return {
            value: '"' + node.value.replace('\n', '\\n') + '"',
            deps: []
        };
    },
    
    walkStringArray: function (node) {
        var nodes = this.walkList(node.nodes);
        
        return {
            value: '[' + nodes.values.join(', ') + '].join("")',
            deps: nodes.deps
        };
    },
    
    walkIdentifier: function (node) {
        return {
            value: '(s.'+node.id+'||"")',
            deps: [node.id]
        };
    },
    
    walkLiteral: function (node) {
        return {
            value: node.value,
            deps: []
        };
    },
    
    walkPropertyOp: function (node) {
        var object = this.walkNode(node.object);
        return {
            value: object.value + '.' + node.property,
            deps: object.deps
        };
    },
    
    walkIndexOp: function (node) {
        var index = this.walkNode(node.index);
        var expr = this.walkNode(node.expr);
        
        return {
            value: '(' + expr.value + ')[' + index.value + ']',
            deps: index.deps.concat(expr.deps)
        };
    },
    
    walkSliceOp: function (node) {
        var vals = this.walkList([node.expr, node.from, node.to]);
        
        return {
            value: '(' + vals.values[0] + ').slice(' + vals.values[1] + ', ' + vals.values[2] + ')',
            deps: vals.deps
        };
    },
    
    walkConditionOp: function (node) {
        var cond = this.walkNode(node.cond);
        var onTrue = this.walkNode(node.onTrue);
        var onFalse = this.walkNode(node.onFalse);
        
        return {
            value: cond.value + ' ? ' + onTrue.value + ' : ' + onFalse.value,
            deps: cond.deps.concat(onTrue.deps).concat(onFalse.deps)
        };
    },
    
    walkCallExpression: function (node) {
        var callee = this.walkNode(node.callee);
        var args = this.walkList(node.args);
        
        return {
            value: callee.value + '(' + args.values.join(', ') + ')',
            deps: callee.deps.concat(args.deps)
        };
    },
    
    walkUnaryExpression: function (node) {
        var right = this.walkNode(node.right);
        var space = node.operator === 'new' ? ' ' : '';
        
        return {
            value: node.operator + space + right.value,
            deps: right.deps
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
            deps: left.deps.concat(right.deps)
        };
    },
    
    walkArrayExpression: function (node) {
        var elems = this.walkList(node.elements);
        
        return {
            value: '[' + elems.values.join(', ') + ']',
            deps: elems.deps
        };
    },
    
    walkObjectExpression: function (node) {
        var elems = this.walkList(node.properties);
        
        return {
            value: '{' + elems.values.join(', ') + '}',
            deps: elems.deps
        };
    },
    
    walkObjectProperty: function (node) {
        var expr = this.walkNode(node.expr);
        
        return {
            value: node.id + ': ' + expr.value,
            deps: expr.deps
        };
    },
    
    walkAssignmentExpression: function (node) {
        var left = this.walkNode(node.left);
        var right = this.walkNode(node.right);
        
        return {
            value: left.value + ' ' + node.operator + ' ' + right.value,
            deps: left.deps.concat(right.deps)
        };
    },
    
    walkStatement: function (node, parent_id) {
        var id = __gen_id();
        var expr = this.walkNode(node.expr);
        var expr_js = expr.value;
        if (expr.deps.length) {
            expr_js = __wrap(expr.value);
        }
        var parent_js = __wrap_f('n_'+parent_id);
        
        return [id, util.format('var n_%d=d.statement(s,%s,%s,[%s]);',id,parent_js,expr_js,__deps(expr.deps))];
    },
    
    
    walkVariableStatement: function (node) {
        var declarations = this.walkList(node.declarations);
        
        return {
            value: declarations.values.join(';')+';',
            deps: declarations.deps
        };
    },
    
    walkVariableDeclaration: function (node) {
        var init = node.init ? this.walkNode(node.init) : null;
        
        return {
            value: 's.' + node.id + '=' + (init ? init.value : 'undefined'),
            deps: init ? init.deps : []
        };
    },
    
    walkExpressionStatement: function (node) {
        var data = this.walkNode(node.expr);
        if (node.escape) {
            return {
                value: 'd.util.escape(' + data.value + ')',
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
        var block = this.walkTags(node.block, id);
        var expr_js = expr.value;
        
        if (expr.deps.length) {
            expr_js = __wrap(expr.value);
        }
        
        var parent_js = __wrap_f('n_' + parent_id);
        var block_js = __wrap_children(block);
        
        return [id, util.format('var n_%d=d.dowhile(s,%s,%s,%s,[%s]);',id,parent_js,block_js,expr_js,__deps(expr.deps))];
    },
    
    walkForIn: function (node, parent_id) {
        var id = __gen_id();
        var key = node.key;
        var value = node.value;
        var expr = this.walkNode(node.expr);
        var block = this.walkTags(node.block, id);
        var expr_js = expr.value;
        
        if (expr.deps.length) {
            expr_js = __wrap(expr.value);
        }
        
        var parent_js = __wrap_f('n_' + parent_id);
        var block_js = __wrap_children(block);
        
        return [id, util.format('var n_%d=d.forin(s,%s,%s,%s,"%s","%s",[%s]);',id,parent_js,block_js,expr_js,value,key,__deps(expr.deps))];
    },
    
    /** Branching **/
    
    walkIfElse: function (node, parent_id) {
        var id = __gen_id();
        var cond = this.walkNode(node.cond);
        var onTrue = this.walkTags(node.onTrue, id);
        var onFalse = null;
        if (node.onFalse){
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
        
        var children_js = '['+children.join(',')+']';
        
        return [id, util.format('var n_%d=d.ifelse(s,%s,%s,%s,[%s]);',id,parent_js,children_js,cond_js,__deps(cond.deps))];
    },
    
    walkCase: function (node, parent_id) {
        var id = __gen_id();
        var expr = this.walkNode(node.expr);
            expr_value = expr.deps ? __wrap(expr.value) : expr.value;
        var children_js = [];
        var exprs = [], tcase, texpr;
        var parent_js = __wrap_f('n_' + parent_id);
        var default_idx = null;
        var deps = expr.deps;
        
        for (var i = 0; i < node.cases.length; i++) {
            tcase = node.cases[i];
            texpr = tcase.when ? this.walkNode(tcase.when) : null;
            
            if (texpr) {
                exprs.push(util.format('{children:%d,expr:%s}', children_js.length, texpr.deps.length ? __wrap(texpr.value) : texpr.value));
                deps = deps.concat(texpr.deps);
            } else {
                default_idx = children_js.length;
            }
            
            if (tcase.block) {
                var tags = this.walkTags(tcase.block);
                children_js.push(__wrap_children(tags));
            }
        }
        
        return [
            id, 
            util.format('var n_%d=d.casewhen(s,%s,[%s],[%s],%s,%s,[%s]);',id,parent_js,children_js.join(','),exprs.join(','),expr_value,default_idx,__deps(deps))
        ];
    },
    
    /** Comments **/
    
    walkComment: function () {
        throw new Error('unimplemented!');
    },
    
    walkCommentLine: function () {
        throw new Error('unimplemented!');
    },
    
    /** Include **/
    
    walkInclude: function (node, parent_id) {
        var id = __gen_id();
        var href = this.walkNode(node.href);
        var href_js = href.value;
        
        if (href.deps.length) {
            href_js = __wrap(href.value);
        }
        
        var parent_js = __wrap_f('n_'+parent_id);
        
        return [id, util.format('var n_%d=d.include(s,%s,%s,__FILE__,[%s]);',id,parent_js,href_js,__deps(href.deps))];
    },
    
    /** Filter **/
    
    walkFilter: function (node, parent_id) {
        throw new Error('unimplemented!');
    },
    
    /** Blocks **/
    
    walkExtends: function () {
        throw new Error('unimplemented!');
    },
    
    walkBlock: function (node, parent_id) {
        throw new Error('unimplemented!');
    },
    
    walkSuperBlock: function (node, parent_id) {
        throw new Error('unimplemented!');
    },
    
    /** Mixins **/
    
    walkMixin: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_'+parent_id);
        
        var block = this.walkTags(node.block);
        var children_js = __wrap_children(block);
        
        var args = [];
        var ellipsis = node.args.ellipsis ? '"'+node.args.ellipsis+'"' : null;
        
        for (var i = 0; i < node.args.args.length; i ++) {
            args.push('"'+node.args.args[i].id+'"');
        }

        return [id, util.format('var n_%d=d.mixin(s,%s,%s,"%s",[%s],%s);',id,parent_js,children_js,node.id,args.join(','),ellipsis)];
    },
    
    walkMixinCall: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_'+parent_id);
        
        var args = this.walkList(node.args);
        var attrs = node.attrs ? this.walkNode(node.attrs) : {value: '{}', deps:[]};
        
        var block = node.block ? this.walkTags(node.block) : null;
        var children_js = block ? __wrap_children(block) : __wrap_f('');
        
        return [id, util.format('var n_%d=d.mixincall(s,%s,%s,"%s",[%s],%s);',id,parent_js,children_js,node.id,args.values.join(','),attrs.value)];
    },
    
    walkMixinCallArgument: function (node) {
        var expr = this.walkNode(node.expr);
        return {
            value: util.format('{id:"%s",expr:%s,deps:[%s]}', node.id||'', expr.value,__deps(expr.deps)),
            deps: expr.deps
        };
    },

    walkMixinYield: function (node, parent_id) {
        throw new Error('unimplemented!');
    },

    walkMixinBlock: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_'+parent_id);
        
        return [id, util.format('var n_%d=d.mixinblock(s,%s);',id, parent_js)];
    },
    
    /** Doctype **/
    
    walkDoctype: function (node, parent_id) {
        var id = __gen_id();
        var parent_js = __wrap_f('n_'+parent_id);
        
        return [id, util.format('var n_%d=d.doctype(s,%s,"%s");',id, parent_js, node.doctype)];
    },
    
    /** Text and Tags **/
    
    walkText: function (node, parent_id) {
        var id = __gen_id();
        var value = this.walkNode(node.text);
        var value_js = value.value;
        if (value.deps.length) {
            value_js = __wrap(value.value);
        }
        var parent_js = __wrap_f('n_'+parent_id);
        
        return [id, util.format('var n_%d=d.text(s,%s,%s,[%s]);',id,parent_js,value_js,__deps(value.deps))];
    },
    
    walkTag: function (node, parent_id) {
        var id = __gen_id();
        var tags = node.block ? this.walkTags(node.block, id) : null;
        var attrs = this.walkNode(node.attrs);
        var decors = node.decorators ? this.walkList(node.decorators, id) : null;
        
        var children_js = __wrap_children(tags);
        var parent_js = __wrap_f('n_'+parent_id);
        var decors_js = decors?decors.values.join(','):'';
        
        return [id, util.format('var n_%d=d.tag(s,%s,%s,"%s",%s,[%s],[%s]);',id,parent_js,children_js,node.tag,attrs.value,decors_js,__deps(attrs.deps))];
    },
    
    walkTagAttributes: function (node) {
        var attrs_items = [];
        var attrs_objects = [];
        var attrs_deps = [];
        var attrs_js = 'null';
        
        if (node.attrs) {
            for (var i = 0; i < node.attrs.length; i++) {
                var attr = this.walkNode(node.attrs[i]);
                attrs_deps = attrs_deps.concat(attr.deps);

                if (node.attrs[i].type === 'TagAttribute') {
                    attrs_items.push(attr.value);
                } else {
                    attrs_objects.push(attr.value);
                }
            }

            if (node.attrs.length) {
                if (attrs_objects.length) {
                    attrs_js = util.format('d.util.extend({%s},%s)', attrs_items.join(','), attrs_objects.join(', '));
                } else {
                    attrs_js = util.format('{%s}', attrs_items.join(','));
                }
            } else {
                attrs_js = 'null';
            }

            if (attrs_deps.length) {
                attrs_js = __wrap(attrs_js);
            }
        }
        
        return {
            value: attrs_js,
            deps: attrs_deps
        };
    },
    
    walkTagAttribute : function (node) {
        var value = this.walkNode(node.value);
        var js = value.value;
        
        if (node.attr === 'style') js = 'd.util.pp_style(' + js + ')';
        if (node.attr === 'class') js = 'd.util.pp_class(' + js + ')';
       
        return {
            value: '"' + node.attr + '": ' + js,
            deps: value.deps
        };
    },
    
    walkDecorator: function (node) {
        var args = this.walkList(node.args);
        return {
            value: util.format('{id:"%s",args:[%s],deps:[%s]}', node.id, args.values.join(','),__deps(args.deps)),
            deps: args.deps
        };
    },
    
    walkDecoratorArgument: function (node) {
        var expr = this.walkNode(node.expr);
        return {
            value: expr.deps.length ? __wrap(expr.value) : expr.value,
            deps: expr.deps
        };
    }
};

function __wrap(value) {
    return 'function(s){return '+value+';}';
}

function __wrap_f(value) {
    return 'function(){return '+value+';}';
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

    return 'function(s){\n'+js.join('')+'return ['+children_ids.join(',')+'];\n}';
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