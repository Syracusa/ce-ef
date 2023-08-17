import { CallbackProperty, Cartesian3, Color } from "cesium";
import { CesiumScene } from "./cesium-scene";
import { Position } from "./position";
import { Airvehicle } from "./airvehicle";

class UpdatableLine {
    public position1: Position;
    public position2: Position;

    private static readonly dummyCart3 = new Cartesian3(1, 1, 1);

    constructor(position1: Position, position2: Position) {
        const cesiumScene = CesiumScene.getInstance();

        this.position1 = position1;
        this.position2 = position2;

        cesiumScene.viewer.entities.add({
            polyline: {
                positions:
                    new CallbackProperty(() => {
                        if (this.position1 && this.position2)
                            return [this.position1.cartesianPos, this.position2.cartesianPos];
                        else 
                            return [UpdatableLine.dummyCart3, UpdatableLine.dummyCart3];
                    }, false),
                width: 5,
                material: Color.RED.withAlpha(0.5),
            }
        });
    }
}

type Link = {
    av1: Airvehicle,
    av2: Airvehicle,
    line: UpdatableLine
};

export class LinkIndicatorManager {
    private static instance: LinkIndicatorManager;

    static getInstance() {
        if (!LinkIndicatorManager.instance)
        LinkIndicatorManager.instance = new LinkIndicatorManager();
        return LinkIndicatorManager.instance;
    }

    private readonly linkList: Link[] = [];

    constructor() {
        this.startPeriodicUpdate();
    }

    private async startPeriodicUpdate() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.update();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private update() {
        this.linkList.forEach((link) => {
            link.line.position1 = link.av1.getCurrentPosition();
            link.line.position2 = link.av2.getCurrentPosition();
        });
    }

    public addLink(av1: Airvehicle, av2: Airvehicle) {
        this.linkList.push({
            av1: av1,
            av2: av2,
            line: new UpdatableLine(av1.getCurrentPosition(), av2.getCurrentPosition())
        });
    }
}