const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const portFinderSync = require('portfinder-sync');
const ip = require('internal-ip');

let mode = 'development';
let target = 'web';

const infoColor = (_message) => {
  return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;
};

const babelOptions = (preset) => {
  const opts = {
    presets: ['@babel/preset-env'],
  };

  if (preset) {
    opts.presets.push(preset);
  }

  return opts;
};

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: babelOptions(),
    },
  ];

  return loaders;
};

const plugins = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src/img/sprite.svg'),
        to: path.resolve(__dirname, 'dist/images'),
      },
    ],
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './src/index.html'),
    minify: true,
  }),
];

if (process.env.NODE_ENV === 'production') {
  mode = 'production';
  target = 'browserslist';
}

if (process.env.SERVE) {
  plugins.push(new ReactRefreshWebpackPlugin());
}

module.exports = {
  mode: mode,
  context: path.resolve(__dirname, 'src'),

  entry: {
    other: ['./js/libs/lib.js'],

    main: ['@babel/polyfill', './js/controller.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'images/[name][hash][ext][query]',
    clean: process.env.NODE_ENV === 'production',
  },

  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: '' },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,

        type: 'asset',

        // parser: {
        //   dataUrlCondition: {
        //     maxSize: 30 * 1024,
        //   },
        // },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      // {
      //   test: /\.jsx?$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {

      //       cacheDirectory: true,
      //     },
      //   },
      // },
    ],
  },

  plugins: plugins,

  target: target,

  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },

  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    port: portFinderSync.getPort(8080),
    watchContentBase: true,
    open: true,
    https: false,
    hot: true,
    useLocalIp: true,
    publicPath: '/',
    disableHostCheck: true,
    overlay: true,
    noInfo: true,
    after: function (app, server, compiler) {
      const port = server.options.port;
      const https = server.options.https ? 's' : '';
      const localIp = ip.v4.sync();
      const domain1 = `http${https}://${localIp}:${port}`;
      const domain2 = `http${https}://localhost:${port}`;

      console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`);
    },
  },
};
