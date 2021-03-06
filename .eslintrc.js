module.exports = {
    root: true,
    env: {
        node: true
    },
    parserOptions: {
        sourceType: 'module',
        parser: 'babel-eslint',
        ecmaVersion: '2015'
    },
    extends: ['plugin:prettier/recommended'],
    // required to lint *.vue files
    plugins: ['prettier', 'html'],
    // add your custom rules here
    rules: {
        'prettier/prettier': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
};
