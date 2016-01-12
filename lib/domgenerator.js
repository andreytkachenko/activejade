/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = (function () {
    var mapping = {};

    var flatten = function (arr) {
        return arr.reduce(function (acc, elems) {
            elems.forEach(function (ch) {
                acc.push(ch);
            });

            return acc;
        }, []);
    }

    var walkNodes = function (nodes, document) {
        return nodes ? nodes.map(function (i) {
            return walkNode(i, document);
        }) : [];
    }

    var walkNode = function (node, document) {
        var result;
        switch (node.type) {
            case 0:
                var el = document.createElement('div');
                result = [];
                el.innerHTML = node.html;
                while (el.firstChild) {
                    var sub_el = el.firstChild;
                    el.removeChild(sub_el);
                    result.push(sub_el);
                }
                delete el;

                break;
            case 1:
                var el = document.createElement(node.tagName || 'div');
                for (var i in node.attributes) {
                    if (node.attributes.hasOwnProperty(i)) {
                        if (node.attributes[i])
                            el.setAttribute(i, node.attributes[i]);
                    }
                }

                flatten(walkNodes(node.children, document)).forEach(function (element) {
                    el.appendChild(element);
                });

                result = [ el ];

                break;
            case 2:
                result = flatten(walkNodes(node.children, document));

                break;
            case 3:
                result = [ document.createComment(node.comment) ];

                break;
            case 4:
                result = [];
                break;
        }

        mapping[node.id] = result;

        return result;
    }

    return function (elements, document) {
        return flatten(walkNodes(elements, document));
    };
})();
