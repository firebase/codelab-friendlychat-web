const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/scripts'),
  },
  mode: 'development',
  optimization: {
    usedExports: true, // tells webpack to tree-shake
  },
};