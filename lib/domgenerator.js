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

    var walkNodes = function (nodes, document, onchange) {
        return nodes ? nodes.map(function (i) {
            return walkNode(i, document, onchange);
        }) : [];
    }

    var update_element = function (node, document, onchange) {
        update_attributes(node.$, node);
        update_children(node.$, flatten( walkNodes(node.children, document, onchange) ));
    }

    var walkNode = function (node, document, onchange) {
        node.listen(function () {
            var closest = closestElement(node);

            if (closest) {
                if (closest.type === 1) {
                    update_element(closest, document, onchange);
                } else {
                    if (typeof onchange === 'function') {
                        onchange(function (element) {
                            var childNodes = flatten(walkNodes(closest.children, document, onchange));
                            update_children(element, childNodes);
                        });
                    }
                }
            } else {
                console.error('No root element!');
            }
        });

        switch (node.type) {
            case 0:
                if (!node._cache) {
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
                var el = node._cache || document.createElement(node.tagName || 'div');
                node._cache = el;
                node.$ = node._cache;
                update_element(node, document, onchange);

                break;
            case 2:
            case 5:
                node._cache = flatten(walkNodes(node.children, document, onchange));
                break;

            case 3:
                node._cache = node._cache || document.createComment(node.comment);
                node.$ = node._cache;
                break;

            case 4:
                node._cache = [];
                break;
        }

        return node._cache;
    }

    return function (node, document, onchange) {
        return flatten(walkNode(node, document, onchange));
    };
})();
