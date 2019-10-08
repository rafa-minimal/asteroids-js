const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const config = require('../../webpack.dev.js');
const options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost',
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);
const port = process.env.PORT || 8080;

server.listen(port, 'localhost', () => {
    console.log(`Server listening on port ${port}`);
});