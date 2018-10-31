const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(
    path.join(__dirname, 'dist/WebpackAssets.typoscript'),
    'utf8'
);
const [source] = input.match(/<div id="webpack-plugin-loader">[\s\S]+<\/div>/);

const origin = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const output = origin.replace(
    /<div id="webpack-plugin-loader">[\s\S]*<\/div>/g,
    source
);
fs.writeFileSync(path.join(__dirname, 'index.html'), output);
