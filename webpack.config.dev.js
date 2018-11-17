const os = require('os');
const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HappyThreadPool = HappyPack.ThreadPool({size: os.cpus().length - 1});


module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.jsx',
  output: {
    filename: 'js/[name].bundle[hash:6].js',
    chunkFilename: 'js/[name][chunkhash:6].js', // production: name -> id
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  optimization: {
    /* minimizer: [ // production 启用多进程压缩
      new UglifyJsPlugin({
        cache: path.resolve(__dirname, 'dist/cache'),
        parallel: os.cpus().length - 1
      })
    ], */
    splitChunks: {
      name: true,
      chunks: 'all',
      maxAsyncRequests: 15,
      maxInitialRequests: 10,
      automaticNameDelimiter: '-',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial' // 打包初始时依赖的第三方
        },
        antDesign: {
          name: 'chunk-antd',
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          priority: 20,
          chunks: 'initial'
        },
        lodash: {
          name: 'chunk-lodash',
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          priority: 30,
          chunks: 'initial'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|es6)$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: 'happypack/loader?id=jsx'
      },
      /* node_modules 引入的样式不需要模块化 */
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=cssNodeModules'
        ]
      },
      {
        test: /\.less$/,
        include: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=lessNodeModules'
        ]
      },
      /* 非 node_modules 样式模块化 */
      {
        test: /\.css$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=cssExcNodeModules'
        ]
      },
      {
        test: /\.less$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=lessExcNodeModules'
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: 'file-loader',
              limit: 8192,
              name: '[name][hash:4].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },

  devServer: {
    hot: true,
    open: true,
    https: false,
    port: '8051',
    publicPath: '/',
    host: 'localhost',
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.es6'],
    mainFields: ['main']
  },

  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dist/dll/react.manifest.json')
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./dist/dll/polyfill.manifest.json')
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./dist/dll/echarts.manifest.json')
    }),
    // 多进程
    new HappyPack({
      id: 'jsx',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'cssNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader'
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'lessNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader',
        'less-loader'
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'cssExcNodeModules',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[local]-[hash:base64:4]'
          }
        },
        'postcss-loader',
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'lessExcNodeModules',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 2,
            localIdentName: '[local]-[hash:base64:4]'
          }
        },
        'postcss-loader',
        'less-loader'
      ],
      threadPool: HappyThreadPool
    }),

    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name][contenthash:6].css',
      chunkFilename: 'css/[id][contenthash:6].css', // 供应商(vendor)样式文件
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'webpack-happy',
      favicon: __dirname + '/favicon.ico',
      template: __dirname + '/index.html'
    }),
    new CleanWebpackPlugin(['dist'], {exclude: ['dll']}), // 清理时排除 dist/dll
    new CopyWebpackPlugin([
      {
        from: 'src/fonts/',
        to: 'fonts/[name].[ext]',
        toType: 'template'
      },
      {
        from: 'src/css/',
        to: 'css/[name].[ext]',
        toType: 'template'
      }
    ])
  ]
}
