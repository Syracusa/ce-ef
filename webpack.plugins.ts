import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line import/default
import CopyPlugin from "copy-webpack-plugin";

import * as path from 'path';
import webpack from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyPlugin({
    patterns: [
      { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
      { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
      { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
      { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
    ],
  }),
  new webpack.DefinePlugin({
    // Define relative base path in cesium for loading assets
    CESIUM_BASE_URL: JSON.stringify('')
})
];
