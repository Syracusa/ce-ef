import {
    ArcGISTiledElevationTerrainProvider,
    BingMapsImageryProvider,
    EllipsoidTerrainProvider,
    OpenStreetMapImageryProvider,
    ProviderViewModel,
    buildModuleUrl
} from "cesium";
import { ARCGIS_API_KEY, BING_API_KEY } from "../../private-key";

export class CesiumProviderHelper {
    static localOsmImageryProviderUrl = 'http://localhost:8080/tile/';
    static localSampleTerrainProviderUrl = 'http://localhost:8000/tilesets/dem';
    static localSampleImageryProviderUrl = 'http://localhost:8000/trueortho/';
    static localSample3dTileConfJsonUrl = 'http://localhost:8000/3dtile/sample.3d.tileset.json';

    static getLocalOSMProviderViewModel() {
        return new ProviderViewModel({
            name: 'LocalOpenStreetMap',
            iconUrl: buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
            tooltip: 'Local OpenStreetMap Server on '
                + CesiumProviderHelper.localOsmImageryProviderUrl,
            creationFunction: function () {
                return new OpenStreetMapImageryProvider({
                    url: CesiumProviderHelper.localOsmImageryProviderUrl
                });
            }
        });
    }

    static getBingMapProviderViewModel() {
        return new ProviderViewModel({
            name: 'Bing Maps',
            iconUrl: buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip: 'Bing Maps aerial imagery with labels from bing.com',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            creationFunction: function () {
                return BingMapsImageryProvider.fromUrl(
                    'https://dev.virtualearth.net', {
                    key: BING_API_KEY
                });
            }
        });
    }

    static getEillipsoidProviderViewModel() {
        return new ProviderViewModel({
            name: 'WGS84(No terrain)',
            iconUrl: buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
            tooltip: 'WGS84 Ellipsoid - No Terrain',
            creationFunction: function () {
                return new EllipsoidTerrainProvider();
            }
        });
    }

    static getArcGisTerrainProviderViewModel() {
        return new ProviderViewModel({
            name: 'ArcGIS World Terrain',
            iconUrl: buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
            tooltip: 'ArcGIS World Terrain',
            creationFunction: function () {
                return ArcGISTiledElevationTerrainProvider.fromUrl(
                    'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
                    { token: ARCGIS_API_KEY }
                );
            }
        });
    }
}
