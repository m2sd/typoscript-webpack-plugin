const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPluin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
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
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new MiniCssExtractPluin(),
        new Self({
            outputPath: path.join(__dirname, 'dist', 'typoscript'),
            loading: {
                customSource: path.join(__dirname, 'src', 'loading'),
                background: '#333'
            },
            typoScriptPublicPath: '/'
        }),
        new ManifestPlugin()
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist', 'assets')
    },
    watch: process.env.WATCH_MODE === 'on'
};
