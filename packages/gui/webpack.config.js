const defaultsDeep = require('lodash.defaultsdeep');
var path = require('path');
var webpack = require('webpack');

// Plugins
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// PostCss
var autoprefixer = require('autoprefixer');
var postcssVars = require('postcss-simple-vars');
var postcssImport = require('postcss-import');

const STATIC_PATH = process.env.STATIC_PATH || '/static';
const MONACO_DIR = path.resolve(__dirname, '../../node_modules/monaco-editor');
const BLOCKS_MEDIA_DIR = path.resolve(__dirname, '../blocks/media');
const VM_WEB_DIST_DIR = path.resolve(__dirname, '../vm/dist/web');
const IS_PORTAL_BUILD = process.env.BUILD_MODE === 'portal';

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'build')
        },
        host: '0.0.0.0',
        port: process.env.PORT || 8601
    },
    output: {
        library: 'GUI',
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js'
    },
    resolve: {
        alias: {
            'scratch-storage$': require.resolve('scratch-storage/dist/web/scratch-storage.js')
        },
        fallback: {
            buffer: require.resolve('buffer/')
        },
        fullySpecified: false,
        symlinks: false
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, 'src'),
                /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
                /node_modules[\\/]pify/,
                /node_modules[\\/]@vernier[\\/]godirect/
            ],
            options: {
                // Explicitly disable babelrc so we don't catch various config
                // in much lower dependencies.
                babelrc: false,
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-transform-async-to-generator',
                    '@babel/plugin-proposal-object-rest-spread',
                    ['react-intl', {
                        messagesDir: './translations/messages/'
                    }]],
                presets: ['@babel/preset-env', '@babel/preset-react']
            }
        },
        {
            test: /\.css$/,
            exclude: MONACO_DIR,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName: '[name]_[local]_[hash:base64:5]',
                        // OpenBlock's legacy React components import CSS modules
                        // as a default object (`styles.className`). css-loader 7
                        // defaults to named exports for ES modules, which makes
                        // that object undefined and crashes the editor at boot.
                        namedExport: false,
                        exportLocalsConvention: 'camel-case'
                    },
                    importLoaders: 1,
                }
            }, {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            postcssImport(),
                            postcssVars(),
                            autoprefixer()
                        ]
                    }
                }
            }]
        },
        {
            test: /\.css$/,
            include: MONACO_DIR,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new NodePolyfillPlugin({excludeAliases: ['Buffer', 'buffer']}),
        new webpack.ProvidePlugin({
            Buffer: [require.resolve('buffer/'), 'Buffer']
        }),
        new MonacoWebpackPlugin({
            languages: ['c', 'cpp', 'python', 'lua', 'javascript'],
            features: ['!gotoSymbol']
        })
    ]
};

if (!process.env.CI) {
    base.plugins.push(new webpack.ProgressPlugin());
}

module.exports = [
    // to run editor examples
    defaultsDeep({}, base, {
        entry: IS_PORTAL_BUILD ? {
            'lib.min': ['react', 'react-dom'],
            'gui': {import: './src/playground/index.jsx', dependOn: 'lib.min'}
        } : {
            'lib.min': ['react', 'react-dom'],
            'gui': {import: './src/playground/index.jsx', dependOn: 'lib.min'},
            'blocksonly': {import: './src/playground/blocks-only.jsx', dependOn: 'lib.min'},
            'compatibilitytesting': {import: './src/playground/compatibility-testing.jsx', dependOn: 'lib.min'},
            'player': {import: './src/playground/player.jsx', dependOn: 'lib.min'}
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].js'
        },
        optimization: {
            // Legacy Blockly shims emit wrapper syntax that cannot be safely
            // concatenated into a single production module by modern Terser.
            concatenateModules: false
        },
        module: {
            rules: base.module.rules.concat([
                {
                    test: /\.(svg|png|wav|gif|jpg)$/,
                    loader: 'file-loader',
                    options: {
                        outputPath: 'static/assets/'
                    }
                }
            ])
        },
        plugins: base.plugins.concat([
            new webpack.DefinePlugin({
                'process.env.DEBUG': Boolean(process.env.DEBUG),
                'process.env.GA_ID': '"' + (process.env.GA_ID || 'UA-000000-01') + '"'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'gui'],
                template: 'src/playground/index.ejs',
                title: 'Block GUI',
                sentryConfig: process.env.SENTRY_CONFIG ? '"' + process.env.SENTRY_CONFIG + '"' : null
            })
        ], IS_PORTAL_BUILD ? [] : [
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'blocksonly'],
                template: 'src/playground/index.ejs',
                filename: 'blocks-only.html',
                title: 'Block GUI: Blocks Only Example'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'compatibilitytesting'],
                template: 'src/playground/index.ejs',
                filename: 'compatibility-testing.html',
                title: 'Block GUI: Compatibility Testing'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'player'],
                template: 'src/playground/index.ejs',
                filename: 'player.html',
                title: 'Block GUI: Player Example'
            })
        ], [
            new CopyWebpackPlugin({patterns: [{
                from: 'static',
                to: 'static'
            }]}),
            new CopyWebpackPlugin({patterns: [{
                from: BLOCKS_MEDIA_DIR,
                to: 'static/blocks-media'
            }]}),
            new CopyWebpackPlugin({patterns: [{
                from: 'extensions/**',
                to: 'static',
                context: 'src/examples'
            }]}),
            new CopyWebpackPlugin({patterns: [{
                from: 'extension-worker.js',
                context: VM_WEB_DIST_DIR
            }]})
        ])
    })
].concat(
    process.env.BUILD_MODE === 'dist' ? (
        // export as library
        defaultsDeep({}, base, {
            target: 'web',
            entry: {
                'openblock-gui': './src/index.js'
            },
            output: {
                libraryTarget: 'umd',
                path: path.resolve('dist'),
                publicPath: `${STATIC_PATH}/`
            },
            externals: {
                'react': 'react',
                'react-dom': 'react-dom'
            },
            module: {
                rules: base.module.rules.concat([
                    {
                        test: /\.(svg|png|wav|gif|jpg)$/,
                        loader: 'file-loader',
                        options: {
                            outputPath: 'static/assets/',
                            publicPath: `${STATIC_PATH}/assets/`
                        }
                    }
                ])
            },
            plugins: base.plugins.concat([
                new CopyWebpackPlugin({patterns: [{
                    from: BLOCKS_MEDIA_DIR,
                    to: 'static/blocks-media'
                }]}),
                new CopyWebpackPlugin({patterns: [{
                    from: 'extension-worker.js',
                    context: VM_WEB_DIST_DIR
                }]}),
                // Include library JSON files for scratch-desktop to use for downloading
                new CopyWebpackPlugin({patterns: [{
                    from: 'src/lib/libraries/*.json',
                    to: 'libraries',
                    toType: 'dir'
                }]})
            ])
        })) : []
);
