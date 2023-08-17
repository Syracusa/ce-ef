import { Viewer, Math, Cartesian3, JulianDate } from 'cesium';
import { CesiumProviderHelper } from './provider-helper';

export class CesiumScene {
    private static instance: CesiumScene;

    static getInstance() {
        if (!CesiumScene.instance) {
            console.log("CesiumScene is created");
            CesiumScene.instance = new CesiumScene();
            console.log(CesiumScene.instance);
        }
        return CesiumScene.instance;
    }

    public LOGGING_CAMERA_POSITION = false;
    static readonly USE_SCENARIO_CONTROL_WIDGET = true;

    public readonly viewer = new Viewer("cesiumContainer", {
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

    public readonly scene = this.viewer.scene;
    public readonly camera = this.viewer.camera;
    public readonly globe = this.viewer.scene.globe;
    public readonly clockViewModel = this.viewer.clockViewModel;
    public readonly clock = this.clockViewModel.clock;
    public readonly timeline = this.viewer.timeline;

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
        console.log('CesiumScene constructor');
        this.init();
        this.cameraPositionLoggingStart();
        this.camera.setView(this.defaultCameraViewOption);
    }

    private init() {
        const creditElem =
        document.getElementsByClassName("cesium-widget-credits")[0] as HTMLElement;
        const animationContainerElem =
        document.getElementsByClassName("cesium-viewer-animationContainer")[0] as HTMLElement;
        const timelineContainerElem =
        document.getElementsByClassName("cesium-viewer-timelineContainer")[0] as HTMLElement;
        
        creditElem.style.visibility = "hidden";

        if (!CesiumScene.USE_SCENARIO_CONTROL_WIDGET) {
            animationContainerElem.style.visibility = "hidden";
            timelineContainerElem.style.visibility = "hidden";
        }

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

    public setView(gps: number[], hpr: number[]) {
        this.camera.setView({
            destination: Cartesian3.fromDegrees(gps[0], gps[1], gps[2]),
            orientation: {
                heading: Math.toRadians(hpr[0]),
                pitch: Math.toRadians(hpr[1]),
                roll: Math.toRadians(hpr[2])
            }
        });
    }

    public setTime(time: string) {
        const clock = this.clockViewModel.clock;
        clock.currentTime = JulianDate.fromIso8601(time);
    }

    public setTimeRange(start: string, end: string) {
        const timeline = this.timeline;
        timeline.zoomTo(
            JulianDate.fromIso8601(start),
            JulianDate.fromIso8601(end)
        );
    }
}