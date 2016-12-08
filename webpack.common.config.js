'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = require('./app/config/front.config');

module.exports = function () {
    return {

        debug: false,
        profile: true,
        bail: false,

        entry: {
            polyfills: [
                path.resolve(__dirname, 'node_modules/es6-shim/es6-shim.min.js'),
                path.resolve(__dirname, 'node_modules/es6-promise/dist/es6-promise.min.js'),
                path.resolve(__dirname, 'node_modules/reflect-metadata/Reflect.js'),
                path.resolve(__dirname, 'node_modules/zone.js/dist/zone.min.js'),
                path.resolve(__dirname, 'node_modules/zone.js/dist/long-stack-trace-zone.min.js')
            ],
            app: './app/bootstrap.ts'
        },

        output: {
            filename: '[name].bundle.js',
            path: __dirname + '/dist'
        },
        
        resolve: {
            root: [path.resolve(__dirname, 'app')],
            extensions: ['', '.ts', '.js']
        },

        node: {
            fs: 'empty'
        },
        module: {
            preLoaders: [
                { test: /\.json$/, loader: 'json'},
            ],
            loaders: [
                {
                    test: /\.ts$/,
                    loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                {
                    test: /\.(html)$/,
                    loader: 'raw-loader',
                    exclude: ['app/index.html']
                },
                {
                    test: /\.(scss|css)$/,
                    loaders: ["style", "css", "sass"],
                    exclude: ['app/index.html']
                },
            ]
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html',
                inject: false
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new CopyWebpackPlugin([
                { from: 'node_modules/videogular2/fonts', to: 'fonts' },
                { from: './app/assets/', to: 'assets' },
            ]),
            new webpack.DefinePlugin({
                'ENV': JSON.stringify( config.env ),
            }),
        ],

        devtool: false,

        devServer: {
            compress: true
        }

    };
};
