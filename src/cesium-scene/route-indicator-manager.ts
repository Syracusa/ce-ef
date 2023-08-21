import { CallbackProperty, Cartesian3, CatmullRomSpline, Color, PolylineGlowMaterialProperty } from "cesium";
import { Airvehicle } from "./airvehicle";
import { AirvehicleManager } from "./airvehicle-manager";
import { CesiumScene } from "./cesium-scene";

class RouteIndicator {
    private readonly cesiumScene = CesiumScene.getInstance();
    private readonly airvehicleManager = AirvehicleManager.getInstance();
    private readonly originator: Airvehicle;
    private readonly target: Airvehicle;

    private static readonly dummyCart3 = new Cartesian3(1, 1, 1);
    
    constructor(originator: Airvehicle, target: Airvehicle) {
        this.originator = originator;
        this.target = target;

        this.cesiumScene.viewer.entities.add({
            polyline: {
                positions:
                    new CallbackProperty(() => {
                        const rtt = this.originator.routingTable;
                        if (!rtt)
                            return [RouteIndicator.dummyCart3, RouteIndicator.dummyCart3];

                        const route = rtt[this.target.index];
                        if (route.path.length < 2){
                            return [RouteIndicator.dummyCart3, RouteIndicator.dummyCart3];
                        }

                        const path = [this.originator.getCurrentPosition().cartesianPos, ...route.path.map((val) => {
                            const intermediateAv = this.airvehicleManager.avList[val];
                            return intermediateAv.getCurrentPosition().cartesianPos;
                        })];

                        const spline = new CatmullRomSpline({
                            times: path.map((r, idx) => idx),
                            points: path
                        });
                
                        const linePosArr = [];
                        for (let i = 0.0; i < path.length - 1; i += 0.1)
                            linePosArr.push(spline.evaluate(i));

                        return linePosArr;
                    }, false),
                width: 10,
                material: new PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Color.fromRandom({ alpha: 0.2 })
                })
            }
        });
    }
}

export class RouteIndicatorManager {
    /* Singleton */
    private static instance: RouteIndicatorManager;
    static getInstance() {
        if (!RouteIndicatorManager.instance)
            RouteIndicatorManager.instance = new RouteIndicatorManager();
        return RouteIndicatorManager.instance;
    }

    private readonly routeIndicatorList: RouteIndicator[] = [];

    public addRouteIndicator(originator: Airvehicle, target: Airvehicle) {
        originator.routingTable.push({
            hopCount: 0,
            path: []
        });
        target.routingTable.push({
            hopCount: 0,
            path: []
        });
        this.routeIndicatorList.push(new RouteIndicator(originator, target));
    }
}