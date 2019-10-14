const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/client/asteroids-client.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'asteroids-client.[hash].js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        hot: true,
        overlay: {errors: true, warnings: true},
        proxy: {
            '/echo': {
                target: 'ws://localhost:8080',
                ws: true,
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/client/html/asteroids.html'
        })
    ]
};