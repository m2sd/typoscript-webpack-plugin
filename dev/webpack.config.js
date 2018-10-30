const path = require('path');
const Self = require('..');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    mode: 'development',
    module: {
        rules: [
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [new Self({ loading: true })],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
