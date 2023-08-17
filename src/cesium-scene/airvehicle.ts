import {
    Transforms, HeadingPitchRoll, LabelStyle,
    VerticalOrigin, Cartesian2, Entity, Cartesian3,
    SampledPositionProperty, JulianDate,
    VelocityOrientationProperty
} from 'cesium';
import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import DroneModelUri from '../static/Drone.glb';

export interface TimedPosition {
    time: string;
    position: Position;
}

export interface AirvehicleOptions {
    name?: string;
    position?: Position;
    timedPositions?: TimedPosition[];
    heading?: number;
}

export class Airvehicle {
    private readonly cesiumScene = CesiumScene.getInstance();
    public position: Position | TimedPosition[];
    public heading: number;
    public name: string;
    public entity: Entity;

    constructor(options: AirvehicleOptions) {
        console.log('Airvehicle constructor');
        if (options.position) {
            this.position = options.position;
        } else if (options.timedPositions) {
            this.position = options.timedPositions;
        } else {
            console.log("Airvehicle constructor: position is not defined");
            return null;
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
        let position: Cartesian3 | SampledPositionProperty;
        let orientation;
        if (this.position instanceof Position) {
            position = this.position.cartesianPos;
            orientation = Transforms.headingPitchRollQuaternion(
                position,
                HeadingPitchRoll.fromDegrees(this.heading, 0, 0)
            );
        } else {
            const posprop = new SampledPositionProperty();
            this.position.forEach((timedPos) => {
                const time = JulianDate.fromIso8601(timedPos.time);
                const pos = timedPos.position.cartesianPos;
                posprop.addSample(time, pos);
            });
            position = posprop;
            orientation = new VelocityOrientationProperty(posprop);
        }

        console.log(position, orientation);

        this.entity = this.cesiumScene.viewer.entities.add({
            name: "AirVehicle",
            position: position,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orientation: orientation,
            model: {
                uri: DroneModelUri,
                scale: 15,
                minimumPixelSize: 80,
            },
            label: {
                text: this.name,
                font: "12pt monospace",
                style: LabelStyle.FILL_AND_OUTLINE,
                showBackground: true,
                outlineWidth: 1,
                verticalOrigin: VerticalOrigin.BOTTOM,
                pixelOffset: new Cartesian2(0, -30),
            },
            /* TODO
            polyline: {
                positions: [this.position.cartesianPos, heightZeroPos.cartesianPos],
                width: 1,
                material: new PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Color.YELLOW
                })
            }
            */
        });
    }

    public getCurrentPosition(): Position {
        if (this.position instanceof Position) {
            return this.position;
        } else {
            const cartPos = this.entity.position.getValue(this.cesiumScene.clock.currentTime);
            if (cartPos)
                return new Position({ cartesianPos: cartPos });
            else
                return null;
        }
    }
}