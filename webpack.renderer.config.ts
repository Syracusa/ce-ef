import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

import * as path from 'path';

const cesiumSource = 'node_modules/cesium/Source';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, cesiumSource)
    },
    mainFiles: ['Cesium'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
