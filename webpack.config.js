const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

module.exports = {
  entry: "./src/main.js",
  mode: "development",
  output: {
    filename: "userscript.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync("./src/userscript_header.js").toString(),
      raw: true,
    }),
  ],
};
