/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = (function () {
    var walkNodes = function (nodes) {
        return nodes ? nodes.map(function (i) {
            return walk(i);
        }).join('') : [];
    };

    var attrs = function (attrs) {
        var ret = [];
        for (i in attrs) {
            if (attrs.hasOwnProperty(i)) {
                if (attrs[i])
                    ret.push(i+'="' + attrs[i] + '"');
            }
        }

        return ret.length ? ' '+ret.join(' ') : '';
    };

    var walk = function (node) {
        switch (node.type) {
            case 0:
                return node.html;
            case 1:
                return node.selfClosing ?
                    '<'+(node.tagName||'div')+attrs(node.attributes)+' />' :
                    '<'+(node.tagName||'div')+attrs(node.attributes)+'>'+walkNodes(node.children)+'</'+(node.tagName||'div')+'>';
            case 5:
            case 2:
                return walkNodes(node.children);
            case 3:
                return '<!--' + walkNodes(node.children) + '-->';
            case 4:
                return '<!DOCTYPE ' + node.doctype + '>';
        }
    }

    return walk;
})();
