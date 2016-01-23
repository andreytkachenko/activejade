function extend(child, parent) {
    var hasProp = Object.prototype.hasOwnProperty;

    for (var key in parent) {
        if (hasProp.call(parent, key))
            child[key] = parent[key];
    }

    function ctor() {
        this.constructor = child;
    }

    var __proto = child.prototype;

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    for (var key in __proto) {
        if (hasProp.call(__proto, key))
            child.prototype[key] = __proto[key];
    }

    child.__super__ = parent.prototype;

    return child;
}

var BaseGenerator = (function(Q) {
    var NODE_HTML = 0,
        NODE_ELEMENT = 1,
        NODE_FRAGMENT = 2,
        NODE_COMMENT = 3,
        NODE_DOCTYPE = 4,
        NODE_DOCUMENT = 5;

    function PromiseException(promise) {
        this.promise = promise;
        this.name = 'PromiseException';
    }

    var BaseNode = function(type, props) {
        if (props) {
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    this[i] = props[i];
                }
            }
        }

        this.id = BaseNode.counter++;
        this.type = type;
        this.defer = Q.defer();
        this.$ = this.defer.promise;
    };

    BaseNode.counter = 0;

    BaseNode.prototype = {
        id: null,
        type: NODE_ELEMENT,
        parent: null,
        attributes: null,
        eventListeners: null,
        children: null,
        setChildren: function (children) {
            var self = this;
            if (children instanceof Array) {
                this.children = children.map(function (i) {
                    i.parent = self;
                    return i;
                });
            }
        },
        appendChild: function (child, idx) {
            this.children = this.children || [];

            child.parent = this;
            this.children.splice(idx || 0, 0, child);
        },
        removeChild: function (child) {
            this.children = this.children || [];

            var idx = this.children.indexOf(child);

            if (idx !== -1) {
                var element = this.children.splice(idx, 1);
                element[0].parent = null;
            }
        },
        insert: function (children, node) {
            this.children = this.children || [];

            var idx = typeof node === 'number' ? node : this.children.indexOf(node);
            if (idx === -1) {
                throw new Error('InsertBefore: Node not found');
            }

            if (children instanceof Array) {
                for (var i = children.length - 1; i >= 0; i--) {
                    this.appendChild(children[i], idx);
                }
            } else if (children instanceof BaseNode) {
                this.appendChild(children, idx);
            } else {
                throw new Error('Type error');
            }
        },
        append: function (children) {
            this.children = this.children || [];

            if ( children instanceof Array ) {
                for (var i = 0; i < children.length; i++ ) {
                    this.appendChild(children[i], this.children.length);
                }
            } else if (children instanceof BaseNode) {
                this.appendChild(children, this.children.length);
            } else {
                throw new Error('Type error');
            }
        },
        remove: function (children) {
            if ( children instanceof Array ) {
                for (var i = 0; i < children.length; i++ ) {
                    this.removeChild(children[i]);
                }
            } else if (children instanceof BaseNode) {
                this.removeChild(children);
            } else {
                throw new Error('Type error');
            }
        },
        replaceChildren: function (_old, _new) {
            this.children = this.children || [];

            var _old = _old instanceof Array ? _old : [ _old ],
                _new = _new instanceof Array ? _new : [ _new ];

            if ( !_old.length ) {
                console.error("Replacing nodes shouldn't be empty");
                throw Error("Replacing nodes shouldn't be empty");
            }

            var idx = this.children.indexOf(_old[0]);

            if (idx === -1) {
                console.error('Replacing elements not found!');
                throw new Error('Replacing elements not found!');
            }

            this.remove(_old);
            this.insert(_new, idx);
        },
        addEventListener: function (name, callback) {
            this.eventListeners = this.eventListeners || [];
            this.eventListeners.push({
                name: name,
                callback: callback
            });
        },
        setAttribute: function (name, value) {
            this.attributes = this.attributes || {};
            this.attributes[name] = value;
        },
        trigger: function () {
            if (this._listeners) {
                this._listeners.forEach(function (listener) {
                    listener();
                });
            }
        },
        listen: function (callback) {
            this._listeners = this._listeners || [];
            this._listeners.push(callback);
        },
        link: function ($element) {
            this.defer.resolve($element);
            this.$ = $element;
        }
    };

    function BaseGenerator(options) {
        var self = this;
        options = options || {};
        this.__templateManager = options.templateManager;
        this.__mixins = options.mixins || {};
        this.__blocks = options.blocks || {};
        this.__decorators = Object.assign({
            on: function (node, scope, args, deps) {
                var eventName = self.__unwrap(args[0])(scope);
                var callback =  self.__unwrap(args[1]);
                var debounce =  self.__unwrap(args[2])(scope);
                var handle = null;

                node.addEventListener(eventName, function (event) {
                    if (!handle) {
                        callback.call(this, scope, {
                            $event: event
                        });

                        if (debounce) {
                            handle = setTimeout(function () {
                                handle = null;
                            }, debounce);
                        }
                    }
                });

                return node;
            },
            var: function (node, scope, args, deps) {
                scope[this.__unwrap(args[0])(scope)] = node;

                return node;
            }
        }, options.decorators || {});
        this.__loader = options.loader;
        this.__watch = options.watch;
    }

    BaseGenerator.prototype = {
        __mixins: null,
        __decorators: null,
        __templateManager: null,
        __loader: null,
        __reference: null,
        __decorate: function (node, scope, decorators) {
            var tmp = node;
            if (decorators instanceof Array) {
                for (var i = decorators.length - 1; i >= 0; i--) {
                    var dec = decorators[i];
                    if (this.__decorators[dec.id]) {
                        tmp = this.__decorators[dec.id](tmp, scope, dec.args, dec.deps);
                    } else {
                        console.warn('Warning: decorator ' + dec.id + ' is not registered!');
                    }
                }
            }

            return tmp;
        },
        __unwrap: function (value, deps) {
            return function self(scope) {
                try {
                    return typeof (value) === 'function' ? value.call(this, scope) : value;
                } catch (e) {
                    if (e.name !== 'PromiseException') {
                        throw e;
                    } else {
                        console.log('promise detected!');
                        e.promise.then(function (data) {
                            console.log('resolved!', Object.prototype.toString.call(data));
                        }).then(self);
                        return undefined;
                    }
                }
            };
        },
        __fork: function (parent) {
            function c() {}
            c.prototype = parent;
            var child = new c();
            child.$$parent = parent;

            return child;
        },
        __dirname: function (path) {
            return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
        },
        __id: function (name) {
            this.__reference = this.__reference || {};
            this.__reference[name] = this.__reference[name] || Q.defer();

            return this.__reference[name].promise;
        },
        __set_id: function (name, node) {
            this.__reference = this.__reference || {};
            this.__reference[name] = this.__reference[name] || Q.defer();
            node.$.then(this.__reference[name].resolve);
        },
        __p: function (value) {
            if (!Q.isPromise(value)) {
                return value;
            } else {
                if (Q.isPending(value)) {
                    throw new PromiseException(value);
                } else {
                    return value.valueOf();
                }
            }
        },
        util: {
            merge_attrs: function (attrs) {
                var separators = {'class': ' ', 'style': ';'};

                var resolve_style = function (_style) {
                    var res = [];
                    for (var i in _style) {
                        if (_style.hasOwnProperty(i)) {
                            res.push(i + ":" + _style[i]);
                        }
                    }
                    return res.join(";");
                };

                var resolve_object = function (obj) {
                    var arr = [];
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i) && obj[i]) {
                            arr.push(i);
                        }
                    }
                    return arr;
                };

                var resolve_value = function (key, val) {
                    if ( typeof  val === 'object' ) {
                        if ( val instanceof Array ) {
                            return val;
                        } else {
                            if (key === 'style') {
                                return resolve_style(val);
                            } else {
                                return resolve_object(val);
                            }
                        }
                    } else {
                        return val;
                    }
                };

                var obj = {};
                for (var i = 0; i < attrs.length; i++)
                    for (var key in attrs[i]) {
                        if (attrs[i].hasOwnProperty(key))
                            var val = resolve_value(key, attrs[i][key]);
                        if (obj[key]) {
                            if (obj[key] instanceof Array) {
                                if (val instanceof Array) {
                                    obj[key] = obj[key].concat(val);
                                } else {
                                    obj[key].push(val);
                                }
                            } else {
                                if (val instanceof Array) {
                                    val.unshift(obj[key]);
                                    obj[key] = val;
                                } else {
                                    obj[key] = [obj[key], val];
                                }
                            }
                        } else {
                            obj[key] = val;
                        }
                    }
                var res = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] instanceof Array) {
                            res[key] = obj[key].join(separators[key] || '');
                        } else {
                            res[key] = obj[key];
                        }
                    }
                }

                return res;
            },
            escape: function (text) {
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
            range: function (from, to) {
                var res = [];
                for (var i = from; i <= to; i++) {
                    res.push(i);
                }
                return res;
            }
        },

        next: function (name, args) {
            var ctx = this[name].apply(this, args),
                updated = false;

            var update = function () {
                try {
                    ctx.update();
                    ctx.node.trigger();
                } catch (e) {
                    if (e.name !== 'PromiseException') {
                        throw e;
                    } else {
                        e.promise.then(update);
                    }
                }
            }

            if (ctx.deps.length && this.__watch) {
                this.__watch(ctx.scope, ctx.deps, function () {
                    updated = true;
                    update();
                });
            }

            if (!updated)
                update();

            return ctx.node;
        },

        mCreateDoctype: function (type) {
            return new BaseNode(NODE_DOCTYPE, {
                doctype: type
            });
        },
        mCreateTag: function (type) {
            return new BaseNode(NODE_ELEMENT, {
                tagName: type
            });
        },
        mCreateText: function (value) {
            return new BaseNode(NODE_HTML, {
                html: value
            });
        },
        mCreateComment: function (value) {
            return new BaseNode(NODE_COMMENT, {
                comment: value
            });
        },
        mCreateFragment: function () {
            return new BaseNode(NODE_FRAGMENT);
        },

        generate: function (children) {
            var node = new BaseNode(NODE_DOCUMENT);
            node.append(children);

            return node;
        },

        doctype: function (scope) {
            return this.mCreateDoctype();
        },

        /** Public Interface **/

        text: function (scope, parent, text, deps) {
            var node = this.mCreateText();
            var text_f = this.__unwrap(text);

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    node.html = text_f(scope);
                }
            };
        },

        statement: function (scope, parent, expr, deps) {
            var expr_f = this.__unwrap(expr);

            return {
                node: this.mCreateFragment(),
                scope: scope,
                deps: deps,
                update: function () {
                    expr_f(scope);
                }
            };
        },

        tag: function (scope, parent, children, name, attrs, decors, deps) {
            var node = this.mCreateTag(name);

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    
                }
            };

            var update_attrs, attrs_f, attr;

            if (attrs) {
                attrs_f = this.__unwrap(attrs);
                update_attrs = (function () {
                    var attrs = attrs_f(scope);
                    for (var i in attrs) {
                        if (attrs.hasOwnProperty(i)) {
                            attr = this.__unwrap(attrs[i])(scope);
                            if (i === 'id')
                                this.__set_id(attr, tag);
                            tag.setAttribute(i, attr);
                        }
                    }
                }).bind(this);

                if (deps.length && this.__watch) {
                    this.__watch(scope, deps, function () {
                        update_attrs();
                        tag.trigger();
                    });
                }

                update_attrs();
            }

            tag.append(children(scope));

            return this.__decorate(tag, scope, decors);
        },

        dowhile: function (scope, parent, children, expr, deps) {
            var node = this.mCreateFragment('while'),
                self = this,
                expr_f = this.__unwrap(expr);

            var update_children = function (node) {
                var _children = [];
                while (expr_f(scope)) {
                    _children = _children.concat(children(scope));
                }

                node.setChildren(_children);
            };

            update_children(node);
            if (deps.length && this.__watch) {
                this.__watch(scope, deps, function () {
                    update_children(node);
                    node.trigger();
                });
            }

            return node;
        },

        forin: function (scope, parent, children, expr, value_name, key_name, cond, deps) {
            var expr_f = this.__unwrap(expr),
                cond_f = this.__unwrap(cond),
                self = this, node = this.mCreateFragment('forin');

            var update_children = function (node, expr_val) {
                var subscope, ctx, _children = [];

                var iteration = function (key, value) {
                    subscope = self.__fork(scope);
                    subscope[value_name] = value;
                    subscope[key_name || '$key'] = key;

                    return { cond: cond_f(subscope), scope: subscope };
                }

                if (expr_val instanceof Array) {
                    for (var i = 0; i < expr_val.length; i++) {
                        ctx = iteration(i, expr_val[i]);
                        if ( ctx.cond ) {
                            _children = _children.concat(children(ctx.scope));
                        }
                    }
                } else {
                    for (var i in expr_val) {
                        if (expr_val.hasOwnProperty(i)) {
                            ctx = iteration(i, expr_val[i]);
                            if ( ctx.cond ) {
                                _children = _children.concat(children(ctx.scope));
                            }
                        }
                    }
                }
                node.setChildren(_children);
            };

            update_children(node, expr_f(scope));

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    update_children(node, expr_f(scope));
                    node.trigger();
                });
            }

            return node;
        },

        ifelse: function (scope, parent, children, cond, deps) {
            var self = this,
                cond_f = self.__unwrap(cond),
                node = self.mCreateFragment('ifelse');

            var update_children = function (node, value) {
                if (value) {
                    node.setChildren(children[0](scope));
                } else if (children[1]) {
                    node.setChildren(children[1](scope));
                } else {
                    node.setChildren([]);
                }
            };

            update_children(node, cond_f(scope));

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    update_children(node, cond_f(scope));
                    node.trigger();
                });
            }

            return node;
        },

        casewhen: function (scope, parent, children, exprs, expr, default_idx, deps) {
            var self = this,
                expr_f = this.__unwrap(expr),
                node = this.mCreateFragment('casewhen');

            var update_children = function (node) {
                var result, left, right,
                    resultGot = false;

                for (var i = 0; i < exprs.length; i++) {
                    left = expr_f(scope);
                    right = self.__unwrap(exprs[i].e)(scope);
                    if (left === right ||
                       (typeof left === 'number' && typeof right === 'number' &&
                        isNaN(left) === true && isNaN(right) === true) ) {

                        resultGot = true;
                        node.setChildren(children[exprs[i].c](scope));
                        break;
                    }
                }

                if (!resultGot) {
                    if (default_idx !== null) {
                        node.setChildren( children[default_idx](scope) );
                    } else {
                        node.setChildren([]);
                    }
                }
            };

            update_children(node);

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    update_children(node);
                    node.trigger();
                });
            }

            return node;
        },

        include: function (scope, parent, href, withExpr, origin, deps) {
            var node = this.mCreateFragment('include'),
                with_f, href_f = this.__unwrap(href);

            if (withExpr) {
                with_f = this.__unwrap(withExpr);
            }

            var update_children = (function () {
                var href_val = href_f(scope);
                var with_val = with_f ? with_f(scope) : false;
                var origin_dir = this.__dirname(origin);
                var subscope = scope;

                if (with_val && typeof with_val === 'object') {
                    subscope = this.__fork(scope);
                    for (var i in with_val) {
                        if (with_val.hasOwnProperty(i)) {
                            subscope[i] = with_val[i];
                        }
                    }
                }

                var children = this.__templateManager.get(href_val, origin_dir);
                node.setChildren(children(subscope, this).children);
            }).bind(this);

            update_children();

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    update_children();
                    node.trigger();
                });
            }

            return node;
        },

        mixin: function (scope, parent, children, name, args, ellipsis) {
            if (this.__mixins[name]) {
                console.warn('Warning: Mixin ' + name + ' overrided!');
            }

            this.__mixins[name] = {
                block: children,
                args: args,
                ellipsis: ellipsis
            };

            return this.mCreateFragment();
        },

        mixincall: function (scope, parent, children, name, args, attrs, decors, deps) {
            if (!this.__mixins[name]) {
                throw 'Calling mixin not defined: ' + name;
            }

            var mixin = this.__mixins[name];
            var node = this.mCreateFragment('mixincall ' + name);
            var subscope = this.__fork(scope);
            subscope.attributes = attrs;
            subscope.__mixin_block_callback = children;
            subscope.arguments = [];

            if (mixin.ellipsis)
                subscope[mixin.ellipsis] = [];

            for (var i = 0; i < args.length; i++) {
                var arg = this.__unwrap(args[i].expr)(scope);
                var arg_deps = args[i].deps;

                if (!mixin.args[i]) {
                    if (mixin.ellipsis) {
                        subscope[mixin.ellipsis].push(arg);
                    }
                } else {
                    subscope[mixin.args[i]] = arg;
                }

                subscope.arguments[i] = arg;
            }

            node.setChildren( mixin.block(subscope) );

            return this.__decorate(node, subscope, decors);
        },

        mixinblock: function (scope, parent) {
            var node = this.mCreateFragment('mixinblock');

            if (typeof scope.__mixin_block_callback !== 'function') {
                console.warn('Warning: wrong mixin block operator should be inside mixin!');
            } else {
                node.setChildren(scope.__mixin_block_callback(scope));
            }

            return node;
        }
    };

    return BaseGenerator;
})( (typeof module !== 'undefined' && module.exports) ? require('q') : Q);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseGenerator;
}
