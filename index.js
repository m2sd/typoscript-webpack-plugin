'use strict';

const fs = require('fs');
const path = require('path');
const pick = require('just-pick');
const merge = require('deepmerge');

const convertIncludeTypes = option => {
    if (typeof option === 'string') {
        option = { all: option };
    }

    return option;
};

const convertAdditionalTypoScript = option => {
    if (option) {
        if (typeof option === 'string') {
            option = {
                all: [option]
            };
        } else if (option instanceof Array) {
            option = {
                all: option
            };
        } else {
            ['all', 'js', 'css'].forEach(extension => {
                if (
                    option[extension] &&
                    typeof option[extension] === 'string'
                ) {
                    option[extension] = [option[extension]];
                }
            });
        }
    }

    return option;
};

const getChunkOptions = (chunk, options = {}, defaults = {}) => {
    if (options.includeTypes) {
        options.includeTypes = convertIncludeTypes(options.includeTypes);
    }
    if (options.additionalTypoScript) {
        options.additionalTypoScript = convertAdditionalTypoScript(
            options.additionalTypoScript
        );
    }

    if (options.files) {
        delete options.files;
    }
    if (defaults.files) {
        delete defaults.files;
    }

    defaults = merge(defaults, pick(chunk, ['id', 'name', 'files']));

    return merge(defaults, options);
};

class TypoScriptPlugin {
    constructor(options) {
        const pluginDefaults = {
            filename: 'WebpackAssets.typoscript',
            typoScriptPublicPath: '/fileadmin/Resources/Public/',
            typoScriptRootPath: 'page',
            typoScriptIncludeTypeDefaults: {
                js: 'includeJSFooter',
                css: 'includeCSS'
            },
            chunks: null,
            loading: {
                type: 'default',
                background: '#2c3e50'
            }
        };
        /** @todo BRAKING CHANGE: remove */
        pluginDefaults.loading = false;

        const pluginOptions = options || {};

        if (typeof pluginOptions === 'string') {
            pluginOptions = {
                /** @todo BRAKING CHANGE: change to filename */
                outputPath: pluginOptions
            };
        }
        /** @todo BRAKING CHANGE: set compiler.options.output.path as default output path */
        if (
            !pluginOptions.outputPath ||
            !path.isAbsolute(pluginOptions.outputPath)
        ) {
            pluginOptions.outputPath = path.dirname(module.parent.filename);
        }
        if (
            typeof pluginOptions.loading === 'boolean' &&
            pluginOptions.loading
        ) {
            pluginOptions.loading = {
                type: 'default',
                background: '#2c3e50'
            };
        } else if (typeof pluginOptions.loading === 'string') {
            pluginOptions.loading = {
                type: pluginOptions.loading,
                background: '#2c3e50'
            };
        }
        this.options = merge(pluginDefaults, pluginOptions);

        if (this.options.typoScriptIncludeTypeDefaults) {
            this.options.typoScriptIncludeTypeDefaults = convertIncludeTypes(
                this.options.typoScriptIncludeTypeDefaults
            );
        }
        if (this.options.typoScriptAdditionalDefaults) {
            this.options.typoScriptAdditionalDefaults = convertAdditionalTypoScript(
                this.options.typoScriptAdditionalDefaults
            );
        }
    }

    generateTypoScript(chunk, options = {}) {
        options = getChunkOptions(chunk, options, {
            includeTypes: this.options.typoScriptIncludeTypeDefaults,
            additionalTypoScript: this.options.typoScriptAdditionalDefaults
        });

        const output = [];
        options.files.forEach(asset => {
            const assetOutput = [];
            const [, extension] = asset.match(/\.(js|css)$/);
            const name =
                options.customName || 'webpack_' + (options.name || options.id);

            assetOutput.push(
                name +
                    ' = ' +
                    path.join(this.options.typoScriptPublicPath, asset)
            );

            if (options.additionalTypoScript) {
                const additionalTypoScript = [];
                if (options.additionalTypoScript.all) {
                    additionalTypoScript.push(
                        ...options.additionalTypoScript.all
                    );
                }
                if (options.additionalTypoScript[extension]) {
                    additionalTypoScript.push(
                        ...options.additionalTypoScript[extension]
                    );
                }
                if (this.options.loading) {
                    if (
                        extension === 'css' &&
                        !additionalTypoScript.find(item =>
                            item.test(/^allWrap/)
                        )
                    ) {
                        additionalTypoScript.unshift('allWrap = <!--|-->');
                    } else if (extension === 'js') {
                        if (
                            !additionalTypoScript.find(item =>
                                item.test(/^async/)
                            )
                        ) {
                            additionalTypoScript.unshift('async = 1');
                        }
                        if (
                            !additionalTypoScript.find(item =>
                                item.test(/^defer/)
                            )
                        ) {
                            additionalTypoScript.unshift('defer = 1');
                        }
                    }
                }
                assetOutput.push(
                    ...additionalTypoScript.map(
                        typoScript => name + '.' + typoScript.replace(/^\./, '')
                    )
                );
            }

            if (options.includeTypes) {
                if (options.includeTypes.all) {
                    output.push(
                        options.includeTypes.all + ' {',
                        ...assetOutput,
                        '}'
                    );
                }
                if (options.includeTypes[extension]) {
                    output.push(
                        options.includeTypes[extension] + ' {',
                        ...assetOutput,
                        '}'
                    );
                }
            }
        });

        return output.join('\n');
    }

