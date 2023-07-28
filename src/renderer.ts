import './index.css';

import { Viewer, Terrain } from 'cesium';

new Viewer('cesiumContainer', {
    terrain: Terrain.fromWorldTerrain(),
});