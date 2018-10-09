/**
 * @Author: detcx 
 * @Date: 2018-09-30 09:44:59 
 * @Last Modified by: Chosen
 * @Last Modified time: 2018-10-09 17:55:29
 * @description development configuration
 */

const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const happyThreadPool = HappyPack.ThreadPool({size: 7});


module.exports = {
  mode: 'production', // development production
  devtool: false,
  entry: './src/components/index.jsx',
  output: {
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[name].[hash:6].js',
    path: path.resolve(__dirname, 'dist'), // 打包后的目录，必须是绝对路径
    publicPath: '/' // 默认是 '/', 但现在静态资源地址是 dist
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxAsyncRequests: 15,
      maxInitialRequests: 10,
      automaticNameDelimiter: '-',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial' // 只打包初始时依赖的第三方
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
        test: /\.jsx?/,
        exclude: path.resolve(__dirname, 'node_modules'),
        // use: 'babel-loader'
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
    open: true,
    port: '8050',
    hot: true,
    https: false,
    publicPath: '/',
    contentBase: path.resolve(__dirname, 'dist'),
    host: 'localhost',
    disableHostCheck: true,
    historyApiFallback: true
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.es6'],
    mainFields: ['main']
  },

  plugins: [
    new DllReferencePlugin({
      manifest: require('./dist/dll/react.manifest.json')
    }),
    new DllReferencePlugin({
      manifest: require('./dist/dll/polyfill.manifest.json')
    }),
    new DllReferencePlugin({
      manifest: require('./dist/dll/echarts.manifest.json')
    }),
    // 多进程
    new HappyPack({
      id: 'jsx',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'cssNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader'
      ],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'lessNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader',
        'less-loader'
      ],
      threadPool: happyThreadPool
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
      threadPool: happyThreadPool
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
      threadPool: happyThreadPool
    }),

    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].hash[hash:6].css', // 供应商(vendor)样式文件
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'Oh-webpack-happy',
      favicon: __dirname + '/src/favicon.ico',
      template: __dirname + '/template/index.html'
    }),
    new CleanWebpackPlugin(['dist'], {exclude: ['dll']}),
    /* // 使用 ParallelUglifyPlugin 并行压缩 js
    new ParallelUglifyPlugin({
      // workerCount: 7,
      uglifyJS: {
        output: {
          beautify: false,
          comments: false
        },
        compress: {
          warnings: false,
          drop_console: true,
          collapse_vars: true,
          reduce_vars: true
        }
      }
    }), */
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
