'use strict';

const fs = require('fs');
const path = require('path');
const pick = require('just-pick');
const merge = require('deepmerge');

const convertIncludeTypes = option => {
    if (typeof option === 'string') {
        option = {all: option};
    }

    return option;
};

const convertAdditionalTypoScript = option => {
    if (option) {
        if (typeof option === 'string') {
            option = {
                all: [option]
            }
        } else if (option instanceof Array) {
            option = {
                all: option
            }
        } else {
            ['all', 'js', 'css'].forEach(extension => {
                if (option[extension] && typeof option[extension] === 'string') {
                    option[extension] = [option[extension]]
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
        options.additionalTypoScript = convertAdditionalTypoScript(options.additionalTypoScript);
    }

    if (options.files) {
        delete options.files;
    }
    if (defaults.files) {
        delete defaults.files;
    }

    defaults = merge(
        defaults,
        pick(chunk, ['id', 'name', 'files'])
    );

    return merge(
        defaults,
        options
    )
};

class TypoScriptPlugin {
    constructor(options) {
        const defaults = {
            filename: 'WebpackAssets.typoscript',
            typoScriptPublicPath: '/fileadmin/Resources/Public/',
            typoScriptRootPath: 'page',
            typoScriptIncludeTypeDefaults: {
                js: 'includeJSFooter',
                css: 'includeCSS'
            },
            chunks: null
        };

        if (typeof options === 'string') {
            options = {
                outputPath: options
            }
        }
        if (!options.outputPath || !path.isAbsolute(options.outputPath)) {
            options.outputPath = path.dirname(module.parent.filename);
        }

        this.options = merge(defaults, options);

        if (this.options.typoScriptIncludeTypeDefaults) {
            this.options.typoScriptIncludeTypeDefaults = convertIncludeTypes(this.options.typoScriptIncludeTypeDefaults);
        }
        if (this.options.typoScriptAdditionalDefaults) {
            this.options.typoScriptAdditionalDefaults = convertAdditionalTypoScript(this.options.typoScriptAdditionalDefaults);
        }
    }

    generateTypoScript(chunk, options = {}) {
        options = getChunkOptions(
            chunk,
            options,
            {
                includeTypes: this.options.typoScriptIncludeTypeDefaults,
                additionalTypoScript: this.options.typoScriptAdditionalDefaults
            }
        );

        const output = [];
        options.files.forEach(asset => {
            const assetOutput = [];
            const extension = asset.match(/\.(js|css)$/)[1];
            const name = (options.customName || ('webpack_' + (options.name || options.id)));

            assetOutput.push(name + ' = ' + path.join(this.options.typoScriptPublicPath, asset));

            if (options.additionalTypoScript) {
                const additionalTypoScript = [];
                if (options.additionalTypoScript.all) {
                    additionalTypoScript.push(...options.additionalTypoScript.all);
                }
                if (options.additionalTypoScript[extension]) {
                    additionalTypoScript.push(...options.additionalTypoScript[extension]);
                }
                assetOutput.push(...additionalTypoScript.map(typoScript => name + '.' + typoScript.replace(/^\./, '')));
            }

            if (options.includeTypes) {
                if (options.includeTypes.all) {
                    output.push(options.includeTypes.all + ' {', ...assetOutput, '}');
                }
                if (options.includeTypes[extension]) {
                    output.push(options.includeTypes[extension] + ' {', ...assetOutput, '}');
                }
            }
        });

        return output.join("\n");
    }

    emitTypoScript(compilation, callback) {
        let output = [];
        if (this.options.chunks) {
            this.options.chunks.forEach(chunkOptions => {
                if (typeof chunkOptions === 'string') {
                    chunkOptions = {name: chunkOptions};
                }

                const chunk = compilation.chunks.find(chunk => chunkOptions.id ? chunkOptions.id === chunk.id : chunkOptions.name === chunk.name);
                output.push(this.generateTypoScript(chunk, chunkOptions));
            });
        } else {
            output.push(...compilation.chunks.map(chunk => this.generateTypoScript(chunk)));
        }

        output = [
            this.options.typoScriptRootPath + ' {',
            ...output,
            '}'
        ];

        fs.writeFileSync(path.join(this.options.outputPath, this.options.filename), output.join("\n"));

        callback();
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('TypoScriptPlugin', (compilation, callback) => {
            this.emitTypoScript(compilation, callback);
        });
    }
}

module.exports = TypoScriptPlugin;