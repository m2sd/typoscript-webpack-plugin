# typoscript-webpack-plugin

Generate a typoscript file for webpack generated assets.  
I am rather new to webpack plugins so suggestions and pull requests are very welcome.  
And of course you are welcome to fork.

## Installation

I suggest installing as dependency rather then as devDependency as that is normally advisable for frontend projects.  
(In the end it does not make that much of a difference as you are unlikely to install your dependencies with the `NODE_ENV` set to production,
in which case though devDependencies are skipped)

```bash
npm i -S typoscript-webpack-plugin
```

or

```bash
yarn add typoscript-webpack-plugin
```

`webpack` is under peerDependencies so you'll have to install it yourself, but given that you're looking for plugins I'd surmise you already have it installed.

## Usage

In your webpack config, include it after any plugins that change the output files of your chunks (after the compilation finished, i.e. `afterEmit`).  
Normally you should be safe to include it last as it reads only basic settings of the compilation chunks. (namely `id`, `name` and `files`)

```javascript
// ...
const TypoScriptPlugin = require("typoscript-webpack-plugin");
// ...

module.exports = {
  // ...
  plugins: [
      // ... (other plugins)
      new TypoScriptPlugin(),
  ]
  // ...
}
```

This will generate a file `WebpackAssets.typoscript` in the same folder where `package.json` resides.  
`WebpackAssets.typoscript` will contain the following code:

```typo3_typoscript
page {
includeJSFooter {
webpack_chunkNameOrId = /fileadmin/Resources/Public/path-from-webpack-settings/filename.js
}
# if you use mini-css-extract-plugin
includeCSS {
webpack_chunkNameOrId = /fileadmin/Resources/Public/path-from-webpack-settings/filename.css
}
}
```

