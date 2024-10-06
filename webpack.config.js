const path = require("path");

const commonConfig = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules|docs|dist/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  mode: "production",
  optimization: {
    minimize: true,
  },
  devtool: "source-map",
};

const esmConfig = {
  ...commonConfig,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "ecmascript-ioc.esm.js",
    library: {
      type: "module",
    },
    clean: true,
  },
  experiments: {
    outputModule: true,
  },
  target: "node",
};

const cjsConfig = {
  ...commonConfig,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "ecmascript-ioc.cjs.js",
    library: {
      type: "commonjs2",
    },
    clean: false,
  },
  target: "node",
};

module.exports = [esmConfig, cjsConfig];
