let webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs'),
  // dotenv = require('dotenv'),
  env = require('./utils/env'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin'),
  WebpackBar = require('webpackbar');


// Get the root path (assuming your webpack config is in the root of your project!)
const currentPath = path.join(__dirname);

// Create the fallback path (the production .env)
const basePath = currentPath + '/.env';

// We're concatenating the environment name to our filename to specify the correct env file!
const envPath = basePath + '.' + process.env.NODE_ENV;

// Check if the file exists, otherwise fall back to the production .env
const finalPath = fileSystem.existsSync(envPath) ? envPath : basePath;

// Set the path parameter in the dotenv config
// const env = dotenv.config({ path: finalPath }).parsed;

// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

// load the secrets
alias = {};

let secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

let images = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
let fonts = ['eot', 'otf', 'ttf', 'woff', 'woff2'];
let fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}
if (env.browserClient === 'chrome' || env.browserClient === 'all') {
  exports.chromeConfig = [{

    context: __dirname,
      entry  :    {
      tabs:         path.join(__dirname, 'src', 'scripts', 'TabsApp.js'),
      sessions:         path.join(__dirname, 'src', 'scripts', 'Sessions.js'),
      background:   path.join(__dirname, 'src', 'scripts', 'background.js')
    }
  ,
    output: {
      path: path.join(__dirname, 'chrome'),
        filename
    :
      'js/[name].js',
    }
  ,
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          use: [{
            loader: 'style-loader', // inject CSS to page
          }, {
            loader: 'css-loader', // translates CSS into CommonJS modules
          }, {
            loader: 'postcss-loader', // Run post css actions
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [
                  require('precss'),
                  require('autoprefixer')
                ];
              }
            }
          }, {
            loader: 'sass-loader' // compiles Sass to CSS
          }]
        },
        {
          test: new RegExp('.(' + images.join('|') + ')$'),
          loader: 'file-loader?name=images/[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: new RegExp('.(' + fonts.join('|') + ')$'),
          loader: 'file-loader?name=/fonts/[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['stage-3', 'env', 'react'],
          },
        },
      ],
    }
  ,
    resolve: {
      alias: alias,
        extensions
    :
      fileExtensions.map(extension => '.' + extension).concat(['.jsx', '.js', '.css']),
        modules
    :
      ['path.resolve(__dirname, "src")', 'node_modules', path.resolve(__dirname, 'chrome')],
        descriptionFiles
    :
      ['package.json'],
        moduleExtensions
    :
      ['-loader'],
    }
  ,
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
      new ExtractTextPlugin({
        filename: 'css/[name].css',
      }),
      // expose and write the allowed env vars on the compiled bundle
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        CLIENT: 'chrome',
      }),

      new HtmlWebpackPlugin({
        title: 'Excited Gem | Tabs',
        logotype: 'dev-logo.svg',
        template: path.join(__dirname, 'src', 'tabs.ejs'),
        filename: 'tabs.html',
        favicon: 'src/images/dev-logo.svg',
        chunks: ['tabs'],
      }),
      new WriteFilePlugin(), //Writes files to target directory during development build phase.
      new WebpackBar({profile: true}),
    ],
    devtool: env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : 'cheap-source-map'
  },
/*    {
      entry: path.join(__dirname, 'src', 'manifest.json'),
      output: {
        path: path.join(__dirname, 'chrome'),
        filename: '[name].json',
      },
    },*/
  ]
}

if (env.browserClient === 'firefox' || env.browserClient === 'all') {
  console.log("making firefox build");
  exports.firefoxConfig = [
    {
      context: __dirname,
      entry: {
        tabs: ["@babel/polyfill", path.join(__dirname, 'src', 'scripts', 'TabsApp.js')],
        sessions: ["@babel/polyfill", path.join(__dirname, 'src', 'scripts', 'sessions-container.js')],
        background: path.join(__dirname, 'src', 'scripts', 'background.js')
      },
      output: {
        path: path.join(__dirname, 'firefox'),
        filename: 'js/[name].js',
      },
      module: {
        rules: [
          {
            test: /\.(scss)$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles Sass to CSS
            }]
          },
          {
            test: new RegExp('.(' + images.join('|') + ')$'),
            loader: 'file-loader?name=images/[name].[ext]',
            exclude: /node_modules/,
          },
          {
            test: new RegExp('.(' + fonts.join('|') + ')$'),
            loader: 'file-loader?name=/fonts/[name].[ext]',
            exclude: /node_modules/,
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['stage-3', 'env', 'react'],
            },
          },
        ],
      },
      resolve: {
        alias: alias,
        extensions: fileExtensions.map(extension => '.' + extension).concat(['.jsx', '.js', '.css']),
        modules: ['path.resolve(__dirname, "src")', 'node_modules', path.resolve(__dirname, 'firefox')],
        descriptionFiles: ['package.json'],
        moduleExtensions: ['-loader'],
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
        }),
        new ExtractTextPlugin({
          filename: 'css/[name].css',
        }),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.DefinePlugin(envKeys),
        new webpack.DefinePlugin({
          NODE_ENV: JSON.stringify(env.NODE_ENV)
        }),

        new HtmlWebpackPlugin({
          title: 'Excited Gem | Tabs',
          logotype: env.NODE_ENV === 'development' ? 'dev-logo.svg' : 'logo.svg',
          template: path.join(__dirname, 'src', 'tabs.ejs'),
          filename: 'tabs.html',
          favicon: env.NODE_ENV === 'development' ? 'src/images/dev-logo.svg' : 'src/images/logo.svg',
          chunks: ['tabs'],
        }),
        new HtmlWebpackPlugin({
          title: 'Excited Gem | Sessions',
          logotype: env.NODE_ENV === 'development' ? 'dev-logo.svg' : 'logo.svg',
          template: path.join(__dirname, 'src', 'sessions.ejs'),
          filename: 'sessions.html',
          favicon: env.NODE_ENV === 'development' ? 'src/images/dev-logo.svg' : 'src/images/logo.svg',
          chunks: ['sessions'],
        }),
        new WriteFilePlugin(), //Writes files to target directory during development build phase.
        new WebpackBar({profile: true}),
      ],
    },
/*    {
      entry: path.join(__dirname, 'src', 'manifest.json'),
      output: {
        path: path.join(__dirname, 'firefox'),
        filename: '[name].json',
      },
    },*/
    {devtool: env.NODE_ENV === 'development' ? 'eval-source-map' : 'cheap-source-map'}
  ];
}
