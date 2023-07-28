
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
        fullscreenButton: false,
        baseLayerPicker: true,
        geocoder: false,
    });

    private readonly scene = this.viewer.scene;
    private readonly camera = this.viewer.camera;
    private readonly globe = this.viewer.scene.globe;
    private readonly clockViewModel = this.viewer.clockViewModel;
    private readonly timeline = this.viewer.timeline;

    private readonly creditElem =
        document.getElementsByClassName("cesium-widget-credits")[0] as HTMLElement;
    private readonly animationContainerElem =
        document.getElementsByClassName("cesium-viewer-animationContainer")[0] as HTMLElement;
    private readonly timelineContainerElem =
        document.getElementsByClassName("cesium-viewer-timelineContainer")[0] as HTMLElement;


    private readonly defaultCameraViewOption = {
        /* Camera GPS Position */
        destination: Cartesian3.fromDegrees(127.6771, 36.2766, 1390.0),
        /* Camera Angle */
        orientation: {
            heading: Math.toRadians(30.59),
            pitch: Math.toRadians(-24.61),
            roll: Math.toRadians(0.001)
        }
    }

    constructor() {
        this.init();
        this.cameraPositionLoggingStart();
        this.camera.setView(this.defaultCameraViewOption);
    }

    private init() {
        this.creditElem.style.visibility = "hidden";
        this.animationContainerElem.style.visibility = "hidden";
        this.timelineContainerElem.style.visibility = "hidden";

        this.overrideHomeButtonAction();
    }

    private overrideHomeButtonAction() {
        this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
            (e) => {
                e.cancel = true;
                this.camera.flyTo(this.defaultCameraViewOption);
            });
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