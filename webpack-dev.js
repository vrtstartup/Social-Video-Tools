'use strict';

/**
 * Webpack Constants
 */
const webpack = require('webpack');
const commonConfig = require('./webpack.common.config.js');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development'; // set environment to development
const METADATA = webpackMerge(commonConfig.metadata, {
  ENV: ENV,
});

module.exports = function (env) {
    return webpackMerge(commonConfig(), {
        devtool: 'source-map',
        entry: {
            'dev': './app/bootstrap.ts'
        },
        output: {
            path: __dirname + '/dist/dev'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html',
                inject: false
            }),

            new webpack.DefinePlugin({
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                }
            }),
        ],
        devServer: {
            contentBase: 'dist/dev',
            historyApiFallback: true,
        }
    });
};
