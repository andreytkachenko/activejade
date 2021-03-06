/**
 * Created by tkachenko on 25.04.15.
 */

var extend = require('extend');

var Node = function () {};

Node.prototype = {
    hasBlock: false,
    initialize: function (hasBlock) {
        this.hasBlock = hasBlock;
    }
};

Node.extend = function (obj) {
    var child = function child () {
        extend(this, obj);
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    child.prototype = this;
    return child;
};

module.exports.Node = Node;

module.exports.UnaryOpNode = Node.extend({
    type: 'UnaryExpression',
    operator: null,
    right: null,
    left: null,
    initialize: function (op, right, left) {
        this.operator = op;
        this.right = right;
        this.left = left;
    }
});

module.exports.BinaryOpNode = Node.extend({
    type: 'BinaryExpression',
    operator: null,
    left: null,
    right: null,
    initialize: function (op, left, right) {
        this.operator = op;
        this.left = left;
        this.right = right;
    }
});

module.exports.TernaryOpNode = Node.extend({
    type: 'ConditionOp',
    cond: null,
    onTrue: null,
    onFalse: null,
    initialize: function (cond, onTrue, onFalse) {
        this.cond = cond;
        this.onTrue = onTrue;
        this.onFalse = onFalse;
    }
});

module.exports.IdentifierNode = Node.extend({
    type: 'Identifier',
    id: null,
    initialize: function (name) {
        this.id = name;
    }
});

module.exports.ReferenceNode = Node.extend({
    type: 'Reference',
    id: null,
    expr: null,
    initialize: function (name, expr) {
        this.id = name.slice(1);
        this.expr = expr || null;
    }
});

module.exports.PropertyOpNode = Node.extend({
    type: 'PropertyOp',
    property: null,
    safe: false,
    object: null,
    initialize: function (obj, name, safe) {
        this.property = name;
        this.object = obj;
        this.safe = safe;
    }
});

module.exports.ScalarNode = Node.extend({
    type: 'Literal',
    value: null,
    kind: null,
    initialize: function (value, kind) {
        this.value = value;
        this.kind = kind;
    }
});

module.exports.AssignOpNode = Node.extend({
    type: 'AssignmentExpression',
    operator: null,
    left: null,
    right: null,
    initialize: function (op, left, right) {
        this.operator = op;
        this.left = left;
        this.right = right;
    }
});

module.exports.FunctionCallOpNode = Node.extend({
    type: 'CallExpression',
    callee: null,
    args: null,
    initialize: function (expr, args) {
        this.callee = expr;
        this.args = args;
    }
});

module.exports.IndexOpNode = Node.extend({
    type: 'IndexOp',
    index: null,
    expr: null,
    initialize: function (left, index) {
        this.expr = left;
        this.index = index;
    }
});

module.exports.SliceOpNode = Node.extend({
    type: 'SliceOp',
    expr: null,
    from: null,
    to: null,
    initialize: function (expr, indexFrom, indexTo) {
        this.from = indexFrom;
        this.expr = expr;
        this.to = indexTo;
    }
});

module.exports.NewOpNode = Node.extend({
    type: 'NewExpression',
    expr: null,
    initialize: function (expr) {
        this.expr = expr;
    }
});

module.exports.DeleteOpNode = Node.extend({
    expr: null,
    initialize: function (expr) {
        this.expr = expr;
    }
});

module.exports.VarStatementNode = Node.extend({
    type: 'VariableStatement',
    declarations: null,
    kind: null,
    initialize: function (declarations, kind) {
        this.declarations = declarations;
        this.kind = kind;
    }
});
module.exports.VarDeclarationNode = Node.extend({
    type: 'VariableDeclaration',
    id: null,
    init: null,
    initialize: function (name, expr) {
        this.id = name;
        this.init = expr;
    }
});

module.exports.ArrayNode = Node.extend({
    type: 'ArrayExpression',
    elements: null,
    initialize: function (items) {
        this.elements = items;
    }
});

module.exports.ObjectNode = Node.extend({
    type: 'ObjectExpression',
    properties: null,
    initialize: function (map) {
        this.properties = map;
    }
});

module.exports.ObjectProperyNode = Node.extend({
    type: 'ObjectProperty',
    id: null,
    expr: null,
    initialize: function (key, value) {
        this.id = key;
        this.expr = value;
    }
});

var StringNode =
module.exports.StringNode = Node.extend({
    type: 'String',
    value: null,
    initialize: function (value) {
        this.value = value;
    }
});

module.exports.StringArrayNode = Node.extend({
    type: 'StringArray',
    nodes: null,
    initialize: function (value) {
        this.nodes = [];

        if (typeof value === 'string') {
            this.addString(value);
        } else {
            this.addNode(value);
        }
    },
    addNode: function (node) {
        this.nodes.push(node);

        return this;
    },
    addString: function (string) {
        this.nodes.push(new StringNode(string));

        return this;
    },
    addStringArray: function (array) {
        for (var i =0; i < array.nodes.length; i++) {
            this.nodes.push(array.nodes[i]);
        }

        return this;
    }
});

module.exports.ExprNode = Node.extend({
    type: 'ExpressionStatement',
    expr: null,
    escape: false,
    initialize: function (expr, escape) {
        this.expr = expr;
        this.escape = escape;
    }
});

module.exports.DoctypeNode = Node.extend({
    type: 'Doctype',
    doctype: null,
    initialize: function (doctype) {
        this.doctype = doctype;
    }
});

module.exports.StatementNode = Node.extend({
    type: 'Statement',
    expr: null,
    initialize: function (expr) {
        this.expr = expr;
    }
});

module.exports.IfElseNode = Node.extend({
    type: 'IfElse',
    cond: null,
    onTrue: null,
    onFalse: null,
    except: null,
    initialize: function (cond, onIf, onElse) {
        this.cond = cond;
        this.onTrue = onIf;
        this.onFalse = onElse;
    },
    setExcept: function (except) {
        this.except = except;
    }
});

module.exports.WhileNode = Node.extend({
    type: 'While',
    expr: null,
    block: null,
    except: null,
    initialize: function (expr, block) {
        this.expr = expr;
        this.block = block;
    },
    setExcept: function (except) {
        this.except = except;
    }
});

module.exports.ForInIfNode = Node.extend({
    type: 'ForInIf',
    value: null,
    key: null,
    expr: null,
    cond: null,
    block: null,
    except: null,
    onFalse: null,
    initialize: function (expr, value, key, block, cond) {
        this.key = key;
        this.value = value;
        this.expr = expr;
        this.block = block;
        this.cond = cond;
    },
    setElse: function (block) {
        this.onFalse = block;
    },
    setExcept: function (except) {
        this.except = except
    }
});

module.exports.CaseNode = Node.extend({
    type: 'Case',
    expr: null,
    cases: null,
    except: null,
    initialize: function (expr, cases) {
        this.expr = expr;
        this.cases = cases;
    },
    setExcept: function (except) {
        this.except = except;
    }
});

module.exports.CaseWhenNode = Node.extend({
    type: 'CaseWhen',
    when: null,
    block: null,
    initialize: function (cond, block) {
        this.when = cond;
        this.block = block;
    }
});

module.exports.CaseDefaultNode = Node.extend({
    type: 'CaseDefault',
    block: null,
    initialize: function (block) {
        this.block = block;
    }
});

module.exports.TagNode = Node.extend({
    type: 'Tag',
    tag: null,
    attrs: null,
    decorators: null,
    selfClosing: false,
    block: null,
    initialize: function (tagName, attrs, block) {
        this.tag = tagName;
        this.attrs = attrs || new TagAttributeList();
        this.block = block;
    },
    setDecorators: function (decorators) {
        this.decorators = decorators;
    }
});

module.exports.TagAttributeNode = Node.extend({
    type: 'TagAttribute',
    attr: null,
    value: null,
    initialize: function (attr, value) {
        this.attr = attr;
        this.value = value;
    }
});

var TagAttributeList =
module.exports.TagAttributeList = Node.extend({
    type: 'TagAttributes',
    attrs: null,
    initialize: function (attrs) {
        this.attrs = attrs;
    }
});

module.exports.CommentNode = Node.extend({
    type: 'Comment',
    lines: null,
    echo: false,
    initialize: function (lines, echo) {
        this.lines = lines;
        this.echo = echo;
    }
});

module.exports.CommentLineNode = Node.extend({
    type: 'CommentLine',
    value: null,
    initialize: function (value) {
        this.value = value;
    }
});

module.exports.TextNode = Node.extend({
    type: 'Text',
    escape: false,
    text: null,
    initialize: function (text, escape) {
        this.text = text;
        this.escape = escape;
    }
});

module.exports.IncludeNode = Node.extend({
    type: 'Include',
    href: null,
    filter: null,
    with: null,
    except: null,
    initialize: function (href, withExpr, filter) {
        this.href = href;
        this.with = withExpr;
        this.filter = filter;
    },
    setExcept: function (except) {
        this.except = except;
    }
});

module.exports.ExtendNode = Node.extend({
    type: 'Extend',
    href: null,
    initialize: function (href) {
        this.href = href;
    }
});

module.exports.FilterNode = Node.extend({
    type: 'Filter',
    id: null,
    block: null,
    initialize: function (id, block) {
        this.id = id;
        this.block = block;
    }
});


module.exports.BlockNode = Node.extend({
    type: 'Block',
    id: null,
    embed: null,
    block: null,
    root: false,
    initialize: function (name, embed, block, root) {
        this.id = name;
        this.embed = embed;
        this.block = block;
        this.root = root;
    }
});

module.exports.SuperBlockNode = Node.extend({
    type: 'SuperBlock'
});

module.exports.MixinNode = Node.extend({
    type: 'Mixin',
    id: null,
    args: null,
    block: null,
    initialize: function (id, args, block) {
        this.id = id;
        this.args = args;
        this.block = block;
    }
});

module.exports.MixinArgumentNode = Node.extend({
    type: 'MixinArgument',
    id: null,
    initialize: function (id) {
        this.id = id;
    }
});

module.exports.MixinArgumentList = Node.extend({
    type: 'MixinArgumentList',
    args: null,
    ellipsis: null,
    initialize: function (args, ellipsis) {
        this.args = args;
        this.ellipsis = ellipsis;
    }
});

module.exports.MixinYieldNode = Node.extend({
    type: 'MixinYield'
});

module.exports.MixinBlockNode = Node.extend({
    type: 'MixinBlock'
});

module.exports.MixinCallNode = Node.extend({
    type: 'MixinCall',
    id: null,
    args: null,
    attrs: null,
    decorators: null,
    block: null,
    initialize: function (name, args, attrs, block) {
        this.id = name;
        this.args = args;
        this.attrs = attrs;
        this.block = block;
    },
    setDecorators: function (decorators) {
        this.decorators = decorators;
    }
});

module.exports.MixinCallArgumentNode = Node.extend({
    type: 'MixinCallArgument',
    expr: null,
    initialize: function (expr) {
        this.expr = expr;
    }
});

module.exports.DecoratorNode = Node.extend({
    type: 'Decorator',
    id: null,
    args: null,
    initialize: function (name, args) {
        this.id = name;
        this.args = args;
    }
});

module.exports.DecoratorArgumentNode = Node.extend({
    type: 'DecoratorArgument',
    expr: null,
    initialize: function (expr) {
        this.expr = expr;
    }
});

module.exports.ExceptErrorNode = Node.extend({
    type: 'ExceptErrorNode',
    block: null,
    id: null,
    initialize: function (block, id) {
        this.block = block;
        this.id = id;
    }
});

module.exports.ExceptWaitNode = Node.extend({
    type: 'ExceptWaitNode',
    block: null,
    initialize: function (block) {
        this.block = block;
    }
});

module.exports.ExceptNode = Node.extend({
    type: 'Except',
    wait: null,
    error: null,
    initialize: function (wait, error) {
        this.wait = wait;
        this.error = error;
    }
});
