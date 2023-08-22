import { CesiumScene } from './cesium-scene';
import { Position } from './position';
import { AirvehicleManager } from './airvehicle-manager';
import { SimpleGui } from './simple-gui';
import { BackendConnection } from './backend-connection';
import { LinkIndicatorManager } from './link-indicator-manager';

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
    private readonly backendConnection = BackendConnection.getInstance();
    private readonly cesiumScene = CesiumScene.getInstance();
    private readonly airvehicleManager = AirvehicleManager.getInstance();
    private readonly linkIndicatorManager = LinkIndicatorManager.getInstance();

    constructor() {
        CesiumScene.getInstance();
        const gui = SimpleGui.getInstance();

        gui.scenarioLoadCallback = (scenario: ScenarioConfig) => {
            this.loadScenario(scenario);
        };
        gui.linkViewToggleCallback = () => {
            this.linkIndicatorManager.hideView = !this.linkIndicatorManager.hideView;
        };
    }

    private loadScenario(scenario: ScenarioConfig) {
        this.cesiumScene.setView(scenario.camera.gps, scenario.camera.hpr);

        this.cesiumScene.setTime(scenario.start);
        this.cesiumScene.setTimeRange(scenario.start, scenario.end);

        scenario.nodes.forEach((node) => {
            if (node.positions.length == 1) {
                this.airvehicleManager.addAirvehicle({
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
                this.airvehicleManager.addAirvehicle({
                    name: node.name,
                    timedPositions: timedPosArr
                });
            }
        });

        this.startSimulation(scenario.nodes.length);
    }

    private async startSimulation(nodeNum: number) {
        while (!this.backendConnection.isConnected) {
            console.log('Backend is not connected');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.backendConnection.sendStart(nodeNum);
    }
}

