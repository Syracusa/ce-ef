import { Airvehicle } from "./airvehicle";

class RouteIndicator {
    private readonly originator: Airvehicle;
    private readonly target: Airvehicle;

    constructor(originator: Airvehicle, target: Airvehicle) {
        this.originator = originator;
        this.target = target;

        /* Sample code for drawing polyline route */
        // public testSpline() {
        //     const spline = new CatmullRomSpline({
        //         times: this.avList.map((av, idx) => idx),
        //         points: this.avList.map(av => av.getCurrentPosition().cartesianPos)
        //     });
    
        //     const linePosArr = [];
        //     for (let i = 0.0; i < this.avList.length - 1; i += 0.1)
        //         linePosArr.push(spline.evaluate(i));
    
        //     this.cesiumScene.viewer.entities.add({
        //         polyline: {
        //             positions: linePosArr,
        //             width: 10,
        //             material: new PolylineGlowMaterialProperty({
        //                 glowPower: 0.1,
        //                 color: Color.YELLOW
        //             })
        //         }
        //     });
        // }
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
        this.routeIndicatorList.push(new RouteIndicator(originator, target));
    }
}