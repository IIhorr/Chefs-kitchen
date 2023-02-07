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
  // new CopyWebpackPlugin({
  //   patterns: [
  //     {
  //       from: path.resolve(__dirname, 'src/IgorCV.png'),
  //       to: path.resolve(__dirname, 'dist'),
  //     },
  //     {
  //       from: path.resolve(__dirname, 'src/assets/portfolio'),
  //       to: path.resolve(__dirname, 'dist/images'),
  //     },
  //     {
  //       from: path.resolve(__dirname, 'src/fonts'),
  //       to: path.resolve(__dirname, 'dist/fonts'),
  //     },
  //   ],
  // }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './src/index.html'),
    minify: true,
  }),
];

if (process.env.NODE_ENV === 'production') {
  mode = 'production';
  // Temporary workaround for 'browserslist' bug that is being patched in the near future
  target = 'browserslist';
}

if (process.env.SERVE) {
  // We only want React Hot Reloading in serve mode
  plugins.push(new ReactRefreshWebpackPlugin());
}

module.exports = {
  // mode defaults to 'production' if not set
  mode: mode,
  context: path.resolve(__dirname, 'src'),

  // This is unnecessary in Webpack 5, because it's the default.
  // However, react-refresh-webpack-plugin can't find the entry without it.
  entry: {
    main: ['@babel/polyfill', '@/js/controller.js'],
    // other: '@/js/vendors/inert.js',
  },
  output: {
    // output path is required for `clean-webpack-plugin`
    path: path.resolve(__dirname, 'dist'),
    // this places all images processed in an image folder
    assetModuleFilename: 'images/[name][hash][ext][query]',
    clean: true,
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
            // This is required for asset imports in CSS, such as url()
            options: { publicPath: '' },
          },
          'css-loader',
          'postcss-loader',
          // according to the docs, sass-loader should be at the bottom, which
          // loads it first to avoid prefixes in your sourcemaps and other issues.
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        /**
         * The `type` setting replaces the need for "url-loader"
         * and "file-loader" in Webpack 5.
         *
         * setting `type` to "asset" will automatically pick between
         * outputing images to a file, or inlining them in the bundle as base64
         * with a default max inline size of 8kb
         */
        type: 'asset',

        /**
         * If you want to inline larger images, you can set
         * a custom `maxSize` for inline like so:
         */
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
      //     // without additional settings, this will reference .babelrc
      //     loader: 'babel-loader',
      //     options: {
      //       /**
      //        * From the docs: When set, the given directory will be used
      //        * to cache the results of the loader. Future webpack builds
      //        * will attempt to read from the cache to avoid needing to run
      //        * the potentially expensive Babel recompilation process on each run.
      //        */
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
      '@img': path.resolve(__dirname, 'src/img'),
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // required if using webpack-dev-server
  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    port: portFinderSync.getPort(8080),
    watchContentBase: true,
    open: true,
    https: false,
    hot: true,
    useLocalIp: true,
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
