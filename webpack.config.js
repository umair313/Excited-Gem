var webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    WriteFilePlugin = require("write-file-webpack-plugin");

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets." + env.NODE_ENV + ".js"));

var images = ["jpg", "jpeg", "png", "gif"];
var fonts = ["eot", "otf", "svg", "ttf", "woff", "woff2"];
var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
    alias["secrets"] = secretsPath;
}

var options = {
    entry: {
        tabs: path.join(__dirname, "src", "scripts", "app.jsx"),
        // options: path.join(__dirname, "src", "js", "options.js"),
        // background: path.join(__dirname, "src", "js", "background.js")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            // {
            //     test: /\.css$/,
            //     loader: "file-loader!css-loader",
            //     options: {
            //         outputPath: "css/"
            //     },
            //     exclude: /node_modules/
            // },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader'),
                exclude: /node_modules/
            },
            {
                test: new RegExp('\.(' + images.join('|') + ')$'),
                loader: "file-loader?name=images/[name].[ext]",
                exclude: /node_modules/
            },
            {
                test: new RegExp('\.(' + fonts.join('|') + ')$'),
                loader: "file-loader?name=css/fonts/[name].[ext]",
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(js|jsx)$/,
                loader: "babel-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        alias: alias,
        extensions: fileExtensions.map(extension => ("." + extension)).concat([".jsx", ".js", ".css"])
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "css/[name].css"
        }),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
        }),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, "src", "tabs.html"),
        //     filename: "tabs.html",
        //     chunks: ["tabs"]
        // }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "tabs.html"),
            filename: "tabs.html",
            chunks: ["tabs"]
        }),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, "src", "options.html"),
        //     filename: "options.html",
        //     chunks: ["options"]
        // }),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, "src", "background.html"),
        //     filename: "background.html",
        //     chunks: ["background"]
        // }),

        new WriteFilePlugin()
    ]
};

if (env.NODE_ENV === "development") {
    options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;