For more information about TypoScript and Typo3 please consult its [documentation](https://docs.typo3.org/).

## Configuration

The plugin tries to define sensible defaults, but as there are vastly different implementation styles out there,
I tried to make it as customizable as possible (for the limited functionality it has).  
If further customization is needed please don't shy away from creating an issue.

### Global options

| option                          | type                              | description                                                                                                                  | default                                                                                      |
| ------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `filename`                      | `string`                          | The name of the generated TypoScript file                                                                                    | `'WebpackAssets.typoscript'`                                                                 |
| `outputPath`                    | `string`                          | The absolute path to where the typoscript file will be generated                                                             | takes the folder from `module.parent.filename`, i.e. the folder where `package.json` resides |
| `typoScriptPublicPath`          | `string`                          | This is the path which generated assets will be prefixed with in the typoscript file                                         | `'/fileadmin/Resources/Public/'`                                                             |
| `typoScriptRootPath`            | `string`                          | The main wrapper for generated lines in the typoscript file                                                                  | `'page'`                                                                                     |
| `typoScriptIncludeTypeDefaults` | `Object` or `string`              | The default wrappers for generated lines per chunk and file extension (can be overwritten by chunk configuration, see below) | `{js: 'includeJSFooter', css: 'includeCSS'}`                                                 |
| `typoScriptAdditionalDefaults`  | `Object`, `Array` or `string`     | The default typoscript to be appended to includes (can be overwritten by chunk configuration, see below)                     | `null`                                                                                       |
| `chunks`                        | `Array` of `Object`s or `string`s | Configurations for specific chunks, if `null` all chunks will be included (see below)                                        | `null`                                                                                       |

#### `typoScriptIncludeTypeDefaults`

The option has three keys:

* `all` will be used for all file extensions
* `js` will be used for .js file extensions
* `css` will be used for .css file extensions

`all` will be used in **ADDITION** to the specific wrapper, i.e. if, for example, `all` and `js` are specified the generated lines will be included twice.  
If a `string` is provided it will be converted to an `Object` of the form `{all: <value>}`

#### `typoScriptAdditionalDefaults`

As with `typoScriptIncludeTypeDefaults`, `typoScriptAdditionalDefaults` has three keys and the same rules apply. (see above)  
The notable difference is that each key is an `Array` of typoscript lines to be appended to the include statement,
which means the include statement will not be repeated for `all`, it will merely be augmented with more typoscript code.  
`all` will be included before the extension specific typoscript.  
If a `string` is provided it is converted to an `Object` of the form `{all: [<value>]`.  
If an `Array` is provided it is converted to an `Object` of the form `{all: <value>}`.  
If a `string` is provided for any key in the `Object` it is converted to an `Array` containing only that string, e.g. `{js: 'string'}` => `{js: ['string']}`

For an example see the `additionalTyposcript` specification below.

### Chunk options

If the `chunks` option is defined, only chunks that are specified are considered by the code generation.  
Chunks can be specified multiple times (with different settings), which will result in a corresponding number of sets of generated lines from the same chunk.  
The `chunks` option is an `Array` containing `string`s (specifying a chunk name) or `Object`s with the following properties:

| option                 | type                          | description                                                                                                                       |
| ---------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`                 | `string`                      | The name of the chunk                                                                                                             |
| `id`                   | `int`                         | The id of the chunk (will take precedence over `name`)                                                                            |
| `customName`           | `string`                      | A custom name to be used for the include statement                                                                                |
| `includeTypes`         | `Object` or `string`          | The wrappers for generated lines per file extension, defaults are set by the global `typoScriptIncludeTypeDefaults` option        |
| `additionalTypoScript` | `Object`, `Array` or `string` | Additional typoscript lines to append to include statements, defaults are set by the global `typoScriptAdditionalDefaults` option |

#### `includeTypes`

Same rules apply as in the `typoScriptIncludeTypeDefaults` global option (see above).  
`includeTypes` settings **overwrite** defaults defined in the global `typoScriptIncludeTypeDefaults` option.

#### `additionalTypoScript`

Same rules apply as in the `typoScriptAdditionalDefaults` global option (see above).  
`additionalTypoScript` settings **extend** defaults defined in the global `typoScriptAdditionalDefaults` option.

**Example plugin configuration with chunk:**

```javascript
module.exports = {
    //...
    plugins: [
        //...
        new TypoScriptPlugin({
            chunks: [
                {
                    name: 'main',
                    additionalTypoScript: [
                        'if.value = someValue',
                        'if.equals.data = GP:someGETVar'
                    ]
                }
            ]
        })
    ]
    //...
}
```

**Resulting Typoscript:**

```typo3_typoscript
page {
includeJSFooter {
webpack_main = /fileadmin/Resources/Public/Js/main.js
webpack_main.if.value = someValue
webpack_main.if.equals.data = GP:someGETVar
}
# if mini-css-extract-plugin is used
includeCSS {
webpack_main = /fileadmin/Resources/Public/Css/main.css
webpack_main.if.value = someValue
webpack_main.if.equals.data = GP:someGETVar
}
}
```

## Full Typo3 extension example

**DISCLAIMER:** The typoscript conditions featured in this example are not actually tested as they serve a purely demonstrative purpose here.  
The example assumes an [extension](https://docs.typo3.org/typo3cms/ExtbaseFluidBook/Index.html#start) with the following directory structure:

```plain
my_awesome_typo3_extension
|-- (other extension folders, e.g. Classes)
|-- Configuration
|   |-- (other config folders, e.g. TCA)
|   \-- TypoScript
|       |-- setup.txt
|       |-- constants.txt
|       \-- Config
|           \-- CustomAssetFilename.t3s (generated by plugin)
|-- Resources
|   |-- Private
|   |   |-- (other private resources, e.g. Templates)
|   |   \-- Assets
|   |       \-- src (webpack sources)
|   \-- Public
|       |-- (other public resources, e.g. Js, Icons, ...)
|       \-- Generated (generated by webpack)
|-- (other root files, e.g. ext_emconf.php, ext_localconf.php, ...)
|-- package.json
\-- webpack.config.js
```

### `my_awesome_typo3_extension/Configuration/TypoScript/setup.txt`

```typo3_typoscript
# init page object
customPageType = PAGE
customPageType.pageNum = 100
# include generated assets
<INCLUDE_TYPOSCRIPT: source="FILE:EXT:my_awesome_typo3_extension/Configuration/TypoScript/Config/CustomAssetFilename.t3s">

# ... (more typoscript setup)
```

### `my_awesome_typo3_extension/Configuration/TypoScript/constants.txt`

```typo3_typoscript
plugin.tx_myawesometypo3extension {
    # cat=myAwesomeTypo3Extension/enable/a1; type=boolean; Enable additional Assets:If set additional assets will be loaded
    include_additional = 0
    # cat=myAwesomeTypo3Extension/enable/a2; type=boolean; Force additional JS:If set additional javascript will always be loaded
    force_js = 0
    # cat=myAwesomeTypo3Extension/enable/a3; type=boolean; Enable additional CSS:The implementation of this setting is a little contrived to show off webpack plugin configuration
    include_css = 0
}
```

### `my_awesome_typo3_extension/webpack.config.js`

```javascript
'use strict';

const path = require('path');
// ... (other imports)
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TypoScriptPlugin = require('typoscript-webpack-plugin');

module.exports = {
    entry: {
        main: path.join(__dirname, 'Resources/Private/Assets/src/index.js'),
        backendLayout: path.join(__dirname, 'Resources/Private/Assets/src/backendLayout.js'),
        additional: path.join(__dirname, 'Resources/Private/Assets/src/additional.js')
    },
    output: {
        path: path.join(__dirname, 'Resources/Public/Generated/'),
        filename: 'Js/[name].js'
    },
    plugins: [
        // ... (other plugins)
        new MiniCssExtractPlugin({
            filename: 'Css/[name].css'
        }),
        new TypoScriptPlugin({
            filename: 'CustomAssetFilename.t3s',
            outputPath: path.join(__dirname, 'Configuration/TypoScript/Config/'),
            typoScriptRootPath: 'customPageType',
            typoScriptPublicPath: 'EXT:my_awesome_typo3_extension/Resources/Public/Generated/',
            typoScriptAdditionalDefaults: {
                js: [
                    'async = 1',
                    'defer = 1'
                ]
            },
            chunks: [
                'main',
                {
                    name: 'backendLayout',
                    customName: 'customLayoutPage',
                    includeTypes: {js: 'includeJS'},
                    additionalTypoScript: [
                        'if.value = pagets__custom_layout',
                        'if.equals.data = levelfield:-2,backend_layout_next_level,slide',
                        'if.equals.override.field = backend_layout'
                    ]
                },
                {
                    name: 'additional',
                    additionalTypoScript: {
                        all: 'if.isTrue.value = {$plugin.tx_myawesometypo3extension.include_additional}',
                        js: 'if.isTrue.override = {$plugin.tx_myawesometypo3extension.force_js}',
                        css: [
                            'if.isFalse.value = {$plugin.tx_myawesometypo3extension.exclude_css}',
                            'if.isFalse.negate = 1'
                        ]
                    }
                }
            ]
        })
    ],
    module: {
        rules: [
            // ... (loader configuration)
        ]
    },
    // ... (other configs)
}
```

### Result

Running a webpack build will result in a file named `CustomAssetFilename.t3s`  
in the directory `my_awesome_typo3_extension/Configuration/TypoScript/Config/`  
with the following contents:

### `my_awesome_typo3_extension/Configuration/TypoScript/Config/CustomAssetFilename.t3s`

```typo3_typoscript
customPageType {
includeJSFooter {
webpack_main = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Js/main.js
webpack_main.async = 1
webpack_main.defer = 1
}
includeCSS {
webpack_main = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Css/main.css
}
includeJS {
customLayoutPage = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Js/backendLayout.js
customLayoutPage.if.value = pagets__custom_layout
customLayoutPage.if.equals.data = levelfield:-2,backend_layout_next_level,slide
customLayoutPage.if.equals.override.field = backend_layout
customLayoutPage.async = 1
customLayoutPage.defer = 1
}
includeCSS {
customLayoutPage = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Css/backendLayout.css
customLayoutPage.if.value = pagets__custom_layout
customLayoutPage.if.equals.data = levelfield:-2,backend_layout_next_level,slide
customLayoutPage.if.equals.override.field = backend_layout
}
includeJSFooter {
webpack_additional = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Js/additional.js
webpack_additional.if.isTrue.value = {$plugin.tx_myawesometypo3extension.include_additional}
webpack_additional.async = 1
webpack_additional.defer = 1
webpack_additional.if.isTrue.override = {$plugin.tx_myawesometypo3extension.force_js}
}
includeCSS {
webpack_additional = EXT:my_awesome_typo3_extension/Resources/Public/Generated/Css/additional.css
webpack_additional.if.isTrue.value = {$plugin.tx_myawesometypo3extension.include_additional}
webpack_additional.if.isFalse.value = {$plugin.tx_myawesometypo3extension.include_css}
webpack_additional.if.isFalse.negate = 1
}
}
```
