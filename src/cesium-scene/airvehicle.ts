import {
    Transforms, HeadingPitchRoll, LabelStyle,
    VerticalOrigin, Cartesian2, Entity, Cartesian3,
    SampledPositionProperty, JulianDate,
    VelocityOrientationProperty,
    CallbackProperty,
    Color,
    PolylineGlowMaterialProperty
} from 'cesium';
import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import DroneModelUri from '../static/Drone.glb';
import { AirvehicleManager } from './airvehicle-manager';

/* Extend Entity class to add onClick property */
declare module "cesium" {
    interface Entity {
        onClick: () => void;
    }
}

export interface TimedPosition {
    time: string;
    position: Position;
}

export interface AirvehicleOptions {
    name?: string;
    position?: Position;
    timedPositions?: TimedPosition[];
    heading?: number;
    index?: number;
}

export interface RouteEntry {
    hopCount: number;
    path: number[];
}

/**
 * Manage airvehicle entity.
 * Position can be updated by setting position property.
 */
export class Airvehicle {
    private readonly cesiumScene = CesiumScene.getInstance();
    private readonly airvehicleManager = AirvehicleManager.getInstance();
    
    public position: Position | TimedPosition[];
    
    /** Cesium entity of airvehicle */
    public entity: Entity;

    /** Label name of airvehicle */
    public name = "AirVehicle";

    /** Used when position is type of Position */
    public heading = 0;

    /** Node index that unique in this scenario */
    public index = 0;

    /** Routing table of this node */
    public routingTable: RouteEntry[] = [];

    constructor(options: AirvehicleOptions) {
        if (options.position) {
            this.position = options.position;
            if (options.heading)
                this.heading = options.heading;
        } else if (options.timedPositions) {
            this.position = options.timedPositions;
        } else {
            console.error("Airvehicle constructor: position is not defined");
            return null;
        }

        if (options.name)
            this.name = options.name;

        if (options.index)
            this.index = options.index;

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
            }
        });

        this.entity.onClick = () => {
            console.log("Airvehicle onClick");
        }
        this.drawPositionIndicator();
    }

    /** Draw line from airvehicle to ground */
    private drawPositionIndicator() {
        this.cesiumScene.viewer.entities.add({
            polyline: {
                positions:
                    new CallbackProperty(() => {
                        const pos1 = this.getCurrentPosition();
                        if (pos1) {
                            const pos2 = pos1.clone().updateHeight(0);
                            return [pos1.cartesianPos, pos2.cartesianPos];
                        } else {
                            return [new Cartesian3(1, 0, 0), new Cartesian3(1, 0, 0)];
                        }
                    }, false),
                width: 2,
                material: new PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Color.YELLOW
                })
            }
        });
    }

    /**
     * Return current position with current scenario time
     * 
     * @returns Current position of airvehicle
     */
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