const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaultsDeep = require('lodash.defaultsdeep');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devServer: {
        static: false,
        host: '0.0.0.0',
        port: process.env.PORT || 8073
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map',
    resolve: {
        fallback: {
            buffer: require.resolve('buffer/')
        },
        fullySpecified: false
    },
    output: {
        library: 'VirtualMachine',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: path.resolve(__dirname, 'src'),
            options: {
                presets: [['@babel/preset-env', {targets: {browsers: ['last 3 versions', 'Safari >= 8', 'iOS >= 8']}}]]
            }
        },
        {
            test: /\.mp3$/,
            loader: 'file-loader'
        }]
    },
    plugins: [
        new NodePolyfillPlugin({excludeAliases: ['Buffer', 'buffer']}),
        new webpack.ProvidePlugin({
            Buffer: [require.resolve('buffer/'), 'Buffer']
        })
    ]
};

const configurations = [
    // Web-compatible
    defaultsDeep({}, base, {
        target: 'web',
        entry: {
            'openblock-vm': './src/index.js',
            'openblock-vm.min': './src/index.js'
        },
        output: {
            libraryTarget: 'umd',
            path: path.resolve('dist', 'web')
        },
        module: {
            rules: base.module.rules.concat([
                {
                    test: require.resolve('./src/index.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'VirtualMachine'}
                }
            ])
        }
    }),
    // Node-compatible
    defaultsDeep({}, base, {
        target: 'node',
        entry: {
            'openblock-vm': './src/index.js'
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve('dist', 'node')
        },
        externals: {
            'decode-html': true,
            'format-message': true,
            'htmlparser2': true,
            'immutable': true,
            'jszip': true,
            'minilog': true,
            'scratch-parser': true,
            'socket.io-client': true,
            'text-encoding': true
        }
    }),
    // Playground
    defaultsDeep({}, base, {
        target: 'web',
        entry: {
            'benchmark': './src/playground/benchmark'
        },
        output: {
            path: path.resolve(__dirname, 'playground'),
            filename: '[name].js'
        },
        module: {
            rules: base.module.rules.concat([
                {
                    test: require.resolve('./src/index.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'VirtualMachine'}
                },
                {
                    test: require.resolve('stats.js/build/stats.min.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'Stats'}
                },
                {
                    test: require.resolve('openblock-blocks/dist/vertical.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'Blockly'}
                },
                {
                    test: require.resolve('scratch-audio/src/index.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'AudioEngine'}
                },
                {
                    test: require.resolve('scratch-storage/src/index.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'ScratchStorage'}
                },
                {
                    test: require.resolve('scratch-render/src/index.js'),
                    loader: 'expose-loader',
                    options: {exposes: 'ScratchRender'}
                }
            ])
        },
        performance: {
            hints: false
        },
        plugins: base.plugins.concat([
            new CopyWebpackPlugin({patterns: [{
                from: 'node_modules/openblock-blocks/media',
                to: 'media'
            }, {
                from: 'node_modules/scratch-storage/dist/web'
            }, {
                from: 'node_modules/scratch-render/dist/web'
            }, {
                from: 'node_modules/scratch-svg-renderer/dist/web'
            }, {
                from: 'src/playground'
            }]})
        ])
    })
];

module.exports = process.env.BUILD_PLAYGROUND === 'true' ?
    configurations : configurations.slice(0, 2);
