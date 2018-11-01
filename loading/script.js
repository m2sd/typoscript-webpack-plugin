'use strict';

(function(root, doc) {
    function createElementFromHTML(htmlString) {
        var div = doc.createElement('div');
        div.innerHTML = htmlString.trim();

        return div.firstChild;
    }
    function loadDeferredStyles() {
        var loading = 0,
            loaded = doc.styleSheets.length;
        doc.head
            .querySelectorAll('.webpack-plugin-defer')
            .forEach(function(node) {
                if (/^\s*<link[\s\S]+rel="stylesheet"/.test(node.textContent)) {
                    doc.body.replaceChild(
                        createElementFromHTML(node.textContent),
                        node
                    );
                    loading++;
                }
            });

        var expected = loaded + loading;
        var check = setInterval(function() {
            if (doc.styleSheets.length >= expected) {
                setTimeout(function() {
                    doc.getElementById(
                        'webpack-plugin-loader'
                    ).style.opacity = 0;
                    setTimeout(function() {
                        doc.querySelectorAll(
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
    }
    var raf =
        root.requestAnimationFrame ||
        root.mozRequestAnimationFrame ||
        root.webkitRequestAnimationFrame ||
        root.msRequestAnimationFrame;
    if (raf) {
        raf(function() {
            root.setTimeout(loadDeferredStyles, 0);
        });
    } else {
        root.addEventListener('load', loadDeferredStyles);
    }
})(window, document);
