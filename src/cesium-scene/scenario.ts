import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import { AirvehicleManager } from './arivehicle-manager';

export class Scenario {
    constructor() {
        CesiumScene.getInstance();
        const avm = AirvehicleManager.getInstance();

        avm.addAirvehicle({
            name: "Node0",
            position: new Position({
                degreePos: [127.6771, 36.2766, 300.0]
            }),
            heading: 0
        });
        avm.addAirvehicle({
            name: "Node1",
            position: new Position({
                degreePos: [127.6671, 36.2866, 400.0]
            }),
            heading: 0
        });
    }
}