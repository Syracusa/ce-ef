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
    /* When importing from an npm package, this option will 
       determine which files in its node_modules are checked. */
    mainFiles: ['cesium'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
