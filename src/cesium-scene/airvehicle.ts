import {
    Transforms, HeadingPitchRoll, LabelStyle, 
    VerticalOrigin, Cartesian2, Entity,
    Color, PolylineGlowMaterialProperty
} from 'cesium';
import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import DroneModelUri from '../static/Drone.glb';

export interface AirvehicleOptions {
    name?: string;
    position?: Position;
    heading?: number;
}

export class Airvehicle {
    private readonly cesiumScene = CesiumScene.getInstance();
    public position: Position;
    public heading: number;
    public name: string;
    public entity: Entity;

    constructor(options: AirvehicleOptions) {
        console.log('Airvehicle constructor');
        if (options.position) {
            this.position = options.position;
        } else {
            this.position = new Position({
                degreePos: [127.6771, 36.2766, 1390.0]
            });
        }

        if (options.heading) {
            this.heading = options.heading;
        } else {
            this.heading = 0;
        }

        if (options.name) {
            this.name = options.name;
        } else {
            this.name = "AirVehicle";
        }

        this.drawDrone();
    }

    private drawDrone() {
        const orientation = Transforms.headingPitchRollQuaternion(
            this.position.cartesianPos,
            HeadingPitchRoll.fromDegrees(this.heading, 0, 0)
        );

        const heightZeroPos = this.position.clone().updateHeight(0);

        this.entity = this.cesiumScene.viewer.entities.add({
            name: "AirVehicle",
            position: this.position.cartesianPos,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orientation: orientation,
            model: {
                uri: DroneModelUri,
                scale: 15,
                minimumPixelSize : 80,
            },
            label: {
                text: this.name,
                font: "12pt monospace",
                style: LabelStyle.FILL_AND_OUTLINE,
                showBackground: true,
                outlineWidth: 1,
                verticalOrigin: VerticalOrigin.BOTTOM,
                pixelOffset: new Cartesian2(0, -15),
            },
            polyline: {
                positions: [this.position.cartesianPos, heightZeroPos.cartesianPos],
                width: 1,
                material: new PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Color.YELLOW
                })
            }
        });
    }
}