    generateLoaderTypoScript(options = {}, compilation) {
        const localPath = path.join(__dirname, 'loading');
        const externalPath = [];
        if (
            typeof options.customSource === 'string' &&
            path.isAbsolute(options.customSource)
        ) {
            externalPath.push(options.customSource);
            if (options.type) {
                externalPath.push(type);
            }
        } else if (!options.type) {
            throw new Error(
                '[typoscript-webpack-plugin]: Either loading.type or loading.customSource must be defined'
            );
        }

        const publicPath = this.options.typoScriptPublicPath;
        const inputSrc = {
            js: fs.readFileSync(path.join(localPath, 'script.js'), 'utf8')
        };
        if (
            externalPath.length &&
            fs.exists(path.join(...externalPath, 'style.css'))
        ) {
            inputSrc.css = fs.readFileSync(
                path.join(...externalPath, 'style.css'),
                'utf8'
            );
        } else {
            inputSrc.css = fs.readFileSync(
                path.join(localPath, options.type, 'style.css'),
                'utf8'
            );
        }
        if (
            externalPath.length &&
            fs.exists(path.join(...externalPath, 'template.html'))
        ) {
            inputSrc.html = fs.readFileSync(
                path.join(...externalPath, 'template.html'),
                'utf8'
            );
        } else {
            inputSrc.html = fs.readFileSync(
                path.join(localPath, options.type, 'template.html'),
                'utf8'
            );
        }
        const typoScript = [];

        for (const extension of ['js', 'css']) {
            const filename = `webpack-loading.${extension}`;
            const publicFilepath = path.join(publicPath, filename);
            compilation.assets[filename] = {
                source: () => inputSrc[extension],
                size: () => inputSrc[extension].length
            };
            typoScript.push(
                `${extension === 'css' ? 'includeCSSLibs' : 'includeJSLibs'} {`,
                `webpack_loading = ${publicFilepath}`,
                '}'
            );
        }

        typoScript.push(
            'footerData {',
            '11389465 = TEXT',
            '11389465.value(',
            '<div id="webpack-loading-plugin">',
            inputSrc.html.replace(/^\s*|\s*$/g, ''),
            '</div>',
            ')',
            '}',
            'cssinline {',
            '11389465 = TEXT',
            '11389465.value(',
            `#webpack-loading-plugin {position:absolute; top: 0, left: 0, width: 100%, height: 100%, background: ${
                options.background
            }}`,
            ')',
            '}'
        );

        return typoScript;
    }

    emitTypoScript(compilation, callback) {
        const outputLines = [];
        if (this.options.chunks) {
            this.options.chunks.forEach(chunkOptions => {
                if (typeof chunkOptions === 'string') {
                    chunkOptions = { name: chunkOptions };
                }

                const chunk = compilation.chunks.find(
                    chunk =>
                        chunkOptions.id
                            ? chunkOptions.id === chunk.id
                            : chunkOptions.name === chunk.name
                );
                outputLines.push(this.generateTypoScript(chunk, chunkOptions));
            });
        } else {
            outputLines.push(
                ...compilation.chunks.map(chunk =>
                    this.generateTypoScript(chunk)
                )
            );
        }

        if (this.options.loading) {
            outputLines.push(
                ...this.generateLoaderTypoScript(
                    this.options.loading,
                    compilation
                )
            );
        }

        const output = [
            this.options.typoScriptRootPath + ' {',
            ...outputLines,
            '}'
        ].join('\n');

        const outputPath = path.join(
            path.relative(
                compilation.options.output.path,
                this.options.outputPath
            ),
            this.options.filename
        );

        compilation.assets[outputPath] = {
            source: () => output,
            size: () => output.length
        };

        callback();
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            'TypoScriptPlugin',
            (compilation, callback) => {
                this.emitTypoScript(compilation, callback);
            }
        );
    }
}

module.exports = TypoScriptPlugin;
