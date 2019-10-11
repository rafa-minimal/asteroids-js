const merge = require('webpack-merge');
const common = require('./webpack.single.common.js');

module.exports = merge(common, {
    mode: 'production'
});
