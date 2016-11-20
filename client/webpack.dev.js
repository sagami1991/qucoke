const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const dateFormat = require('dateformat');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const CONFIG = {
	OUTPUT_PATH: "../server/public"
}
module.exports = [{
	entry: {
		"topic-app": "./src/ts/topic/topic-app.ts",
		"topics-app": "./src/ts/topics/topics-app.ts",
		"topic-edit-app": "./src/ts/topic-edit/topic-edit-app.ts",
	},
	output: {
		path: CONFIG.OUTPUT_PATH,
		filename: "[name].js",
	},
	devtool: "source-map",
	resolve: {
		extensions: ["", ".ts", ".js"],
		alias: {
			handlebars: 'handlebars/dist/handlebars.min.js'
		}
	},
	module: {
		loaders: [
			{ test: /\.ts?$/, loader: "ts-loader" },
			{ test: /\.html$/, loader: 'raw'},
			{ test: /\.json$/, loader: 'json'},
			{ test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
			{ test: /\.png$/, loader: "url?limit=10000&mimetype=image/png" },
			{ test: /\.jpg$/, loader: "url?limit=10000&mimetype=image/jpeg" },
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			// { from: 'node_modules/monaco-editor/min/vs', to: 'vs'},
			{ from: 'node_modules/ace-builds/src-min', to: 'ace-builds/'},
			{ from: 'src/resource', to: 'resource' },
			{ from: 'src/templates', to: '../templates' }
		]),
		new DefinePlugin({
			LAST_UPDATED: `"${dateFormat(new Date(),"yyyy/mm/dd HH:MM")}"`,
		}),
	],
},{
	entry: {
		style: './src/sass/main.scss'
	},
	output: {
		path: CONFIG.OUTPUT_PATH,
		filename: '[name].css'
	},
	module: {
		loaders: [
			{ test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
			{ test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")},
			{ test: /\.png$/, loader: "url?limit=10000&mimetype=image/png" },
		]
	},
	plugins: [
			new ExtractTextPlugin("[name].css")
		]
}];