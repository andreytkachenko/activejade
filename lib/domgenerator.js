/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = (function () {
    var isNodeEqual = function(node1, node2) {
        var types = [ 3, 8 ];

        return (node1 === node2) ||
               (node1.nodeType === node2.nodeType &&
                ~types.indexOf(node1.nodeType) &&
                node1.data === node2.data);
    }

    var update_children = function(current, target) {
        var index = 0;
        var pending = [];
        var el, idx;

        var hasChildNode = function(elements, node) {
            for (var i = 0; i < elements.length; i++) {
                if (isNodeEqual(elements[i], node)) {
                    return true;
                }
            }

            return false;
        }

        var getNodeIndex = function (el, node) {
            var idx = 0, tmp;
            while(tmp = el.childNodes[idx]) {
                if (isNodeEqual(node, tmp)) return idx;
                idx++;
            }

            return -1;
        };

        var insertAt = function (el, node, index) {
            var nodeBefore = current.childNodes[index];

            if (nodeBefore) {
                el.insertBefore(node, nodeBefore);
            } else {
                el.appendChild(node);
            }
        }

        while(current.childNodes[index]) {
            el = current.childNodes[index];

            if (!hasChildNode(target, el)) {
                current.removeChild(el);
            } else {
                index++;
            }
        }

        index = 0;
        while (el = target[index]) {
            idx = getNodeIndex(current, el);

            if (idx !== -1) {
                if (idx !== index) {
                    insertAt(current, el, index);
                }
            } else {
                insertAt(current, el, index);
            }

            index++;
        }

        return current;
    }

    var update_attributes = function (el, node) {
        var attrs = {},
            attrName, attrValue;

        for (var i = 0; i < el.attributes.length; i++) {
            attrName = el.attributes[i].name;
            attrValue = el.attributes[i].nodeValue;

            if (node.attributes[attrName]) {
                if (node.attributes[attrName] !== attrValue) {
                    el.setAttribute(attrName, node.attributes[attrName]);
                }

                attrs[ attrName ] = true;
            } else {
                el.removeAttribute(attrName);
            }
        }

        for (var i in node.attributes) {
            if ( node.attributes[i] &&
                !attrs[i] && node.attributes.hasOwnProperty(i)) {

                el.setAttribute(i, node.attributes[i]);
            }
        }
    }

    var flatten = function (arr) {
        return arr.reduce(function (acc, elems) {
            if (elems instanceof Array) {
                elems.forEach(function (ch) {
                    acc.push(ch);
                });
            } else if (elems) {
                acc.push(elems);
            }

            return acc;
        }, []);
    }

    var closestElement = function (node) {
        if (node) {
            if (node.type === 1 || node.type === 5) return node;
            if (node.parent) return closestElement(node.parent);
        }

        return null;
    }

    var update_element = function ($el, node, document, onchange) {
        update_attributes($el, node);
        update_children($el, walkNodes(node.children, document, onchange) );
    }

    var ancestors = function (node, path) {
        path = path || [];
        if (node) {
            path.unshift(node);

            if (node.type === 1 || node.type === 5) {
                return path;
            } else if (node.parent) {
                return ancestors(node.parent, path);
            }
        }

        return null;
    }

    var walkNodes = function (nodes, document, onchange, path) {
        return nodes ? flatten(nodes.map(function (i) {
            return walkNode(i, document, onchange, path);
        })) : [];
    }

    var walkNode = function (node, document, onchange, path) {
        if (!node._cache) {
            node.listen(function () {
                var path;
                if (node.type === 1) {
                    update_attributes(node._cache, node);
                } else {
                    path = ancestors(node);
                    walkNode(path[0], document, onchange, path);
                }
            });
        }
        var update = false;
        if (path) {
            if (path instanceof Array) {
                if (path.length) {
                    update = path[0] === node;
                    path = path.slice(1);
                }
            } else {
                update = true;
            }
        }

        switch (node.type) {
            case 0:
                if (!node._cache || update) {
                    node._cache = [];

                    var el = document.createElement('div');
                    el.innerHTML = node.html;
                    while (el.firstChild) {
                        var sub_el = el.firstChild;
                        el.removeChild(sub_el);
                        node._cache.push(sub_el);
                    }
                    delete el;
                }

                break;
            case 1:
                if (!node._cache) {
                    node._cache = document.createElement(node.tagName || 'div');
                    update_attributes(node._cache, node);
                    update_children(node._cache, walkNodes(node.children, document, onchange, path) );
                    node.link(node._cache);
                } else if (update) {
                    update_children(node._cache, walkNodes(node.children, document, onchange, path) );
                }

                break;
            case 2:
                if (!node._cache || update) {
                    node._cache = walkNodes(node.children, document, onchange, path);
                }

                break;
            case 5:
                if (!node._cache || update) {
                    node._cache = walkNodes(node.children, document, onchange, path);

                    if (typeof onchange === 'function') {
                        onchange(function (element) {
                            update_children(element, node._cache);
                        });
                    }
                }

                break;
            case 3:
                if (!node._cache) {
                    node._cache = document.createComment(node.comment);
                    node.link(node._cache);
                } else if (update) {
                    node._cache.data = node.comment
                }

                break;

            default:
            case 4:
                node._cache = [];
                break;
        }

        return node._cache;
    }

    return function (node, document, onchange) {
        return flatten(walkNode(node, document, onchange, true));
    };
})();
