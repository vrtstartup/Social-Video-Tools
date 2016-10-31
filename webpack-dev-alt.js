'use strict';

/**
 * Webpack Constants
 */
const webpack = require('webpack');
const commonConfig = require('./webpack.common.config.js');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development'; // set environment to production
const API_URL = process.env.API_URL = 'localhost';
const FIREBASE = {
    apiKey: "AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY",
    authDomain: "socialvideotool.firebaseapp.com",
    databaseURL: "https://socialvideotool.firebaseio.com",
    storageBucket: "socialvideotool.appspot.com",
    messagingSenderId: "796211105673"
};

const METADATA = webpackMerge(commonConfig.metadata, {
  host: 'localhost',
  API_URL: API_URL,
  port: 3000,
  ENV: ENV,
  FIREBASE: FIREBASE,
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

            /**
             * Plugin: DefinePlugin
             * Description: Define free variables.
             * Useful for having development builds with debug logging or adding global constants.
             *
             * Environment helpers
             *
             * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
             */
            // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
            new webpack.DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV),
                'API_URL': JSON.stringify(METADATA.API_URL),
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                    'NODE_ENV': JSON.stringify(METADATA.ENV),
                    'API_URL' : JSON.stringify(METADATA.API_URL),
                    'FIREBASE': JSON.stringify(METADATA.FIREBASE)
                }
            }),
        ],
        devServer: {
            contentBase: 'dist/dev',
            historyApiFallback: true,
        }
    });
};
