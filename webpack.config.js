// @ts-check
// Note: @types/webpack is installed to ensure webpack 5 types are used in js type checking.
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const isCosmos = envToBool('COSMOS');

function envToBool(variableName) {
	const variable = process.env[variableName] || process.env[variableName.toLowerCase()];
	if (!variable) {
		return false;
	}
	return variable.toLowerCase() === 'true';
}

/**
 * @typedef { import('webpack').Configuration } Configuration
 */

module.exports = async () => {

	console.log([
		isCosmos ? 'Build is for Cosmos' : 'Build is not for Cosmos',
	].filter(x => !!x).join(', '));

	/** @type { Configuration['mode'] } */
	const mode = 'development';
	/** @type { Configuration['devtool'] } */
	const devtool = 'source-map';

	/** @type { Configuration['entry'] } */
	const entry = {
		index: './src/entry-index.tsx'
	};
	/** @type { Configuration['output'] } */
	const output = {
		filename: '[name].js',
		chunkFilename: 'chunk.[name].js',
		hashDigestLength: 10,
		path: path.resolve(__dirname, './dist')
	};

	/** @type { Configuration['optimization'] } */
	const optimization = {
		splitChunks: {
			chunks: 'all'
		},
		moduleIds: 'deterministic'
	};

	/** @type { Configuration['stats'] } */
	const stats = {
		assets: true,
		assetsSort: '!size'
	};

	/** @type { Configuration['resolve'] } */
	const resolve = {
		// Add '.ts' and '.tsx' as resolvable extensions (so that you don't need to type out the extension yourself).
		extensions: ['.ts', '.tsx', '.js', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src')
		},
	};

	const compilerOptions = isCosmos ? ({
		sourceMap: true,
		declaration: false,
		declarationMap: false,
		skipLibCheck: true,
		incremental: false
	}) : undefined;

	/** @type { Configuration['module'] } */
	const module = {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							onlyCompileBundledFiles: !isCosmos, // Keep the default of false in Cosmos, or build time will double.
							transpileOnly: false, // Set to true to test speed without type-checking.
							compilerOptions: compilerOptions
						}
					}
				]
			}
		]
	};

	/** @type {any} */
	const cleanWebpackPlugin = new CleanWebpackPlugin();

	/** @type {any} */
	const htmlPlugin = new HTMLWebpackPlugin({
		filename: './index.html',
		template: './src/index.template.ejs',
		minify: false,
		xhtml: true, // Use XHTML-compliance
		cache: false // https://github.com/webpack/webpack/issues/10761
	});

	/////////////////////////////////////////////////
	// Set configuration
	/////////////////////////////////////////////////

	/** @type { Configuration } */
	let config = {};

	if (!isCosmos) {
		// Development
		config = {
			mode,
			devtool,
			entry,
			output,
			optimization,
			resolve,
			module,
			plugins: [
				cleanWebpackPlugin,
				htmlPlugin
			]
		};
	}
	else {
		// Cosmos
		config = {
			mode,
			devtool,
			// No entry
			// No output
			resolve,
			module,
			plugins: [
				htmlPlugin
			]
		};
	}

	return config;
};