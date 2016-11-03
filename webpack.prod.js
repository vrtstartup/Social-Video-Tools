'use strict';

const WebpackCommonConfig = require('./webpack.common.config.js');
const webpackMerge = require('webpack-merge');

const webpack = require('webpack');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = function () {
    return webpackMerge(WebpackCommonConfig(), {
        
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: false },
                output: { comments: false },
                sourceMap: false
            }),
            new CompressionPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.js$|\.html$/,
                threshold: 10240,
                minRatio: 0.8
            })
        ],

        devServer: {
            contentBase: './',
            historyApiFallback: true,
        }

    });
};
