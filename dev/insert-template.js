const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(
    path.join(__dirname, 'dist/WebpackAssets.typoscript'),
    'utf8'
);
const [template] = input.match(
    /<div id="webpack-plugin-loader">[\s\S]+<\/div>/
);
const [, style] = input.match(/<style type="text\/css">([\s\S]*)<\/style>/);

const origin = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const output = origin
    .replace(/<div id="webpack-plugin-loader">[\s\S]*<\/div>/g, template)
    .replace(
        /(<style id="webpack-plugin-style">)[\s\S]*(<\/style>)/g,
        `$1${style}$2`
    );
fs.writeFileSync(path.join(__dirname, 'index.html'), output);
