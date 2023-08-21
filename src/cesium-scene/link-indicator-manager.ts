import { CallbackProperty, Cartesian3, Color, ColorMaterialProperty } from "cesium";
import { CesiumScene } from "./cesium-scene";
import { Airvehicle } from "./airvehicle";

class LinkIndicator {
    private readonly linkIndicatorManager = LinkIndicatorManager.getInstance();

    public av1: Airvehicle;
    public av2: Airvehicle;

    private static readonly dummyCart3 = new Cartesian3(1, 1, 1);

    constructor(av1: Airvehicle, av2: Airvehicle) {
        const cesiumScene = CesiumScene.getInstance();

        this.av1 = av1;
        this.av2 = av2;

        cesiumScene.viewer.entities.add({
            polyline: {
                positions:
                    new CallbackProperty(() => {
                        if (this.linkIndicatorManager.hideView)
                            return [LinkIndicator.dummyCart3, LinkIndicator.dummyCart3];

                        const pos1 = this.av1.getCurrentPosition();
                        const pos2 = this.av2.getCurrentPosition();
                        if (pos1 && pos2)
                            return [pos1.cartesianPos, pos2.cartesianPos];
                        else
                            return [LinkIndicator.dummyCart3, LinkIndicator.dummyCart3];
                    }, false),
                width: 5,
                material: new ColorMaterialProperty(new CallbackProperty(() => {
                    const pos1 = this.av1.getCurrentPosition();
                    const pos2 = this.av2.getCurrentPosition();
                    if (pos1 && pos2) {
                        const distance = pos1.distanceTo(pos2);
                        if (distance < 500)
                            return Color.GREEN.withAlpha(0.5);
                        else if (distance < 1000)
                            return Color.RED.withAlpha(0.5);
                        else 
                            return Color.RED.withAlpha(0);
                    } else {
                        return Color.RED.withAlpha(0);
                    }
                }, false)),
            }
        });
    }
}
export class LinkIndicatorManager {
    /* Singleton */
    private static instance: LinkIndicatorManager;
    static getInstance() {
        if (!LinkIndicatorManager.instance)
            LinkIndicatorManager.instance = new LinkIndicatorManager();
        return LinkIndicatorManager.instance;
    }

    private readonly linkList: LinkIndicator[] = [];
    public hideView = false;

    public addLink(av1: Airvehicle, av2: Airvehicle) {
        this.linkList.push(new LinkIndicator(av1, av2));
    }
}