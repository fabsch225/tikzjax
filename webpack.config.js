const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (_env, argv) => {
    process.env.NODE_ENV = argv.mode ?? 'development';

    const config = {
        entry: { tikzjax: './src/index.js', 'run-tex': './src/run-tex.js' },
        output: { path: path.resolve(__dirname, 'dist'), filename: '[name].js' },
        devServer: {
            host: '0.0.0.0',  // server bind
            port: 9090,
            static: path.join(__dirname, './public'),
            client: {
                webSocketURL: 'ws://localhost:9090/ws'
            },
            allowedHosts: 'all'
        },
        devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
        module: { rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }] },
        performance: { hints: false },
        plugins: [
            new TerserPlugin({ terserOptions: { format: { comments: false } }, extractComments: false }),
            new CopyPlugin({
                patterns: [
                    { from: './css/fonts.css', to: path.resolve(__dirname, 'dist') },
                    { from: './core.dump.gz', to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true },
                    { from: './tex.wasm.gz', to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true }
                ]
            }),
            new webpack.ProvidePlugin({ process: 'process/browser' })//,
            //new ESLintPlugin({ configType: 'flat' })
        ]
    };

    return config;
};
