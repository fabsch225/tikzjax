const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
	let tikzjaxConfig = {
		mode: "production",
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
        
		performance: {
			hints: false
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{ from: "./css/fonts.css", to: path.resolve(__dirname, 'dist') },
					{ from: "./core.dump.gz", to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true },
					{ from: "./tex.wasm.gz", to: path.resolve(__dirname, 'dist'), noErrorOnMissing: true }
				]
			}),
			new webpack.ProvidePlugin({
				process: 'process/browser'
			})
		]
	};

	if (argv.mode == "development") {
		console.log("Using development mode.");
		config.mode = "development";
		config.devtool = "source-map";
	} else {
		console.log("Using production mode.");
		// This prevents the LICENSE file from being generated.  It also minimizes the code even in development mode,
		// which is why it is here.
		config.plugins.push(new TerserPlugin({
			terserOptions: { format: { comments: false } },
			extractComments: false
		}));
	}

	return [runTexConfig, tikzjaxConfig];
};
