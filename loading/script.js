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

    function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes
        return div.firstChild;
    }

    var loading = 0,
        loaded = doc.styleSheets.length;
    getComments(doc.head).forEach(function(node) {
        if (/^\s*<link\s+rel="stylesheet"/.test(node.nodeValue)) {
            doc.head.replaceChild(createElementFromHTML(node.nodeValue), node);
            loading++;
        }
    });

    var expected = loaded + loading;
    var check = setInterval(function() {
        if (doc.styleSheets.length >= expected) {
            doc.getElementById('webpack-plugin-loader').style.opacity = 0;
            setTimeout(function() {
                doc.querySelectorAll(
                    '#webpack-plugin-loader,' +
                        'script[src$="webpack-loading.js"],' +
                        'link[href$="webpack-loading.css"]'
                ).forEach(function(node) {
                    node.parentElement.removeChild(node);
                });
            }, 500);
            clearInterval(check);
        }
    }, 10);
})(window, document);
