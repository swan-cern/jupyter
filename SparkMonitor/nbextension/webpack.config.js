var path = require('path');

module.exports = {
    entry: {
        extension: './src/extension.js',
        timeline: './src/Timeline.js',
        taskchart: './src/TaskChart.js'
    },
    output: {
        path: path.resolve(__dirname, '../sparkmonitor/nbextension'),
        filename: '[name].js',
        // library:'sparkmonitor',
        libraryTarget: 'umd'
    },
    externals: ['jquery', 'require', 'base/js/namespace', 'base/js/events', 'notebook/js/codecell', 'moment'],
    devtool: 'source-map',
    module: {
        rules: [{
                test: /d3\.js$/,
                use: "imports-loader?define=>false"
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],

                        plugins: [
                            "add-module-exports"
                        ]
                    }

                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: /node_modules[\\\/]vis[\\\/].*\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ["env"],
                        "babelrc": false,
                        // plugins: [
                        //     "transform-es3-property-literals",
                        //     "transform-es3-member-expression-literals",
                        //     "transform-runtime"
                        // ]

                    }
                }
            },
            // {
            //     test: /node_modules/,
            //     use: {
            //         loader: 'ify-loader',

            //     },
            //     enforce: 'post'
            // }

        ],
    }
};