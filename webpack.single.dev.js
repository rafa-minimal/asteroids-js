const merge = require('webpack-merge');
const common = require('./webpack.single.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        hot: true,
        overlay: {errors: true, warnings: true}
    }
});
