import { CesiumScene } from './cesium-scene';
import { Airvehicle } from './airvehicle';
import { Position } from './position';

export class Scenario {
    constructor() {
        CesiumScene.getInstance();
        new Airvehicle({
            name: "AirVehicle",
            position: new Position({
                degreePos: [127.6771, 36.2766, 1000.0]
            }),
            heading: 0
        });
    }
}