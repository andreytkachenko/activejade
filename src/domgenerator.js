/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var dom_driver = {
    __document: null,
    __templates: null,
    __mixins: {},
    __decorators: {
        onClick: function (node, scope, args) {
            node.addEventListener("click", function () {
                args[0](scope);
                console.log(scope.c)
            });
            
            return node;
        }
    },
    __decorate: function (node, scope, decorators) {
        var tmp = node;
        for (var i = decorators.length - 1; i >=0; i--) {
            var dec = decorators[i];
            if (this.__decorators[dec.id]) {
                tmp = this.__decorators[dec.id](tmp, scope, dec.args);
            } else {
                console.warn('Warning: decorator ' + dec.id + ' is not registered!');
            }
        }
        
        return tmp;
    },
    __unwrap: function (scope, value) {
        return typeof(value) === 'function' ? value.call(this, scope) : value;
    },
    
    __appendChildren: function (el, children) {
        for (var i = 0; i < children.length; i++) {
            el.appendChild(children[i]);
        }
    },
    
    __fork: function (parent) {
        function c() {}
        c.prototype = parent;
        var child = new c();
        child.$$parent = parent;

        return child;   
    },
    
    __watch: function (scope, deps, callback) {
//        scope.$watchGroup(deps, callback);
    },
    
    util: {
        extend: function () {
            var obj = {};
            for(var i = 0; i < arguments.length; i++)
                for(var key in arguments[i])
                    if(arguments[i].hasOwnProperty(key))
                        obj[key] = arguments[i][key];
            return obj;
        },
        pp_class: function(_class) {
            if (_class instanceof Array) {
                return _class.join(" ");
            } 
            return _class;
        },
        pp_style: function(_style) {
            var res = [];
            if (typeof _style === "object") {
                for (var i in _style) {
                    if (_style.hasOwnProperty(i)) {
                        res.push(i + ":" + _style[i]);
                    }
                }
                return res.join(";");
            } 
            return _style;
        },
        escape: function(text) {
            var result = String(text)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
      
            if (result === '' + text) 
                return text;
            else 
                return result;
        },
        range: function(from, to) {
            var res = [];
            for (var i = from; i <= to; i++) {
                res.push(i);
            }
            return res;
        }
    },
    
    createTextElement: function (value) {
        var el = this.__document.createElement('div');
        var df = this.__document.createDocumentFragment();
        el.innerHTML = value;
        while (el.firstChild) df.appendChild(el.firstChild);
        delete el;
        
        return df;
    },
    
    text: function(scope, parent, text, deps) {
        var el = this.createTextElement(this.__unwrap(scope, text));
        
        if (deps.length) {
            this.__watch(scope, deps, function () {
                el.parentNode.insertBefore(this.createTextElement(this.__unwrap(scope, text)), el);
                el.removeChild();
            });
        }
        
        return el;
    },
    
    statement: function(scope, parent, expr, deps) {
        this.__unwrap(expr);
        
        return this.__document.createDocumentFragment();
    },
    
    tag: function(scope, parent, children, name, attrs, decors, deps) {
        var tmp = [];
        if (attrs) {
            attrs = this.__unwrap(scope, attrs);
            for (var i in attrs) {
                if (attrs.hasOwnProperty(i)) {
                    var attr = this.__document.createAttribute(i);
                    attr.value = this.__unwrap(scope, attrs[i]);
                    tmp.push(attr);
                }
            }
        }
        
        var tag = this.__document.createElement(name);
        var children = children(scope);
        
        this.__appendChildren(tag, children);
        
        for (var i = 0; i < tmp.length; i++) {
            tag.setAttributeNode(tmp[i]);
        }
        
        return this.__decorate(tag, scope, decors); 
    },
    
    dowhile: function (scope, parent, children, expr) {
        var expr_func = typeof (expr) === 'function' ? expr : function () {return expr;};
        var subscope;
        var df = this.__document.createDocumentFragment();
        while (expr_func(scope)) {
            this.__appendChildren(df, children(scope));
        }
        
        return df;
    },
    
    forin: function (scope, parent, children, expr, value, key) {
        var expr_val = this.__unwrap(scope, expr);
        var subscope;
        
        var df = this.__document.createDocumentFragment();
        
        if (expr_val instanceof Array) {
            for (var i = 0; i < expr_val.length; i++) {
                subscope = this.__fork(scope);
                if (key) subscope[key] = i;
                subscope[value] = expr_val[i];
                
                this.__appendChildren(df, children(subscope));
            }
        } else {
            for (var i in expr_val) {
                if (expr_val.hasOwnProperty(i)) {
                    subscope = this.__fork(scope);
                    if (key) subscope[key] = i;
                    subscope[value] = expr_val[i];
                    
                    this.__appendChildren(df, children(subscope));
                }
            }
        }
        
        return df;
    },
    
    ifelse: function (scope, parent, children, cond) {
        var cond_val = this.__unwrap(scope, cond);
        var df = this.__document.createDocumentFragment();
        this.__appendChildren(df, cond_val ? children[0](scope) : (children[1]?children[1](scope):[]));
        
        return df;
    },
    
    casewhen: function (scope, parent, children, exprs, expr, default_idx) {
        var expr = this.__unwrap(scope, expr),
            result, resultGot = false;
        
        for (var i = 0; i < exprs.length; i++) {
            if (expr == this.__unwrap(scope, exprs[i].expr)) {
                resultGot = true;
                result = children[exprs[i].children];
                break;
            }
        }
        
        if (!resultGot && default_idx !== null) {
            result = children[default_idx];
        }
        
        var df = this.__document.createDocumentFragment();
        this.__appendChildren(df, result(scope));
        return df;
    },
    
    include: function (scope, parent, href) {
        var href = this.__unwrap(scope, href);
        var nodes = this.__templates.get(href)(scope, this);
        
        var df = this.__document.createDocumentFragment();
        this.__appendChildren(df, nodes);
        return df;
    },
    
    mixin: function (scope,parent,children,name,args,ellipsis) {
        if (this.__mixins[name]) {
            console.warn('Warning: Mixin ' + name + ' overrided!');
        }
        
        this.__mixins[name] = {
            block: children,
            args: args,
            ellipsis: ellipsis
        };
        
        return this.__document.createDocumentFragment();
    },
    
    mixincall: function (scope,parent,children,name,args,attrs) {
        if (!this.__mixins[name]) {
            throw 'Calling mixin not defined: ' + name;
        }
        
        var mixin = this.__mixins[name];
        
        var subscope = this.__fork(scope);
        subscope.attributes = attrs;
        subscope.mixinblockcallback = children;
        subscope.arguments = [];
        if (mixin.ellipsis) 
            subscope[mixin.ellipsis] = [];
        
        for (var i = 0; i < args.length; i++) {
            var arg = this.__unwrap(scope, args[i].expr);
            if (!mixin.args[i]) {
                if (mixin.ellipsis) {
                    subscope[mixin.ellipsis].push(arg);
                }
            } else {
                subscope[mixin.args[i]] = arg;
            }
            
            subscope.arguments[i] = arg;
        }
        
        var df = this.__document.createDocumentFragment();
        this.__appendChildren(df, mixin.block(subscope));
        
        return df;
    },
    
    mixinblock: function (scope,parent) {
        if (typeof scope.mixinblockcallback !== 'function') {
            console.warn('Warning: wrong mixin block operator should be inside mixin!');
            return this.__document.createDocumentFragment();
        }
        
        var df = this.__document.createDocumentFragment();
        this.__appendChildren(df, scope.mixinblockcallback(scope));
        
        return df;
    }
};
