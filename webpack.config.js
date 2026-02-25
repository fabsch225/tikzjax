const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { default: plugin } = require('@stylistic/eslint-plugin');

module.exports = (env, argv) => {
	let tikzjaxConfig = {
		name: "tikzjax",
		mode: "production",
		entry: {
			tikzjax: './src/index.js',
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				},
				{
					test: /run-tex-output\.js/,
					type: 'asset/source',
				}
			]
		},
		performance: {
			hints: false
		},
		plugins: [
			new webpack.DefinePlugin({
                __IS_DEV__: JSON.stringify(false)
            }),
			new webpack.ProvidePlugin({
				process: 'process/browser'
			})
		],
		dependencies: ["run-tex"]
	};


	let runTexConfig = {
		name: "run-tex",
		mode: "production",
		entry: {
			'run-tex-output': './src/run-tex.js',
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.gz/,
					type: 'asset/inline',
				}
			]
		},
		performance: {
			hints: false
		},
		plugins: [
			new webpack.ProvidePlugin({
				process: 'process/browser'
			}),
			new webpack.DefinePlugin({
                __IS_DEV__: JSON.stringify(false)
            })
		]
	};

	let demoConfig = {
		name: "demo",
		mode: "production",
		entry: {
			tikzjax: './dist/tikzjax.js',
		},
		devServer: {
			host: '0.0.0.0',
			port: 9091,
			static: path.join(__dirname, './public'),
		},
		plugins: [
			new webpack.DefinePlugin({
                __IS_DEV__: JSON.stringify(false)
            })
		],
		performance: {
			hints: false
		}
	};

	let devConfig = {
		name: "dev",
		mode: "development",
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
			new webpack.DefinePlugin({
                __IS_DEV__: JSON.stringify(true)
            }),
            new TerserPlugin({ terserOptions: { format: { comments: false } }, extractComments: false }),
            new CopyPlugin({
                patterns: [
                    { from: './core.dump.gz', to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true },
                    { from: './tex.wasm.gz', to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true }
                ]
            }),
            new webpack.ProvidePlugin({ process: 'process/browser' })//,
            //new ESLintPlugin({ configType: 'flat' })
        ]
	};

	return [demoConfig, devConfig, runTexConfig, tikzjaxConfig];
};
