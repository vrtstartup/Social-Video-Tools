'use strict';

/**
 * Webpack Constants
 */
const webpack = require('webpack');
const webpackCommonConfig = require('./webpack.common.config.js');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const frontConfig = require('./app/config');

module.exports = function () {
    return webpackMerge(webpackCommonConfig(), {
        
        debug: false,
        profile: false,
        bail: true,
        plugins: [
            new webpack.DefinePlugin({
                'FIREBASE_CONFIG': JSON.stringify(frontConfig['firebaseApp']['production'])
            })
        ],

        devServer: {
            contentBase: './',
            historyApiFallback: true,
            proxy: {
                "**": "http://localhost:" + frontConfig.port
            }
        }
    });
};
