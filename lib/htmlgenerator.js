/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var html_driver = {
    decorators: {
        onClick: function (node) {
            return '<!-- onclick -->' + node + '<!-- /onclick -->';
        }
    },
    
    mixins: {
        
    },
    
    __decorate: function (node, decorators) {
        var tmp = node;
        for (var i = decorators.length - 1; i >=0; i--) {
            var dec = decorators[i];
            if (this.decorators[dec.id]) {
                tmp = this.decorators[dec.id](tmp);
            } else {
                console.error('Warning: decorator ' + dec.id + ' is not registered!');
            }
        }
        
        return tmp;
    },
    
    __fork: function (parent) {
        function c() {}
        c.prototype = parent;
        var child = new c();
        child.$$parent = parent;

        return child;   
    },
    
    __unwrap: function (scope, value) {
        return typeof(value) === 'function' ? value.call(this, scope) : value;
    },
    
    tag: function(scope, parent, children, name, attrs, decors) {
        var tmp = [];
        if (attrs) {
            attrs = this.__unwrap(scope, attrs);
            for (var i in attrs) {
                if (attrs.hasOwnProperty(i)) {
                    var attr = this.__unwrap(scope, attrs[i]);
                    tmp.push(i + '="' + attr +'"');
                }
            }
        }

        var attrs_html = tmp.length ? ' ' + tmp.join(' ') : '';
        
        return this.__decorate('<'+name+attrs_html+'>' + children(scope).join('\n') + '</'+name+'>', decors); 
    },

    text: function(scope, parent, text, deps) {
        return this.__unwrap(scope, text);
    },
    
    ifelse: function (scope, parent, children, cond) {
        var cond_val = this.__unwrap(scope, cond);
        
        return cond_val ? children[0](scope).join('') : (children[1]?children[1](scope).join(''):undefined);
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
        
        return result(scope);
    },
    
    dowhile: function () {
        
    },
    
    forin: function (scope, parent, children, expr, value, key) {
        var expr_val = this.__unwrap(scope, expr);
        var values = [];
        var subscope;
        
        if (expr_val instanceof Array) {
            for (var i = 0; i < expr_val.length; i++) {
                subscope = this.__fork(scope);
                if (key) subscope[key] = i;
                subscope[value] = expr_val[i];
                values = values.concat(children(subscope));
            }
        } else {
            for (var i in expr_val) {
                if (expr_val.hasOwnProperty(i)) {
                    subscope = this.__fork(scope);
                    if (key) subscope[key] = i;
                    subscope[value] = expr_val[i];
                    values = values.concat(children(subscope));
                }
            }
        }
        
        return values.join('');
    },
    
    include: function () {
        
    },
    
    extend: function () {
        
    },
    
    mixin: function () {
        
    },
    
    mixincall: function () {
        
    },
    
    block: function () {
        
    }
};