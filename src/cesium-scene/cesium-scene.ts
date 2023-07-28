
import { Viewer, Math, Cartesian3 } from 'cesium';
import { CesiumProviderHelper } from './provider-helper';

export class CesiumScene {
    public LOGGING_CAMERA_POSITION = false;

    private readonly viewer = new Viewer("cesiumContainer", {
        imageryProviderViewModels: [
            CesiumProviderHelper.getLocalOSMProviderViewModel(),
            CesiumProviderHelper.getBingMapProviderViewModel()
        ],
        terrainProviderViewModels: [
            CesiumProviderHelper.getEillipsoidProviderViewModel(),
            CesiumProviderHelper.getArcGisTerrainProviderViewModel()
        ],
        baseLayerPicker: true,
        geocoder: false,
    });

    private readonly scene = this.viewer.scene;
    private readonly camera = this.viewer.camera;
    private readonly globe = this.viewer.scene.globe;
    private readonly clockViewModel = this.viewer.clockViewModel;
    private readonly timeline = this.viewer.timeline;

    constructor() {
        this.init();
        this.cameraPositionLoggingStart();
        this.camera.setView({
            /* Camera GPS Position */
            destination: Cartesian3.fromDegrees(127.6771, 36.2766, 1390.0),
            /* Camera Angle */
            orientation: {
                heading: Math.toRadians(30.59),
                pitch: Math.toRadians(-24.61),
                roll: Math.toRadians(0.001)
            }
        });
    }

    private init() {
        const creditElem =
            document.getElementsByClassName("cesium-widget-credits")[0];
        const animationContainerElem =
            document.getElementsByClassName("cesium-viewer-animationContainer")[0];
        const timelineContainerElem =
            document.getElementsByClassName("cesium-viewer-timelineContainer")[0];

        (creditElem as HTMLElement).style.visibility = "hidden";
        (animationContainerElem as HTMLElement).style.visibility = "hidden";
        (timelineContainerElem as HTMLElement).style.visibility = "hidden";
    }

    private cameraPositionLoggingStart() {
        setInterval(() => {
            if (this.LOGGING_CAMERA_POSITION)
                this.logCameraPosition();
        }, 4000);
    }

    /* Log camera angle and position */
    private logCameraPosition() {
        console.log(
            'Cam Heading : ' + Math.toDegrees(this.camera.heading),
            'Cam pitch : ' + Math.toDegrees(this.camera.pitch),
            'Cam roll : ' + Math.toDegrees(this.camera.roll)
        );
        const camPosCart = this.camera.positionCartographic;
        console.log(
            'Cam longitude : ' + camPosCart.longitude * 180 / Math.PI,
            'Cam latitude : ' + camPosCart.latitude * 180 / Math.PI,
            'Cam height : ' + camPosCart.height
        );
    }
}