'use strict';

window.addEventListener('load', function() {
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
            if (children[i].nodeType === Node.COMMENT_NODE) {
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
        loaded = document.styleSheets.length;
    getComments(document.head).forEach(function(node) {
        var match = node.nodeValue.match(/^\s*(<link[\s\S]+rel=")alternate stylesheet("[\s\S]+(?:>|<\/link>))\s*$/);
        if (match) {
            document.head.replaceChild(createElementFromHTML(match[1]+'stylesheet'+match[2]), node);
            loading++;
        }
    });

    var expected = loaded + loading;
    var check = setInterval(function() {
        if (document.styleSheets.length >= expected) {
            setTimeout(function() {
                document.getElementById('webpack-plugin-loader').style.opacity = 0;
                setTimeout(function() {
                    document.querySelectorAll(
                        '#webpack-plugin-loader,' +
                            'script[src*="webpack-loading.js"],' +
                            'link[href*="webpack-loading.css"]'
                    ).forEach(function(node) {
                        node.parentElement.removeChild(node);
                    });
                }, 500);
            }, 500);
            clearInterval(check);
        }
    }, 10);
});
