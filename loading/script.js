'use strict';

(function(root, doc) {
    if (!Node) {
        var Node = {};
    }
    if (!Node.COMMENT_NODE) {
        // numeric value according to the DOM spec
        Node.COMMENT_NODE = 8;
    }

    function getComments(elem) {
        var children = elem.childNodes;
        var comments = [];

        for (var i = 0, len = children.length; i < len; i++) {
            if (children[i].nodeType == Node.COMMENT_NODE) {
                comments.push(children[i]);
            }
        }
        return comments;
    }

    root.addEventListener('load', function() {
        getComments(doc.head).forEach(function(node) {
            console.log(node.nodeValue);
        });
    });
})(window, document);
