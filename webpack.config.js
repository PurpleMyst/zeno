const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const banner = fs.readFileSync("./src/userscript_header.js").toString();

module.exports = {
  entry: "./src/main.ts",
  mode: "production",
  output: {
    filename: "userscript.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
      raw: true,
    }),
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.css$/, type: "asset/source" },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: function (_, { value }) {
              if (value === " ==UserScript==") {
                this.inside = true;
                return true;
              } else if (value === " ==/UserScript==") {
                this.inside = false;
                return true;
              } else {
                return !!this.inside;
              }
            },
          },
        },
      }),
    ],
  },
};
