import { CallbackProperty, Cartesian3, CatmullRomSpline, Color, PolylineArrowMaterialProperty, PolylineGlowMaterialProperty } from "cesium";
import { Airvehicle } from "./airvehicle";
import { AirvehicleManager } from "./airvehicle-manager";
import { CesiumScene } from "./cesium-scene";

class RouteIndicator {
    private readonly cesiumScene = CesiumScene.getInstance();
    private readonly airvehicleManager = AirvehicleManager.getInstance();
    private readonly originator: Airvehicle;
    private readonly target: Airvehicle;

    private static readonly dummyCart3 = new Cartesian3(1, 1, 1);
    private static readonly dummyLinePositions = [RouteIndicator.dummyCart3, RouteIndicator.dummyCart3];

    constructor(originator: Airvehicle, target: Airvehicle) {
        this.originator = originator;
        this.target = target;

        this.cesiumScene.viewer.entities.add({
            polyline: {
                positions:
                    new CallbackProperty(() => {
                        /* Print route only if the originator is picked */
                        if (this.originator.entity.id != this.cesiumScene.pickedId)
                            return RouteIndicator.dummyLinePositions;

                        const rtt = this.originator.routingTable;
                        if (!rtt)
                            return RouteIndicator.dummyLinePositions;

                        const route = rtt[this.target.index];
                        if (!route || route.path.length < 1)
                            return RouteIndicator.dummyLinePositions;
                        
                        /* Draw only if the target is an edge node */
                        if (!this.originator.edgeNodeIdxList.includes(this.target.index))
                            return RouteIndicator.dummyLinePositions;

                        const originatorPos = this.originator.getCurrentPosition();
                        if (!originatorPos)
                            return RouteIndicator.dummyLinePositions;

                        let posfail = false;
                        const path = [originatorPos.cartesianPos, ...route.path.map((val) => {
                            const intermediateAv = this.airvehicleManager.avList[val];
                            const intermediateAvPos = intermediateAv.getCurrentPosition();
                            if (!intermediateAvPos){
                                posfail = true;
                                return RouteIndicator.dummyCart3;
                            }
                            return intermediateAvPos.cartesianPos;
                        })];

                        if (posfail)
                            return RouteIndicator.dummyLinePositions;

                        const spline = new CatmullRomSpline({
                            times: path.map((r, idx) => idx),
                            points: path
                        });
                
                        const linePosArr = [];
                        for (let i = 0.0; i < path.length - 1.05; i += 0.1)
                            linePosArr.push(spline.evaluate(i));

                        return linePosArr;
                    }, false),
                width: 10,
                material: new PolylineArrowMaterialProperty(Color.fromRandom({ alpha: 0.8 }))
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