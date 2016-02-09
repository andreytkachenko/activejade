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
        this.type = (Q.isPending(promise) && 'wait') ||
                    (Q.isRejected(promise) && 'error') || 'resolved';
        this.message = 'sasas';
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
        prepend: function (children) {
            this.children = this.children || [];

            if ( children instanceof Array ) {
                for (var i = children.length - 1; i >= 0; i-- ) {
                    this.appendChild(children[i], 0);
                }
            } else if (children instanceof BaseNode) {
                this.appendChild(children, 0);
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
        hasListener: function (callback) {
            return this._listeners && ~this._listeners.indexOf(callback);
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
        this.__file_cache = {};
        this.__templates = options.templates || {};
        this.__mixins = options.mixins || {};

        this.__decorators = Object.assign({
            on: function (node, scope, args, deps) {
                console.log(args);
                var eventNameArg = args[0];
                var callbackArg = args[1];
                var optionsArg = args[2];

                var eventName = self.__unwrap(eventNameArg.e)(scope);
                var callback = self.__unwrap(callbackArg.e);
                var options = self.__unwrap(optionsArg.e);

                if (typeof callback === 'function') {
                    node.$.then(function ($el) {
                        $el.on(eventName, function () {
                            callback.call($el, scope, {
                                $event: event
                            });

                            if (callbackArg.m) {
                                for (var i = 0; i < callbackArg.m.length; i ++) {
                                    callbackArg.m[i]
                                }
                            }
                        })
                    });
                }

                return node;
            }
        }, options.decorators || {});
        this.__loader = options.loader;
        this.__watch = options.watch;
        this.__blocks = options.blocks || {
            head: null,
            blocks: {},
            index: {},
            links: {}
        };
    }

    BaseGenerator.prototype = {
        __cache: null,
        __mixins: null,
        __decorators: null,
        __templates: null,
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
        __template: function (name, dir) {
            if (this.__templates[name]) {
                return {
                    name: name,
                    tpl: this.__templates[name]
                };
            } else if (dir) {
                var tpl_name = dir + '/' + name.replace(/^(\.\/)+/i, '');
                if (!this.__templates[tpl_name]) {
                    throw new Error('Include Error: resource "' + name + '" not found!');
                }

                return {
                    tpl: this.__templates[tpl_name],
                    name: tpl_name
                };
            } else {
                throw new Error('Include Error: resource "' + name + '" not found!');
            }
        },
        __cache: function (name) {
            return this.__file_cache[name];
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
        __p: function (id, ctx, value) {
            if (!Q.isPromise(value)) {
                return ctx[id] = value;
            } else {
                if (Q.isPending(value) || Q.isRejected(value)) {
                    throw new PromiseException(value);
                } else {
                    return ctx[id] = value.valueOf();
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
            escape: function (value) {
                return String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
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
            var ctx = this['i_'+name].apply(this, args),
                updated = false, visited = [];

            var update = function () {
                try {
                    ctx.update();
                    ctx.node.trigger();
                } catch (e) {
                    if (e.name !== 'PromiseException') {
                        throw e;
                    } else {
                        if (visited.indexOf(e.promise) === -1) {
                            visited.push(e.promise);
                            e.promise.then(update, update);
                        }

                        if (ctx.except) {
                            ctx.except(e.type, e.message, e.promise);
                            ctx.node.trigger();
                        }
                    }
                }
            }

            if (ctx.update && ctx.deps && ctx.deps.length && this.__watch) {
                this.__watch(ctx.scope, ctx.deps, function () {
                    updated = true;
                    update();
                });
            }

            if (ctx.update && !updated)
                update();

            return ctx.node;
        },

        mCreateDoctype: function (type) {
            return new BaseNode(NODE_DOCTYPE, {
                doctype: type
            });
        },
        mCreateTag: function (type, selfClosing) {
            return new BaseNode(NODE_ELEMENT, {
                tagName: type,
                selfClosing: selfClosing
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

        generate: function (children, filename) {
            var node = new BaseNode(NODE_DOCUMENT);
            node.append(children);
            this.__file_cache[filename] = node;

            return node;
        },

        /** Public Interface **/

        i_doctype: function (scope, parent, doctype) {
            return {
                node: this.mCreateDoctype(doctype),
                scope: scope
            };
        },

        i_text: function (scope, parent, text, deps) {
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

        i_statement: function (scope, parent, expr, deps) {
            var node = this.mCreateFragment('statement'),
                expr_f = this.__unwrap(expr);

            // console.log('Node Id: ', node.id);

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    expr_f(scope);
                }
            };
        },

        i_tag: function (scope, parent, children, name, attrs, self_closing, decors, deps) {
            var node = this.mCreateTag(name, self_closing);
            var attrs_f = this.__unwrap(attrs);
            var self = this;

            node.setChildren(children(scope));
            node = this.__decorate(node, scope, decors);

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var attr, attrs_u;

                    if (attrs) {
                        attrs_u = attrs_f(scope);
                        for (var i in attrs_u) {
                            if (attrs_u.hasOwnProperty(i)) {
                                attr = attrs_u[i];

                                if (i === 'id') {
                                    self.__set_id(attr, node);
                                }

                                node.setAttribute(i, attr);
                            }
                        }
                    }
                }
            };
        },

        i_dowhile: function (scope, parent, children, expr, except, deps) {
            var node = this.mCreateFragment('while'),
                expr_f = this.__unwrap(expr),
                cache = {};

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var _children = [];
                    try {
                        while (expr_f(scope)) {
                            _children = _children.concat(children(scope));
                        }
                    } catch(e) {
                        if (e.name === 'PromiseException') {
                            throw e;
                        }
                    }

                    node.setChildren(_children);
                },
                except: function (type, message) {
                    var subscope = scope;
                        except = except || {};

                    switch (type) {
                        case 'wait':
                            node.setChildren(cache['wait'] ||
                                    (cache['wait'] = except.w ? except.w(subscope) : []));
                            break;
                        case 'error':
                            if (!cache['error']) {
                                if (except.i) {
                                    subscope = self.__fork(scope);
                                    subscope[except.i] = message;
                                }

                                cache['error'] = except.e ? except.e(subscope) : [];
                            }
                            node.setChildren(cache['error']);
                            break;

                        default: throw new Error('Unknown type of exception ' + type + '!');
                    }
                }
            };
        },

        i_forin: function (scope, parent, children, expr, value_name, key_name, cond, elsecase, except, deps) {
            var node = this.mCreateFragment('forin'),
                expr_f = this.__unwrap(expr),
                cond_f = this.__unwrap(cond),
                self = this, cache = {};

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var subscope, ctx,
                        _children = [],
                        expr_val = expr_f(scope);

                    var iteration = function (key, value) {
                        subscope = self.__fork(scope);
                        subscope[value_name] = value;
                        subscope[key_name || '$key'] = key;

                        return cond_f(subscope) ? children(subscope) : [];
                    }

                    if (expr_val) {
                        if (expr_val instanceof Array) {
                            for (var i = 0; i < expr_val.length; i++) {
                                _children = _children.concat(iteration(i, expr_val[i]));
                            }
                        } else {
                            for (var i in expr_val) {
                                if (expr_val.hasOwnProperty(i)) {
                                    _children = _children.concat(iteration(i, expr_val[i]));
                                }
                            }
                        }
                    } else {
                        _children = elsecase ? elsecase(scope) : [];
                    }

                    node.setChildren(_children);
                },

                except: function (type, message) {
                    var subscope = scope;
                        except = except || {};

                    switch (type) {
                        case 'wait':
                            node.setChildren(cache['wait'] ||
                                    (cache['wait'] = except.w ? except.w(subscope) : []));
                            break;
                        case 'error':
                            if (!cache['error']) {
                                if (except.i) {
                                    subscope = self.__fork(scope);
                                    subscope[except.i] = message;
                                }

                                cache['error'] = except.e ? except.e(subscope) : [];
                            }
                            node.setChildren(cache['error']);
                            break;

                        default: throw new Error('Unknown type of exception ' + type + '!');
                    }
                }
            };
        },

        i_ifelse: function (scope, parent, children, cond, except, deps) {
            var node = this.mCreateFragment('ifelse'),
                cond_f = this.__unwrap(cond),
                cache = {};

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    if (cond_f(scope)) {
                        node.setChildren( cache['true'] || (cache['true'] = children[0](scope)) );
                    } else if (children[1]) {
                        node.setChildren( cache['false'] || (cache['false'] = children[1](scope)) );
                    } else {
                        node.setChildren([]);
                    }
                },
                except: function (type, message) {
                    var subscope = scope;
                        except = except || {};

                    switch (type) {
                        case 'wait':
                            node.setChildren(cache['wait'] ||
                                    (cache['wait'] = except.w ? except.w(subscope) : []));
                            break;
                        case 'error':
                            if (!cache['error']) {
                                if (except.i) {
                                    subscope = self.__fork(scope);
                                    subscope[except.i] = message;
                                }

                                cache['error'] = except.e ? except.e(subscope) : [];
                            }
                            node.setChildren(cache['error']);
                            break;
                        default: throw new Error('Unknown type of exception ' + type + '!');
                    }
                }
            };
        },

        i_casewhen: function (scope, parent, children, exprs, expr, default_idx, except, deps) {
            var node = this.mCreateFragment('casewhen'),
                expr_f = this.__unwrap(expr),
                self = this;

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var result, left, right,
                        _children;

                    for (var i = 0; i < exprs.length; i++) {
                        left = expr_f(scope);
                        right = self.__unwrap(exprs[i].e)(scope);
                        if (left === right ||
                           (typeof left === 'number' && typeof right === 'number' &&
                            isNaN(left) === true && isNaN(right) === true) ) {

                            _children = children[exprs[i].c](scope);
                            break;
                        }
                    }

                    if (!_children) {
                        if (default_idx !== null) {
                            _children = children[default_idx](scope);
                        } else {
                            _children = [];
                        }
                    }

                    node.setChildren(_children);
                },
                except: function (type, message) {
                    var subscope = scope;
                        except = except || {};

                    switch (type) {
                        case 'wait': node.setChildren(except.w ? except.w(subscope) : []); break;
                        case 'error': {
                            if (except.i) {
                                subscope = self.__fork(scope);
                                subscope[except.i] = message;
                            }
                            node.setChildren(except.e ? except.e(subscope) : []); break;
                            break;
                        }
                        default: throw new Error('Unknown type of exception ' + type + '!');
                    }
                }
            };
        },

        i_include: function (scope, parent, href, withExpr, except, origin, deps) {
            var node = this.mCreateFragment('include'),
                with_f = this.__unwrap(withExpr),
                href_f = this.__unwrap(href),
                self = this, useCache = false;

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var href_val = href_f(scope);
                    var with_val = with_f ? with_f(scope) : false;
                    var origin_dir = self.__dirname(origin);
                    var subscope = scope
                    var children;

                    if (with_val && typeof with_val === 'object') {
                        subscope = self.__fork(scope);
                        for (var i in with_val) {
                            if (with_val.hasOwnProperty(i)) {
                                subscope[i] = with_val[i];
                            }
                        }
                    }

                    if (!useCache || !(children = self.__cache[self.__file_name(href_val, origin_dir)])) {
                        children = self.__template(href_val, origin_dir).tpl(subscope, self).children;
                    }

                    node.setChildren(children);
                },
                except: function (type, message) {
                    var subscope = scope;
                        except = except || {};

                    switch (type) {
                        case 'wait': node.setChildren(except.w ? except.w(subscope) : []); break;
                        case 'error': {
                            if (except.i) {
                                subscope = self.__fork(scope);
                                subscope[except.i] = message;
                            }
                            node.setChildren(except.e ? except.e(subscope) : []); break;
                            break;
                        }
                        default: throw new Error('Unknown type of exception ' + type + '!');
                    }
                }
            };
        },

        i_mixin: function (scope, parent, children, name, args, ellipsis) {
            if (this.__mixins[name]) {
                console.warn('Warning: Mixin ' + name + ' overrided!');
            }

            this.__mixins[name] = {
                block: children,
                args: args,
                ellipsis: ellipsis
            };

            return {
                node: this.mCreateFragment('mixin'),
                scope: scope
            };
        },

        i_mixincall: function (scope, parent, children, name, args, attrs, decors, deps) {
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

            node = this.__decorate(node, subscope, decors);

            return {
                node: node,
                scope: scope
            };
        },

        i_mixinblock: function (scope, parent) {
            var node = this.mCreateFragment('mixinblock');

            if (typeof scope.__mixin_block_callback !== 'function') {
                console.warn('Warning: wrong mixin block operator should be inside mixin!');
            } else {
                node.setChildren(scope.__mixin_block_callback(scope));
            }

            return {
                node: node,
                scope: scope
            };
        },
        i_extend: function (scope, href, origin, deps) {
            var node = this.mCreateFragment('extend'),
                href_f = this.__unwrap(href),
                self = this;

            var tail = function (current, links) {
                while (links[current])
                    current=links[current];

                return current;
            }

            var path = function (head, links) {
                var current = head,
                    path = [ head ];

                while (links[current]) {
                    current = links[current];
                    path.unshift(current);
                }

                return path;
            }

            var update_block = function (id, blocks) {
                var children, node, root;
                var route = path(blocks.head, blocks.links).map(function (i) {
                    return (blocks.index[i]||{})[id];
                });

                node = route.shift();
                children = node.children;
                root = node.node;

                while (route.length) {
                    node = route.shift();
                    if (node) {
                        switch (node.embed) {
                            case 'APPEND': children = children.concat(node.children); break;
                            case 'PREPEND': children = node.children.concat(children); break;
                            default: children=node.children;
                        }
                    }
                }

                root.setChildren(children);
            }

            return {
                node: node,
                scope: scope,
                deps: deps,
                update: function () {
                    var href_val = href_f(scope);
                    var origin_dir = self.__dirname(origin);
                    var template = self.__template(href_val, origin_dir);
                    var children = self.__cache(template.name) || template.tpl(scope, self).children;
                    var blocks;

                    if (self.__blocks.head === null) {
                        self.__blocks.head = origin;
                    }

                    self.__blocks.links[origin] = template.name;
                    blocks = self.__blocks.blocks[tail(origin, self.__blocks.links)];

                    if (blocks) {
                        for (var i = 0; i < blocks.length; i++) {
                            update_block(blocks[i].id, self.__blocks);
                        }
                    }

                    node.setChildren(children);
                },
                except: function () {
                    node.setChildren([]);
                }
            };
        },
        i_block: function (scope, id, embed, children, extend, origin) {
            var node = this.mCreateFragment('block ' + id),
                self = this,
                block = {
                    node: node,
                    children: children(scope),
                    id: id,
                    embed: embed
                };

            if (!this.__blocks.blocks[origin]) {
                this.__blocks.blocks[origin] = [];
                this.__blocks.index[origin] = {};
            }

            this.__blocks.index[origin][id] = block;
            this.__blocks.blocks[origin].push(block);

            return { node: node, scope: scope };
        },
        i_superblock: function () {
            throw new Error('Unimplemented!');
        }
    };

    return BaseGenerator;
})( (typeof module !== 'undefined' && module.exports) ? require('q') : Promise);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseGenerator;
}
