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

var BaseGenerator = (function() {
    var NODE_HTML = 0,
        NODE_ELEMENT = 1,
        NODE_FRAGMENT = 2,
        NODE_COMMENT = 3,
        NODE_DOCTYPE = 4,
        NODE_DOCUMENT = 5;

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
    };

    BaseNode.counter = 0;

    BaseNode.prototype = {
        id: null,
        type: NODE_ELEMENT,
        parent: null,
        attributes: null,
        eventListeners: null,
        children: null,
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
                throw Error("Replacing nodes shouldn't be empty");
            }

            var idx = this.children.indexOf(_old[0]);

            if (idx === -1) {
                throw new Error('Replacing elements not found');
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
        __decorate: function (node, scope, decorators) {
            var tmp = node;
            for (var i = decorators.length - 1; i >= 0; i--) {
                var dec = decorators[i];
                if (this.__decorators[dec.id]) {
                    tmp = this.__decorators[dec.id](tmp, scope, dec.args, dec.deps);
                } else {
                    console.warn('Warning: decorator ' + dec.id + ' is not registered!');
                }
            }

            return tmp;
        },
        __unwrap: function (value) {
            return function (scope) {
                return typeof (value) === 'function' ? value.call(this, scope) : value;
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
            var text_f = this.__unwrap(text);
            var original = this.mCreateText(text_f(scope));
            var self = this;

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    var _old = original,
                        _new = self.mCreateText(text_f(scope));
                    parent().replaceChildren(_old, _new);
                    original = _new;
                });
            }

            return original;
        },

        statement: function (scope, parent, expr, deps) {
            var self = this;
            var expr_f = this.__unwrap(expr);

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    expr_f(scope);
                });
            }

            expr_f(scope);

            return this.mCreateFragment();
        },

        tag: function (scope, parent, children, name, attrs, decors, deps) {
            var tag = this.mCreateTag(name);
            var update_attrs, attrs_f;

            if (attrs) {
                attrs_f = this.__unwrap(attrs);
                update_attrs = (function () {
                    var attrs = attrs_f(scope);
                    for (var i in attrs) {
                        if (attrs.hasOwnProperty(i)) {
                            tag.setAttribute(i, this.__unwrap(attrs[i])(scope));
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
            var original,
                self = this,
                expr_f = this.__unwrap(expr);

            var update_children = function () {
                var df = self.mCreateFragment();

                while (expr_f(scope)) {
                    df.append(children(scope));
                }

                return df;
            };

            original = update_children();

            if (deps.length && this.__watch) {
                this.__watch(scope, deps, function () {
                    var _old = original,
                        _new = update_children(),
                        _parent = parent();

                    _parent.replaceChildren(_old, _new);
                    _parent.trigger();
                    original = _new;
                });
            }

            return original;
        },

        forin: function (scope, parent, children, expr, value, key, cond, deps) {
            var expr_f = this.__unwrap(expr),
                cond_f = this.__unwrap(cond),
                self = this;

            var update_children = function (expr_val) {
                var subscope;

                var df = self.mCreateFragment();
                if (expr_val instanceof Array) {
                    for (var i = 0; i < expr_val.length; i++) {
                        subscope = self.__fork(scope);
                        if (key) {
                            subscope[key] = i;
                        }
                        subscope[value] = expr_val[i];
                        if (cond_f(subscope)) {
                            df.append(children(subscope));
                        }
                    }
                } else {
                    for (var i in expr_val) {
                        if (expr_val.hasOwnProperty(i)) {
                            subscope = self.__fork(scope);
                            if (key) {
                                subscope[key] = i;
                            }
                            subscope[value] = expr_val[i];

                            if (cond_f(subscope)) {
                                df.append(children(subscope));
                            }
                        }
                    }
                }

                return df;
            };

            var original = update_children(expr_f(scope));

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    var _old = original,
                        _new = update_children(expr_f(scope)),
                        _parent = parent();

                    _parent.replaceChildren(_old, _new);
                    _parent.trigger();

                    original = _new;
                });
            }

            return original;
        },

        ifelse: function (scope, parent, children, cond, deps) {
            var self = this,
                cond_f = self.__unwrap(cond),
                original, val_true, val_false, val_unknown;

            var update_children = function (value) {
                var res;

                if (value) {
                    if (!val_true) {
                        val_true = self.mCreateFragment();
                        val_true.append(children[0](scope));
                    }

                    res = val_true;
                } else if (children[1]) {
                    if (!val_false) {
                        val_false = self.mCreateFragment();

                        val_false.append(children[1](scope));
                    }

                    res = val_false;
                } else {
                    if (!val_unknown) {
                        val_unknown = self.mCreateFragment();
                    }

                    res = val_unknown;
                }

                return res;
            };

            original = update_children(cond_f(scope));

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, function () {
                    var _old = original,
                        _new = update_children(cond_f(scope)),
                        _parent = parent();

                    _parent.replaceChildren(_old, _new);
                    _parent.trigger();
                    original = _new;
                });
            }

            return original;
        },

        casewhen: function (scope, parent, children, exprs, expr, default_idx, deps) {
            var expr_f = this.__unwrap(expr);
            var self = this;
            var __cache = {};

            var update_children = function () {
                var result, left, right,
                    resultGot = false;

                for (var i = 0; i < exprs.length; i++) {
                    left = expr_f(scope);
                    right = self.__unwrap(exprs[i].e)(scope);
                    if (left === right ||
                       (typeof left === 'number' && typeof right === 'number' &&
                        isNaN(left) === true && isNaN(right) === true) ) {

                        resultGot = true;

                        if (!__cache[i]) {
                            __cache[i] = self.mCreateFragment();
                            __cache[i].append(children[exprs[i].c](scope));
                        }

                        result = __cache[i];
                        break;
                    }
                }

                if (!resultGot) {
                    if (default_idx !== null) {
                        if (!__cache.default_idx) {
                            __cache.default_idx = self.mCreateFragment();
                            __cache.default_idx.append(children[default_idx](scope));
                        }

                        result = __cache.default_idx;
                    } else {
                        result = self.mCreateFragment();
                    }
                }

                return result;
            };

            var original = update_children();

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, (function () {
                    var _old = original,
                        _new = update_children(),
                        _parent = parent();

                    _parent.replaceChildren(_old, _new);
                    _parent.trigger();
                    original = _new;
                }).bind(this));
            }

            return original;
        },

        include: function (scope, parent, href, withExpr, origin, deps) {
            var with_f,
                href_f = this.__unwrap(href);

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

                var nodes = this.__templateManager.get(href_val, origin_dir)(subscope, this);
                var df = this.mCreateFragment();
                df.append(nodes);

                return df;
            }).bind(this);

            var original = update_children();

            if (this.__watch && deps.length) {
                this.__watch(scope, deps, (function () {
                    var _old = original,
                        _new = update_children(),
                        _parent = parent();

                    _parent.replaceChildren(_old, _new);
                    _parent.trigger();
                    original = _new;
                }).bind(this));
            }

            return original;
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

            var df = this.mCreateFragment();
            df.append(mixin.block(subscope));

            return this.__decorate(df, subscope, decors);
        },

        mixinblock: function (scope, parent) {
            var df = this.mCreateFragment();

            if (typeof scope.__mixin_block_callback !== 'function') {
                console.warn('Warning: wrong mixin block operator should be inside mixin!');
            } else {
                df.append(scope.__mixin_block_callback(scope));
            }

            return df;
        }
    };

    return BaseGenerator;
})();

if ( module && typeof module === 'object') {
    module.exports = BaseGenerator;
}
