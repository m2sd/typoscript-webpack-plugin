const path = require('path');
const MiniCssExtractPluin = require('mini-css-extract-plugin');
const Self = require('..');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    mode: 'development',
    module: {
        rules: [
            {
                test: /.css$/,
                use: [MiniCssExtractPluin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new MiniCssExtractPluin(),
        new Self({
            outputPath: path.join(__dirname, 'dist'),
            loading: {
                customSource: path.join(__dirname, 'src/loading'),
                background: '#333'
            },
            typoScriptPublicPath: '/dist/',
            typoScriptAdditionalDefaults: [
                'if.equals.data = levelfield:-2,backend_layout_next_level,slide',
                'if.equals.override.field = backend_layout'
            ]
        })
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
