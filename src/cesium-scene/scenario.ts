import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import { AirvehicleManager } from './airvehicle-manager';
import { SimpleGui } from './simple-gui';
import { BackendConnection } from './backend-connection';

export interface ScenarioConfig {
    camera: {
        gps: number[];
        hpr: number[];
    },
    start: string,
    end: string,
    nodes: [
        {
            name: string,
            positions: [
                {
                    time: string,
                    gps: number[],
                }
            ]
        }
    ]
}

export class Scenario {
    constructor() {
        CesiumScene.getInstance();
        const gui = SimpleGui.getInstance();
        const backendConnection = new BackendConnection();
        backendConnection.sendStart(2);

        gui.scenarioLoadCallback = (scenario: ScenarioConfig) => {
            this.loadScenario(scenario);
        };
    }

    loadScenario(scenario: ScenarioConfig) {
        const cscene = CesiumScene.getInstance();
        const avm = AirvehicleManager.getInstance();

        cscene.setView(scenario.camera.gps, scenario.camera.hpr);

        cscene.setTime(scenario.start);
        cscene.setTimeRange(scenario.start, scenario.end);

        scenario.nodes.forEach((node) => {
            console.log(node);

            if (node.positions.length == 1) {
                avm.addAirvehicle({
                    name: node.name,
                    position: new Position({
                        degreePos: node.positions[0].gps
                    })
                });
            } else {
                const timedPosArr = node.positions.map((pos) => {
                    return {
                        time: pos.time,
                        position: new Position({
                            degreePos: pos.gps
                        })
                    };
                });
                avm.addAirvehicle({
                    name: node.name,
                    timedPositions: timedPosArr
                });
            }
        });
    }
}

